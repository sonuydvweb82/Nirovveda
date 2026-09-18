require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { PrismaClient, Role, Priority } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Nirovveda demo data...");

  // Make the seed idempotent: wipe previously seeded rows (children before parents).
  await prisma.consultation.deleteMany({});
  await prisma.emergencyAlert.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.followUp.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.diagnosticTest.deleteMany({});
  await prisma.diagnosticService.deleteMany({});
  await prisma.medicineInventory.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.queueToken.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.vital.deleteMany({});
  await prisma.healthWorker.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.facilityAdmin.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.appUser.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Cleaned previous seed data.");

  const password = await bcrypt.hash("Nirovveda@123", 10);

  // FACILITIES (demo facilities clearly flagged isDemo=true)
  const facilitiesData = [
    { name: "Chikhaldara Rural Hospital (CHC)", type: "CHC", district: "Amravati", lat: 21.418, lng: 77.34, services: ["General Medicine", "Emergency", "Maternity", "Pharmacy"] },
    { name: "Daryapur PHC", type: "PHC", district: "Amravati", lat: 20.933, lng: 77.317, services: ["General Medicine", "Immunisation", "Pharmacy"] },
    { name: "Morsi Primary Health Centre", type: "PHC", district: "Amravati", lat: 21.34, lng: 78.018, services: ["General Medicine", "Maternity", "Pharmacy"] },
    { name: "Amravati District Hospital", type: "DISTRICT_HOSPITAL", district: "Amravati", lat: 20.933, lng: 77.75, services: ["General Medicine", "Surgery", "Cardiology", "Orthopaedics", "Pathology", "Radiology", "Emergency", "Pharmacy"] },
    { name: "Akola District Hospital", type: "DISTRICT_HOSPITAL", district: "Akola", lat: 20.707, lng: 77.0, services: ["General Medicine", "Surgery", "Gynaecology", "Paediatrics", "Pathology", "Radiology", "Emergency", "Pharmacy"] },
    { name: "SevaKendra Tele-health Hub (HWC)", type: "SUB_CENTRE", district: "Amravati", lat: 21.21, lng: 77.53, services: ["Teleconsultation", "Pharmacy", "Immunisation"] },
  ];

  const facilities = [];
  for (const f of facilitiesData) {
    const created = await prisma.facility.create({
      data: {
        name: f.name,
        type: f.type,
        district: f.district,
        state: "Maharashtra",
        latitude: f.lat,
        longitude: f.lng,
        services: f.services,
        isDemo: true,
      },
    });
    facilities.push(created);
  }

  const chc = facilities[0];
  const phc1 = facilities[1];
  const distHosp = facilities[3];
  const akolaHosp = facilities[4];
  const hwc = facilities[5];

  // USERS: SUPER_ADMIN
  const superAdminUser = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@nirovveda.in",
      phone: "9000000000",
      password,
      role: "SUPER_ADMIN",
    },
  });

  // FACILITY_ADMIN users
  const facAdmins = [
    { name: "Facility Admin - CHC", email: "facility@nirovveda.in", phone: "9000000001" },
  ];
  const facAdminUser = await prisma.user.create({
    data: { name: facAdmins[0].name, email: facAdmins[0].email, phone: facAdmins[0].phone, password, role: "FACILITY_ADMIN" },
  });
  await prisma.facilityAdmin.create({
    data: { userId: facAdminUser.id, facilityId: chc.id },
  });

  // DOCTORS
  const doctorsData = [
    { name: "Dr. Priya Deshmukh", email: "doctor@nirovveda.in", phone: "9000000002", spec: "General Physician", regNo: "MH-12345", years: 12, facilityId: chc.id },
    { name: "Dr. Rahul Kulkarni", email: "doctor2@nirovveda.in", phone: "9000000003", spec: "Paediatrician", regNo: "MH-56789", years: 9, facilityId: chc.id },
    { name: "Dr. Anita Sharma", email: "doctor3@nirovveda.in", phone: "9000000004", spec: "Gynaecologist", regNo: "MH-24680", years: 15, facilityId: distHosp.id },
    { name: "Dr. Vikram Patil", email: "doctor4@nirovveda.in", phone: "9000000005", spec: "Cardiologist", regNo: "MH-13579", years: 18, facilityId: distHosp.id },
    { name: "Dr. Sunita Nair", email: "doctor5@nirovveda.in", phone: "9000000006", spec: "General Physician", regNo: "MH-97531", years: 7, facilityId: phc1.id },
  ];

  const doctors = [];
  for (const d of doctorsData) {
    const user = await prisma.user.create({
      data: { name: d.name, email: d.email, phone: d.phone, password, role: "DOCTOR" },
    });
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: d.spec,
        registrationNo: d.regNo,
        experienceYears: d.years,
        facilityId: d.facilityId,
      },
    });
    doctors.push({ ...doctor, userName: d.name, userEmail: d.email });
  }

  const drPriya = doctors[0];
  const drSunita = doctors[4];

  // HEALTH WORKERS
  const hwData = [
    { name: "Sangeeta Bhalerao", email: "worker@nirovveda.in", phone: "9000000007", designation: "ANM", facilityId: chc.id },
    { name: "Meena Jadhav", email: "worker2@nirovveda.in", phone: "9000000008", designation: "ASHA", facilityId: phc1.id },
  ];
  const healthWorkers = [];
  for (const h of hwData) {
    const user = await prisma.user.create({
      data: { name: h.name, email: h.email, phone: h.phone, password, role: "HEALTH_WORKER" },
    });
    const hw = await prisma.healthWorker.create({
      data: { userId: user.id, designation: h.designation, facilityId: h.facilityId, areaCovered: "Rural clusters, Amravati district" },
    });
    healthWorkers.push({ ...hw, userName: h.name });
  }

  // PATIENTS
  const patientsData = [
    { name: "Ramesh Gade", email: "patient@nirovveda.in", phone: "9000000011", dob: new Date("1978-04-12"), gender: "Male", blood: "B+", village: "Chikhaldara", abha: "91-2345-6789-01" },
    { name: "Sunita More", email: "patient2@nirovveda.in", phone: "9000000012", dob: new Date("1985-11-03"), gender: "Female", blood: "O+", village: "Daryapur", abha: "91-2345-6789-02" },
    { name: "Arun Meshram", email: "patient3@nirovveda.in", phone: "9000000013", dob: new Date("1992-07-21"), gender: "Male", blood: "A+", village: "Morsi", abha: "91-2345-6789-03" },
    { name: "Kavita Rathod", email: "patient4@nirovveda.in", phone: "9000000014", dob: new Date("1965-01-30"), gender: "Female", blood: "AB+", village: "Achalpur", chronic: ["Hypertension", "Diabetes"], abha: "91-2345-6789-04" },
    { name: "Suresh Bhaskar", email: "patient5@nirovveda.in", phone: "9000000015", dob: new Date("1958-09-15"), gender: "Male", blood: "O-", village: "Anjangaon", chronic: ["Diabetes", "Ischaemic heart disease"], abha: "91-2345-6789-05" },
    { name: "Lata Wankhede", email: "patient6@nirovveda.in", phone: "9000000016", dob: new Date("1996-03-25"), gender: "Female", blood: "B-", village: "Chikhaldara", abha: "91-2345-6789-06" },
    { name: "Prakash Thakre", email: "patient7@nirovveda.in", phone: "9000000017", dob: new Date("1980-12-08"), gender: "Male", blood: "A-", village: "Morsi", chronic: ["Hypertension"], abha: "91-2345-6789-07" },
    { name: "Rekha Khandare", email: "patient8@nirovveda.in", phone: "9000000018", dob: new Date("2001-06-17"), gender: "Female", blood: "O+", village: "Daryapur", abha: "91-2345-6789-08" },
    { name: "Baban Sable", email: "patient9@nirovveda.in", phone: "9000000019", dob: new Date("1970-02-02"), gender: "Male", blood: "B+", village: "Anjangaon", chronic: ["COPD"], abha: "91-2345-6789-09" },
    { name: "Maya Gore", email: "patient10@nirovveda.in", phone: "9000000020", dob: new Date("1989-08-19"), gender: "Female", blood: "AB-", village: "Achalpur", abha: "91-2345-6789-10" },
    { name: "Dilip Chavhan", email: "patient11@nirovveda.in", phone: "9000000021", dob: new Date("1975-05-05"), gender: "Male", blood: "A+", village: "Chikhaldara", abha: "91-2345-6789-11" },
    { name: "Shobha Nimsarkar", email: "patient12@nirovveda.in", phone: "9000000022", dob: new Date("1962-10-11"), gender: "Female", blood: "O+", village: "Morsi", chronic: ["Hypertension"], abha: "91-2345-6789-12" },
    { name: "Ganesh Bonde", email: "patient13@nirovveda.in", phone: "9000000023", dob: new Date("1990-01-27"), gender: "Male", blood: "B+", village: "Daryapur", abha: "91-2345-6789-13" },
    { name: "Farida Sheikh", email: "patient14@nirovveda.in", phone: "9000000024", dob: new Date("1983-07-14"), gender: "Female", blood: "A-", village: "Achalpur", chronic: ["Asthma"], abha: "91-2345-6789-14" },
    { name: "Nandkishor Kore", email: "patient15@nirovveda.in", phone: "9000000025", dob: new Date("1949-12-31"), gender: "Male", blood: "B+", village: "Anjangaon", chronic: ["Diabetes", "Hypertension"], abha: "91-2345-6789-15" },
    { name: "Puja Dhakate", email: "patient16@nirovveda.in", phone: "9000000026", dob: new Date("2003-04-09"), gender: "Female", blood: "O+", village: "Chikhaldara", abha: "91-2345-6789-16" },
    { name: "Sanjay Pawar", email: "patient17@nirovveda.in", phone: "9000000027", dob: new Date("1972-09-23"), gender: "Male", blood: "AB+", village: "Morsi", chronic: ["Hypertension"], abha: "91-2345-6789-17" },
    { name: "Hema Gujarathi", email: "patient18@nirovveda.in", phone: "9000000028", dob: new Date("1995-11-30"), gender: "Female", blood: "B+", village: "Daryapur", abha: "91-2345-6789-18" },
    { name: "Kishor Lende", email: "patient19@nirovveda.in", phone: "9000000029", dob: new Date("1987-03-07"), gender: "Male", blood: "O-", village: "Achalpur", abha: "91-2345-6789-19" },
    { name: "Vimla Tatte", email: "patient20@nirovveda.in", phone: "9000000030", dob: new Date("1955-06-28"), gender: "Female", blood: "A+", village: "Anjangaon", chronic: ["Diabetes", "Hypertension"], abha: "91-2345-6789-20" },
  ];

  const patients = [];
  for (const p of patientsData) {
    const user = await prisma.user.create({
      data: { name: p.name, email: p.email, phone: p.phone, password, role: "PATIENT" },
    });
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        abhaId: p.abha,
        dateOfBirth: p.dob,
        gender: p.gender,
        bloodGroup: p.blood,
        village: p.village,
        district: "Amravati",
        state: "Maharashtra",
        chronicConditions: p.chronic || [],
        allergies: [],
        emergencyContact: "7000000000",
        emergencyRelation: "Family",
      },
    });
    patients.push({ ...patient, userName: p.name });
  }

  // VITALS + SYMPTOMS for patients
  const vitalSeed = [
    { idx: 0, temp: 37.2, hr: 82, bpS: 132, bpD: 84, o2: 97, rr: 18, symptoms: ["Fever", "Cough"], notes: "Mild fever for 2 days" },
    { idx: 1, temp: 36.8, hr: 76, bpS: 118, bpD: 76, o2: 98, rr: 16, symptoms: ["Headache"], notes: "Occasional headache" },
    { idx: 2, temp: 38.1, hr: 98, bpS: 124, bpD: 80, o2: 96, rr: 20, symptoms: ["Fever", "Body ache", "Fatigue"], notes: "High fever since yesterday" },
    { idx: 3, temp: 36.9, hr: 84, bpS: 148, bpD: 92, o2: 97, rr: 17, symptoms: ["Dizziness"], notes: "Known hypertensive", },
    { idx: 4, temp: 36.5, hr: 72, bpS: 152, bpD: 94, o2: 95, rr: 19, symptoms: ["Chest discomfort", "Shortness of breath"], notes: "Diabetic, on metformin", },
    { idx: 5, temp: 38.4, hr: 104, bpS: 110, bpD: 70, o2: 94, rr: 22, symptoms: ["Fever", "Body ache", "Cough"], notes: "Possible viral infection", },
    { idx: 6, temp: 37.0, hr: 80, bpS: 136, bpD: 86, o2: 97, rr: 16, symptoms: ["Headache"], notes: "" },
    { idx: 7, temp: 36.6, hr: 78, bpS: 116, bpD: 74, o2: 99, rr: 15, symptoms: ["Back pain"], notes: "" },
    { idx: 8, temp: 36.9, hr: 88, bpS: 128, bpD: 82, o2: 94, rr: 22, symptoms: ["Cough", "Shortness of breath"], notes: "Known COPD", },
    { idx: 9, temp: 36.7, hr: 74, bpS: 120, bpD: 78, o2: 98, rr: 16, symptoms: ["Abdominal discomfort"], notes: "" },
    { idx: 10, temp: 37.1, hr: 86, bpS: 130, bpD: 84, o2: 97, rr: 18, symptoms: ["Fatigue"], notes: "" },
    { idx: 11, temp: 36.8, hr: 82, bpS: 144, bpD: 90, o2: 97, rr: 17, symptoms: ["Headache", "Dizziness"], notes: "Known hypertensive", },
    { idx: 12, temp: 37.3, hr: 90, bpS: 122, bpD: 80, o2: 98, rr: 18, symptoms: ["Fever", "Throat pain"], notes: "" },
    { idx: 13, temp: 36.9, hr: 84, bpS: 126, bpD: 82, o2: 97, rr: 18, symptoms: ["Cough"], notes: "Known asthma, using inhaler", },
    { idx: 14, temp: 36.7, hr: 70, bpS: 150, bpD: 92, o2: 96, rr: 17, symptoms: ["Chest discomfort"], notes: "Diabetic + hypertensive, age 77", },
    { idx: 15, temp: 37.4, hr: 92, bpS: 112, bpD: 72, o2: 98, rr: 18, symptoms: ["Fever", "Rash"], notes: "Mother concerned", },
    { idx: 16, temp: 36.8, hr: 80, bpS: 140, bpD: 88, o2: 96, rr: 18, symptoms: ["Headache", "Dizziness"], notes: "" },
    { idx: 17, temp: 36.6, hr: 76, bpS: 118, bpD: 76, o2: 99, rr: 16, symptoms: ["Vaginal itching"], notes: "" },
    { idx: 18, temp: 37.0, hr: 78, bpS: 122, bpD: 80, o2: 98, rr: 16, symptoms: ["Knee pain"], notes: "" },
    { idx: 19, temp: 36.7, hr: 84, bpS: 146, bpD: 90, o2: 96, rr: 18, symptoms: ["Fatigue", "Leg swelling"], notes: "Diabetic + hypertensive, age 71", },
  ];

  for (const v of vitalSeed) {
    const p = patients[v.idx];
    await prisma.vital.create({
      data: {
        patientId: p.id,
        recordedById: healthWorkers[0].userId,
        temperature: v.temp,
        heartRate: v.hr,
        bpSystolic: v.bpS,
        bpDiastolic: v.bpD,
        oxygenSaturation: v.o2,
        respiratoryRate: v.rr,
        symptoms: v.symptoms,
        notes: v.notes,
        recordedAt: new Date(Date.now() - Math.floor(Math.random() * 10 + 1) * 86400000),
      },
    });
  }

  // MEDICAL RECORDS
  const records = [
    { pIdx: 3, title: "Hypertension Diagnosis", notes: "Diagnosed with Stage 1 hypertension. Advised Amlodipine 5mg and lifestyle modification." },
    { pIdx: 4, title: "Type 2 Diabetes Review", notes: "HbA1c at 7.8%. Continued Metformin 500mg, added diet counselling." },
    { pIdx: 4, title: "Angina Referral", notes: "Referred to District Hospital cardiology for chest discomfort workup. ECG advised." },
    { pIdx: 8, title: "COPD Exacerbation", notes: "Treated for acute exacerbation. Inhaler therapy adjusted, follow-up in 30 days." },
    { pIdx: 13, title: "Asthma Action Plan", notes: "Intermittent asthma. Updated action plan, inhaler technique counselling given." },
  ];
  for (const r of records) {
    const p = patients[r.pIdx];
    await prisma.medicalRecord.create({
      data: { patientId: p.id, type: "CONSULTATION", title: r.title, notes: r.notes, createdById: drPriya.userId, createdAt: new Date(Date.now() - 20 * 86400000) },
    });
  }

  // APPOINTMENTS (spread over recent days + upcoming)
  const now = Date.now();
  const appointmentSeed = [
    { pIdx: 0, docIdx: 0, fIdx: 0, offsetDays: 0, status: "IN_PROGRESS", type: "IN_PERSON", reason: "Fever and cough", token: 12 },
    { pIdx: 5, docIdx: 0, fIdx: 0, offsetDays: 0, status: "PENDING", type: "TELEMEDICINE", reason: "Fever, body ache", token: 13 },
    { pIdx: 3, docIdx: 0, fIdx: 0, offsetDays: 1, status: "CONFIRMED", type: "IN_PERSON", reason: "Hypertension follow-up", token: 14 },
    { pIdx: 14, docIdx: 0, fIdx: 0, offsetDays: 1, status: "CONFIRMED", type: "IN_PERSON", reason: "Chest discomfort", token: 15 },
    { pIdx: 19, docIdx: 0, fIdx: 0, offsetDays: 2, status: "CONFIRMED", type: "IN_PERSON", reason: "Leg swelling, diabetes check", token: 16 },
    { pIdx: 4, docIdx: 3, fIdx: 3, offsetDays: 3, status: "CONFIRMED", type: "IN_PERSON", reason: "Cardiology review - angina", token: 17 },
    { pIdx: 8, docIdx: 0, fIdx: 0, offsetDays: 4, status: "PENDING", type: "IN_PERSON", reason: "COPD follow-up", token: 18 },
    { pIdx: 13, docIdx: 1, fIdx: 0, offsetDays: 5, status: "PENDING", type: "TELEMEDICINE", reason: "Asthma review", token: 19 },
    { pIdx: 1, docIdx: 4, fIdx: 1, offsetDays: -1, status: "COMPLETED", type: "IN_PERSON", reason: "Headache evaluation" },
    { pIdx: 7, docIdx: 1, fIdx: 0, offsetDays: -2, status: "COMPLETED", type: "IN_PERSON", reason: "Back pain" },
    { pIdx: 12, docIdx: 4, fIdx: 1, offsetDays: -3, status: "COMPLETED", type: "IN_PERSON", reason: "Fever, throat pain" },
    { pIdx: 9, docIdx: 4, fIdx: 1, offsetDays: -4, status: "COMPLETED", type: "TELEMEDICINE", reason: "Abdominal discomfort" },
    { pIdx: 15, docIdx: 1, fIdx: 0, offsetDays: -5, status: "COMPLETED", type: "IN_PERSON", reason: "Fever with rash" },
  ];

  for (const a of appointmentSeed) {
    const p = patients[a.pIdx];
    const dr = doctors[a.docIdx];
    const fc = facilities[a.fIdx];
    const when = new Date(now + a.offsetDays * 86400000);
    const appt = await prisma.appointment.create({
      data: {
        patientId: p.id,
        doctorId: dr.id,
        facilityId: fc.id,
        bookedById: healthWorkers[0].userId,
        consultationType: a.type,
        status: a.status,
        scheduledAt: when,
        reason: a.reason,
        slotToken: a.token ? `T-${a.token}` : null,
      },
    });
    if (a.token && a.status !== "COMPLETED") {
      await prisma.queueToken.create({
        data: {
          tokenNumber: a.token,
          patientId: p.id,
          appointmentId: appt.id,
          facilityId: fc.id,
          doctorId: dr.id,
          priority: a.status === "IN_PROGRESS" ? "HIGH" : "LOW",
          status: a.status === "IN_PROGRESS" ? "IN_PROGRESS" : "WAITING",
          createdAt: new Date(),
        },
      });
    }
  }

  // REFERRALS
  const referralSeed = [
    { pIdx: 4, fromIdx: 0, toIdx: 3, status: "ACCEPTED", reason: "Suspected ischaemic heart disease — cardiology evaluation required", priority: "HIGH" },
    { pIdx: 19, fromIdx: 0, toIdx: 3, status: "PENDING", reason: "Uncontrolled hypertension + leg oedema — internal medicine review", priority: "MODERATE" },
    { pIdx: 3, fromIdx: 1, toIdx: 3, status: "COMPLETED", reason: "Resistant hypertension — specialist evaluation", priority: "MODERATE" },
    { pIdx: 8, fromIdx: 0, toIdx: 3, status: "CREATED", reason: "Recurrent COPD exacerbation — pulmonology review", priority: "MODERATE" },
    { pIdx: 14, fromIdx: 0, toIdx: 3, status: "PENDING", reason: "Diabetic foot screening + nephrology workup", priority: "HIGH" },
  ];
  for (const r of referralSeed) {
    await prisma.referral.create({
      data: {
        patientId: patients[r.pIdx].id,
        fromFacilityId: facilities[r.fromIdx].id,
        toFacilityId: facilities[r.toIdx].id,
        doctorId: drPriya.id,
        reason: r.reason,
        priority: r.priority,
        status: r.status,
        notes: "Escalate to specialist department on arrival",
        createdAt: new Date(now - 10 * 86400000),
        updatedAt: new Date(now - 2 * 86400000),
      },
    });
  }

  // MEDICINES + INVENTORY
  const medicinesSeed = [
    { name: "Paracetamol 500mg", generic: "Acetaminophen", category: "Analgesic" },
    { name: "Amlodipine 5mg", generic: "Amlodipine", category: "Antihypertensive" },
    { name: "Metformin 500mg", generic: "Metformin", category: "Antidiabetic" },
    { name: "Amoxicillin 500mg", generic: "Amoxicillin", category: "Antibiotic" },
    { name: "ORS Sachets", generic: "Oral Rehydration Salts", category: "Rehydration" },
    { name: "Salbutamol Inhaler", generic: "Salbutamol", category: "Bronchodilator" },
    { name: "Insulin Glargine 100IU", generic: "Insulin Glargine", category: "Antidiabetic" },
    { name: "Cetirizine 10mg", generic: "Cetirizine", category: "Antihistamine" },
    { name: "Ibuprofen 400mg", generic: "Ibuprofen", category: "NSAID" },
    { name: "Iron + Folic Acid Tablets", generic: "Ferrous + Folic acid", category: "Supplement" },
    { name: "Vitamin B-Complex", generic: "Multivitamin B", category: "Supplement" },
    { name: "Tetanus Toxoid", generic: "TT Vaccine", category: "Vaccine" },
    { name: "Aspirin 75mg", generic: "Aspirin", category: "Antiplatelet" },
    { name: "Atorvastatin 10mg", generic: "Atorvastatin", category: "Lipid-lowering" },
    { name: "Artemisinin Combination Therapy", generic: "ACT", category: "Antimalarial" },
  ];

  const medicines = [];
  for (const m of medicinesSeed) {
    const med = await prisma.medicine.create({ data: { name: m.name, genericName: m.generic, category: m.category } });
    medicines.push(med);
  }

  const quantityMap = [
    { f: 0, meds: [0, 1, 2, 3, 4, 5, 7, 9, 10, 14], qty: [240, 320, 280, 120, 500, 60, 80, 150, 90, 200] },
    { f: 1, meds: [0, 1, 2, 3, 4, 7, 9, 11], qty: [120, 60, 45, 90, 300, 40, 30, 25] },
    { f: 2, meds: [0, 4, 7, 9, 10], qty: [60, 150, 20, 15, 40] },
    { f: 3, meds: [0, 1, 2, 6, 8, 12, 13], qty: [800, 420, 500, 60, 200, 350, 180] },
    { f: 4, meds: [0, 1, 2, 3, 4, 6, 7, 8, 9, 12, 13], qty: [640, 300, 380, 160, 250, 30, 90, 140, 70, 260, 120] },
    { f: 5, meds: [0, 4, 7, 9], qty: [80, 200, 35, 40] },
  ];

  const lowStock = [
    { f: 1, med: 7 }, { f: 1, med: 9 }, { f: 2, med: 7 }, { f: 2, med: 9 },
    { f: 5, med: 7 }, { f: 5, med: 9 }, { f: 0, med: 3 }, { f: 3, med: 6 },
  ];

  for (const inv of quantityMap) {
    for (let i = 0; i < inv.meds.length; i++) {
      let qty = inv.qty[i];
      // Mark some as low/out of stock
      if (lowStock.some((l) => l.f === inv.f && l.med === inv.meds[i])) qty = Math.floor(qty / 6); // low stock
      if (inv.f === 2 && inv.meds[i] === 0) qty = 0; // Out of stock at Morsi PHC
      await prisma.medicineInventory.create({
        data: {
          medicineId: medicines[inv.meds[i]].id,
          facilityId: facilities[inv.f].id,
          quantity: qty,
          lowStockThreshold: 30,
          updatedAt: new Date(now - Math.floor(Math.random() * 48) * 3600000),
        },
      });
    }
  }

  // DIAGNOSTIC SERVICES
  const diagnosticServices = [
    { f: 0, services: [["Blood Sugar", 4], ["CBC", 6], ["Malaria RDT", 2], ["Urine R/E", 6], ["ECG", 6]] },
    { f: 1, services: [["Blood Sugar", 4], ["Malaria RDT", 2], ["Urine Dipstick", 3]] },
    { f: 2, services: [["Blood Sugar", 4], ["Malaria RDT", 2]] },
    { f: 3, services: [["CBC", 6], ["Liver Function Test", 12], ["Kidney Function Test", 12], ["HbA1c", 24], ["Lipid Profile", 24], ["X-Ray", 24], ["ECG", 6], ["Echocardiography", 48], ["Thyroid Profile", 48]] },
    { f: 4, services: [["CBC", 6], ["Liver Function Test", 12], ["Kidney Function Test", 12], ["HbA1c", 24], ["Lipid Profile", 24], ["X-Ray", 24], ["ECG", 6], ["Ultrasound", 24]] },
    { f: 5, services: [["Blood Sugar", 4], ["Urine Dipstick", 3]] },
  ];
  for (const ds of diagnosticServices) {
    for (const svc of ds.services) {
      await prisma.diagnosticService.create({
        data: { facilityId: facilities[ds.f].id, name: svc[0], turnaroundHours: svc[1], available: true },
      });
    }
  }

  // DIAGNOSTIC TESTS
  const testsSeed = [
    { pIdx: 4, docIdx: 0, fIdx: 3, test: "ECG", status: "SCHEDULED" },
    { pIdx: 19, docIdx: 0, fIdx: 3, test: "Kidney Function Test", status: "REQUESTED" },
    { pIdx: 4, docIdx: 0, fIdx: 3, test: "HbA1c", status: "REPORT_READY", summary: "HbA1c 7.8% — above target, review antidiabetic therapy" },
    { pIdx: 3, docIdx: 0, fIdx: 3, test: "Lipid Profile", status: "COMPLETED", summary: "LDL 142 mg/dL — initiate statin and lifestyle advice" },
    { pIdx: 5, docIdx: 0, fIdx: 0, test: "Malaria RDT", status: "SAMPLE_COLLECTED" },
  ];
  for (const t of testsSeed) {
    await prisma.diagnosticTest.create({
      data: {
        patientId: patients[t.pIdx].id,
        doctorId: doctors[t.docIdx].id,
        facilityId: facilities[t.fIdx].id,
        testType: t.test,
        status: t.status,
        reportSummary: t.summary,
        labNotes: "Sample handled by receiving lab",
        requestedAt: new Date(now - 5 * 86400000),
      },
    });
  }

  // PRESCRIPTIONS
  const prescriptionSeed = [
    { pIdx: 3, docIdx: 0, meds: ["Amlodipine 5mg"], dosage: "Once daily", advice: "Restrict salt. Walk 30 min daily. Review BP in 2 weeks.", followUpDays: 14 },
    { pIdx: 4, docIdx: 0, meds: ["Metformin 500mg", "Aspirin 75mg"], dosage: "Twice daily / Once daily", advice: "Follow up cardiology. HbA1c recheck in 3 months.", followUpDays: 30 },
    { pIdx: 8, docIdx: 0, meds: ["Salbutamol Inhaler"], dosage: "2 puffs SOS", advice: "Inhaler technique counselling. If SOB worsens, visit CHC.", followUpDays: 30 },
    { pIdx: 0, docIdx: 0, meds: ["Paracetamol 500mg"], dosage: "Three times daily for 3 days", advice: "Plenty of fluids, rest. Report if fever persists beyond 3 days.", followUpDays: 3 },
    { pIdx: 13, docIdx: 1, meds: ["Cetirizine 10mg"], dosage: "Once daily at bedtime", advice: "Avoid triggers. Asthma action plan shared.", followUpDays: 30 },
  ];
  for (const pr of prescriptionSeed) {
    await prisma.prescription.create({
      data: {
        patientId: patients[pr.pIdx].id,
        doctorId: doctors[pr.docIdx].id,
        medicines: pr.meds,
        dosage: pr.dosage,
        advice: pr.advice,
        followUpDays: pr.followUpDays,
        createdAt: new Date(now - 15 * 86400000),
      },
    });
  }

  // FOLLOW-UPS
  const followUpSeed = [
    { pIdx: 3, docIdx: 0, offsetDays: 4, status: "SCHEDULED", reason: "BP recheck after starting Amlodipine" },
    { pIdx: 4, docIdx: 3, offsetDays: 2, status: "SCHEDULED", reason: "Cardiology review after ECG" },
    { pIdx: 19, docIdx: 0, offsetDays: 7, status: "SCHEDULED", reason: "Hypertension + oedema review" },
    { pIdx: 0, docIdx: 0, offsetDays: -8, status: "MISSED", reason: "Fever review — not completed" },
    { pIdx: 8, docIdx: 0, offsetDays: 20, status: "DUE", reason: "COPD review after exacerbation" },
    { pIdx: 5, docIdx: 0, offsetDays: 3, status: "SCHEDULED", reason: "Re-evaluate fever symptoms" },
  ];
  for (const fu of followUpSeed) {
    await prisma.followUp.create({
      data: {
        patientId: patients[fu.pIdx].id,
        doctorId: doctors[fu.docIdx].id,
        facilityId: facilities[0].id,
        scheduledFor: new Date(now + fu.offsetDays * 86400000),
        reason: fu.reason,
        status: fu.status,
      },
    });
  }

  // EMERGENCY ALERTS
  const emergencySeed = [
    { pIdx: 14, level: "HIGH", desc: "Chest discomfort, sweating, age 67 — possible cardiac event", status: "ACTIVE" },
    { pIdx: 4, level: "EMERGENCY", desc: "Severe chest pain radiating to left arm — suspected ACS", status: "ATTENDED" },
  ];
  for (const e of emergencySeed) {
    await prisma.emergencyAlert.create({
      data: {
        patientId: patients[e.pIdx].id,
        raisedById: healthWorkers[0].userId,
        alertLevel: e.level,
        location: "Rural health cluster, Amravati",
        description: e.desc,
        status: e.status,
        createdAt: new Date(now - (e.status === "ACTIVE" ? 2 : 9) * 86400000),
      },
    });
  }

  // NOTIFICATIONS
  const notifications = [
    { userId: superAdminUser.id, type: "SYSTEM", title: "Welcome to Nirovveda", message: "You are logged in as System Administrator." },
    { userId: drPriya.userId, type: "APPOINTMENT", title: "Appointment reminder", message: "You have 5 appointments today." },
    { userId: healthWorkers[0].userId, type: "LOW_STOCK", title: "Low medicine stock", message: "3 medicines are running low at your facility." },
    { userId: patients[0].userId, type: "QUEUE", title: "You are in queue", message: "Your token T-12 is now in progress." },
    { userId: patients[4].userId, type: "FOLLOW_UP", title: "Follow-up scheduled", message: "Cardiology review scheduled in 2 days." },
    { userId: patients[14].userId, type: "EMERGENCY", title: "Emergency alert raised", message: "Our team has escalated your case. Please reach Amravati District Hospital." },
  ];
  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  // CONSULTATIONS (sample completed teleconsultation)
  await prisma.consultation.create({
    data: {
      patientId: patients[9].id,
      doctorId: drSunita.id,
      facilityId: phc1.id,
      type: "TELEMEDICINE",
      notes: "Teleconsultation for abdominal discomfort. Advised diet modification, antacids, review in 1 week.",
      roomId: "nirov-3371-9931",
      startedAt: new Date(now - 4 * 86400000),
      endedAt: new Date(now - 4 * 86400000 + 20 * 60000),
    },
  });

  console.log("Seed complete.");
  console.log("Demo credentials (password: Nirovveda@123):");
  console.log("  SUPER_ADMIN      admin@nirovveda.in");
  console.log("  FACILITY_ADMIN   facility@nirovveda.in");
  console.log("  DOCTOR           doctor@nirovveda.in");
  console.log("  HEALTH_WORKER    worker@nirovveda.in");
  console.log("  PATIENT          patient@nirovveda.in");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });