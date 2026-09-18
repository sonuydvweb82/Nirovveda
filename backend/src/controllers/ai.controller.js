const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../middleware/error");

// Proxy request to the Python AI service.
// Falls back to a local rule-based assessment if the AI service is unreachable.
const callAI = async (path, body, timeoutMs = 15000) => {
  const base = process.env.AI_SERVICE_URL || "http://localhost:8000";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new AppError(`AI service error: ${res.status}`, res.status);
    }
    const json = await res.json();
    return { provider: "fastapi", ...json };
  } catch (e) {
    clearTimeout(timer);
    if (e.name === "AbortError") {
      throw new AppError("AI service timed out.", 504);
    }
    throw e;
  }
};

const mapToNirovveda = (result, key) => ({
  provider: result.provider,
  key,
  title: result.title,
  riskLevel: result.risk_level,
  confidence: result.confidence,
  score: result.score,
  reasons: result.reasons,
  flags: result.flags,
  recommendations: result.recommendations,
  disclaimer: "AI output is advisory and does not replace professional medical diagnosis.",
});

const triage = asyncHandler(async (req, res) => {
  const { age, gender, symptoms, vitals, chronicConditions } = req.body;
  if (!symptoms || symptoms.length === 0) {
    throw new AppError("At least one symptom is required.", 400);
  }

  let result;
  try {
    const aiRes = await callAI("/triage", {
      age,
      gender,
      symptoms,
      vitals: vitals || {},
      chronicConditions: chronicConditions || [],
    });
    result = mapToNirovveda(aiRes, "triage");
  } catch (e) {
    console.warn("AI service unavailable, using rule-based fallback:", e.message);
    result = ruleBasedTriage({ age, symptoms, vitals: vitals || {}, chronicConditions: chronicConditions || [] });
  }

  res.json({ success: true, data: result });
});

const ruleBasedTriage = ({ age, symptoms, vitals, chronicConditions }) => {
  let score = 0;
  const reasons = [];
  const flags = [];

  const addReason = (msg) => { if (reasons.length < 3) reasons.push(msg); return msg; };

  // Emergency red-flag symptoms
  const redFlags = ["chest pain", "severe breathlessness", "unconscious", "no breathing", "seizure", "stroke", "paralysis", "heavy bleeding", "suicidal"];
  // High-risk symptoms
  const highFlags = ["shortness of breath", "high fever", "vomiting", "dizziness", "abdominal pain", "blood in stool", "blood in urine", "fast heartbeat"];
  const moderateFlags = ["cough", "headache", "fatigue", "body ache", "fever", "rash", "throat pain", "back pain"];

  const symList = (symptoms || []).map((s) => String(s).toLowerCase());

  for (const f of redFlags) {
    if (symList.some((s) => s.includes(f))) {
      score += 10;
      flags.push({ code: "RED_FLAG", message: `Red-flag symptom "${f}" present.` });
    }
  }
  for (const f of highFlags) {
    if (symList.some((s) => s.includes(f))) score += 5;
  }
  for (const f of moderateFlags) {
    if (symList.some((s) => s.includes(f))) score += 1;
  }

  // Vitals
  const v = vitals || {};
  if (v) {
    if (v.temperature != null && v.temperature > 39.5) { score += 6; addReason("Very high fever (>39.5°C)."); }
    else if (v.temperature != null && v.temperature > 38) { score += 3; }
    const hr = v.heartRate;
    if (hr != null && (hr > 120 || hr < 50)) { score += 5; addReason(`Abnormal heart rate (${hr}).`); }
    const bpS = v.bpSystolic;
    if (bpS != null && bpS >= 180) { score += 8; addReason(`Very high blood pressure (${bpS}).`); }
    else if (bpS != null && bpS >= 140) { score += 3; }
    const o2 = v.oxygenSaturation;
    if (o2 != null && o2 < 90) { score += 10; addReason(`Dangerously low oxygen saturation (${o2}%).`); }
    else if (o2 != null && o2 < 94) { score += 5; }
  }

  // Age
  if (age != null) {
    if (age < 2 || age >= 75) score += 3;
    else if (age >= 60) score += 2;
  }

  // Chronic conditions
  const chronics = chronicConditions || [];
  if (chronics.length > 0) score += 2;

  // Map score to risk
  let riskLevel, title, recommendations, confidence;
  if (score >= 12) {
    riskLevel = "EMERGENCY";
    title = "Emergency — immediate medical attention advised";
    recommendations = ["Escalate immediately to the nearest emergency-capable facility", "Follow facility emergency protocol without delay", "Do not wait for a routine appointment"];
    confidence = 0.92;
  } else if (score >= 8) {
    riskLevel = "HIGH";
    title = "High risk — needs prompt professional review";
    recommendations = ["Priority appointment or immediate doctor review recommended", "Alert the on-duty health worker/doctor", "Consider referral to a higher facility if specialist care is needed"];
    confidence = 0.86;
  } else if (score >= 4) {
    riskLevel = "MODERATE";
    title = "Moderate risk — schedule a consultation";
    recommendations = ["Book an appointment within 24–48 hours", "Monitor vitals and symptoms", "Return to the facility if symptoms worsen"];
    confidence = 0.78;
  } else {
    riskLevel = "LOW";
    title = "Low risk — routine care";
    recommendations = ["Routine consultation can be scheduled", "Home care and hydration if advised by a health worker", "Re-evaluate if symptoms persist beyond a few days"];
    confidence = 0.72;
  }

  return {
    title,
    risk_level: riskLevel,
    confidence,
    score,
    reasons,
    flags,
    recommendations,
    disclaimer: "AI output is advisory and does not replace professional medical diagnosis.",
  };
};

const patientSummary = asyncHandler(async (req, res) => {
  const { patientId } = req.body;
  if (!patientId) throw new AppError("patientId is required.", 400);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { name: true } },
      medicalRecords: { orderBy: { createdAt: "desc" }, take: 15 },
      vitals: { orderBy: { recordedAt: "desc" }, take: 10 },
      prescriptions: { orderBy: { createdAt: "desc" }, take: 10 },
      diagnosticTests: { orderBy: { requestedAt: "desc" }, take: 10 },
      referrals: { orderBy: { createdAt: "desc" }, take: 10 },
      followUps: { orderBy: { scheduledFor: "desc" }, take: 10 },
    },
  });
  if (!patient) throw new AppError("Patient not found.", 404);

  try {
    const aiRes = await callAI("/patient-summary", {
      patientId: patient.id,
      patientInfo: {
        name: patient.user.name,
        age: patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : null,
        gender: patient.gender,
        chronicConditions: patient.chronicConditions,
      },
      records: patient.medicalRecords,
      vitals: patient.vitals,
      prescriptions: patient.prescriptions,
      diagnostics: patient.diagnosticTests,
      referrals: patient.referrals,
    });
    res.json({
      success: true,
      data: {
        provider: aiRes.provider,
        summary: aiRes.summary || aiRes.data?.summary,
        highlights: aiRes.highlights || aiRes.data?.highlights,
        disclaimer: "AI summary is advisory and generated from structured records for clinician reference.",
      },
    });
  } catch (e) {
    console.warn("AI service unavailable for summary, using rule-based:", e.message);
    const summary = buildLocalSummary(patient);
    res.json({ success: true, data: { provider: "rule-based-fallback", ...summary } });
  }
});

const buildLocalSummary = (patient) => {
  const chronic = patient.chronicConditions?.length ? patient.chronicConditions.join(", ") : "none recorded";
  const latestVitals = patient.vitals?.[0];
  const recordsCount = patient.medicalRecords?.length || 0;
  const prescriptionCount = patient.prescriptions?.length || 0;
  const activeReferral = patient.referrals?.find((r) => ["CREATED", "ACCEPTED", "PENDING"].includes(r.status));

  return {
    summary: `${patient.user.name}${patient.dateOfBirth ? `, age ~${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}` : ""}, ${patient.gender || "gender not recorded"}. Chronic conditions: ${chronic}. ${recordsCount} medical record(s), ${prescriptionCount} prescription(s) on file.` +
      (latestVitals ? ` Latest vitals: BP ${latestVitals.bpSystolic || "—"}/${latestVitals.bpDiastolic || "—"}, HR ${latestVitals.heartRate || "—"}, O2 ${latestVitals.oxygenSaturation || "—"}%.` : "") +
      (activeReferral ? ` Active referral: ${activeReferral.reason}.` : ""),
    highlights: [
      { label: "Chronic conditions", value: chronic },
      { label: "Active referral", value: activeReferral ? "Yes — review referral status" : "None" },
      { label: "Recent prescriptions", value: patient.prescriptions?.[0]?.medicines?.join(", ") || "None" },
    ],
  };
};

const followUpRisk = asyncHandler(async (req, res) => {
  const { patientId } = req.body;
  const where = patientId ? { patientId } : {};
  const followUps = await prisma.followUp.findMany({
    where,
    include: { patient: { include: { user: { select: { name: true, phone: true } } } }, doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { scheduledFor: "asc" },
  });

  const now = new Date();
  const risk = [];
  for (const fu of followUps) {
    const overdueDays = Math.floor((now - new Date(fu.scheduledFor)) / 86400000);
    const isPending = ["SCHEDULED", "DUE"].includes(fu.status);
    if (isPending && (fu.status === "DUE" || overdueDays > 0)) {
      let level = "LOW";
      if (fu.patient.chronicConditions.includes("Hypertension") || fu.patient.chronicConditions.length >= 2) level = "HIGH";
      else if (overdueDays >= 7) level = "HIGH";
      else if (overdueDays >= 2) level = "MODERATE";

      risk.push({
        followUpId: fu.id,
        patientId: fu.patientId,
        patientName: fu.patient.user.name,
        patientPhone: fu.patient.user.phone,
        scheduledFor: fu.scheduledFor,
        overdueDays: Math.max(0, overdueDays),
        reason: fu.reason,
        riskLevel: level,
        reasons: [
          overdueDays >= 1 ? `Follow-up overdue by ${overdueDays} day(s).` : "Follow-up due soon.",
          fu.patient.chronicConditions.length ? `Chronic condition(s): ${fu.patient.chronicConditions.join(", ")}.` : null,
        ].filter(Boolean),
      });
    }
  }

  res.json({
    success: true,
    data: { count: risk.length, items: risk },
    disclaimer: "AI output is advisory and does not replace professional medical judgment.",
  });
});

module.exports = { triage, patientSummary, followUpRisk };