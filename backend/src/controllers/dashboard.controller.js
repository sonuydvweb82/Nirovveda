const prisma = require("../utils/prisma");
const { asyncHandler } = require("../middleware/error");

const getDashboard = asyncHandler(async (req, res) => {
  const { role, id } = req.user;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let data = { role };

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: id } });
    if (!patient) return res.json({ success: true, data: { role, patient: null } });

    const [appointments, recentRecords, pendingReferrals, activeFollowUps, prescriptions, diagnosticTests, notifications] =
      await Promise.all([
        prisma.appointment.findMany({
          where: { patientId: patient.id },
          include: { doctor: { include: { user: { select: { name: true } } } }, facility: true },
          orderBy: { scheduledAt: "desc" },
          take: 10,
        }),
        prisma.medicalRecord.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: "desc" }, take: 8 }),
        prisma.referral.findMany({
          where: { patientId: patient.id, status: { in: ["CREATED", "ACCEPTED", "SCHEDULED", "IN_PROGRESS"] } },
          include: { toFacility: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.followUp.findMany({
          where: { patientId: patient.id, status: { in: ["SCHEDULED", "DUE"] } },
          orderBy: { scheduledFor: "asc" },
          take: 10,
        }),
        prisma.prescription.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.diagnosticTest.findMany({ where: { patientId: patient.id }, orderBy: { requestedAt: "desc" }, take: 8 }),
        prisma.notification.findMany({ where: { userId: id, read: false }, orderBy: { createdAt: "desc" }, take: 10 }),
      ]);

    const upcoming = appointments.filter(
      (a) => a.scheduledAt >= now && !["COMPLETED", "CANCELLED"].includes(a.status)
    );
    const queue = await prisma.queueToken.findFirst({
      where: { patientId: patient.id, status: { in: ["WAITING", "IN_PROGRESS"] } },
      include: { facility: true },
      orderBy: { createdAt: "desc" },
    });

    data = {
      ...data,
      patient,
      kpis: {
        upcomingAppointments: upcoming.length,
        activeReferrals: pendingReferrals.length,
        pendingFollowUps: activeFollowUps.length,
        unreadNotifications: notifications.length,
        prescriptions: prescriptions.length,
        diagnosticTests: diagnosticTests.filter((t) => t.status !== "COMPLETED").length,
      },
      appointments: upcoming,
      history: appointments,
      recentRecords,
      referrals: pendingReferrals,
      followUps: activeFollowUps.slice(0, 5),
      prescriptions,
      diagnosticTests,
      notifications,
      queue,
    };
  } else if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId: id }, include: { facility: true } });
    const todayAppointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id, status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] } },
      include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: { scheduledAt: "asc" },
    });
    const queue = await prisma.queueToken.findMany({
      where: { doctorId: doctor.id, status: { in: ["WAITING", "IN_PROGRESS"] } },
      include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: [{ status: "asc" }, { tokenNumber: "asc" }],
    });
    const highRiskReferrals = await prisma.referral.findMany({
      where: { fromFacilityId: doctor.facilityId, priority: { in: ["HIGH", "EMERGENCY"] }, status: { in: ["CREATED", "ACCEPTED", "IN_PROGRESS"] } },
      include: { patient: { include: { user: { select: { name: true } } } }, toFacility: true },
      take: 10,
    });
    const overdueFollowUps = await prisma.followUp.findMany({
      where: { doctorId: doctor.id, status: { in: ["SCHEDULED", "DUE"] }, scheduledFor: { lt: tomorrow } },
      include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: { scheduledFor: "asc" },
      take: 10,
    });
    const notifications = await prisma.notification.findMany({ where: { userId: id, read: false }, orderBy: { createdAt: "desc" }, take: 10 });

    data = {
      ...data,
      doctor,
      kpis: {
        todayAppointments: todayAppointments.length,
        waitingQueue: queue.filter((q) => q.status === "WAITING").length,
        highRiskReferrals: highRiskReferrals.length,
        overdueFollowUps: overdueFollowUps.length,
      },
      todayAppointments,
      queue,
      highRiskReferrals,
      overdueFollowUps,
      notifications,
    };
  } else if (role === "HEALTH_WORKER") {
    const hw = await prisma.healthWorker.findUnique({ where: { userId: id }, include: { facility: true } });
    const pending = await prisma.referral.findMany({
      where: { fromFacilityId: hw.facilityId, status: { in: ["CREATED", "ACCEPTED", "SCHEDULED", "IN_PROGRESS"] } },
      include: { patient: { include: { user: { select: { name: true, phone: true } } } }, toFacility: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const followUps = await prisma.followUp.findMany({
      where: { status: { in: ["SCHEDULED", "DUE"] } },
      include: { patient: { include: { user: { select: { name: true, phone: true } } } }, doctor: { include: { facility: true } } },
      orderBy: { scheduledFor: "asc" },
      take: 50,
    });
    const facilityFollowUps = followUps.filter((f) => f.doctor?.facilityId === hw.facilityId);
    const queue = await prisma.queueToken.findMany({
      where: { facilityId: hw.facilityId, status: { in: ["WAITING", "IN_PROGRESS"] } },
      include: { patient: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: [{ status: "asc" }, { tokenNumber: "asc" }],
      take: 15,
    });
    const todayAppointments = await prisma.appointment.count({
      where: { facilityId: hw.facilityId, scheduledAt: { gte: today, lt: tomorrow } },
    });
    const notifications = await prisma.notification.findMany({ where: { userId: id, read: false }, orderBy: { createdAt: "desc" }, take: 10 });

    data = {
      ...data,
      healthWorker: hw,
      kpis: {
        todayAppointments,
        waitingQueue: queue.filter((q) => q.status === "WAITING").length,
        pendingReferrals: pending.length,
        followUpsDue: followUps.filter((f) => f.status === "DUE").length,
      },
      pendingReferrals: pending,
      followUps: facilityFollowUps,
      queue,
      notifications,
    };
  } else if (role === "FACILITY_ADMIN") {
    const admin = await prisma.facilityAdmin.findUnique({ where: { userId: id }, include: { facility: true } });
    const facilityId = admin.facilityId;
    const [appointments, queue, lowStock, referralsTo, referralsFrom, doctors, diagnostics] = await Promise.all([
      prisma.appointment.findMany({
        where: { facilityId, scheduledAt: { gte: today, lt: tomorrow } },
        include: { patient: { include: { user: { select: { name: true } } } } },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.queueToken.findMany({ where: { facilityId, status: { in: ["WAITING", "IN_PROGRESS"] } }, include: { patient: { include: { user: { select: { name: true } } } } } }),
      prisma.medicineInventory.findMany({ where: { facilityId }, include: { medicine: true } }),
      prisma.referral.findMany({ where: { toFacilityId: facilityId, status: { in: ["CREATED", "ACCEPTED"] } }, include: { patient: { include: { user: { select: { name: true } } } } } }),
      prisma.referral.findMany({ where: { fromFacilityId: facilityId, status: { in: ["CREATED", "ACCEPTED", "SCHEDULED", "IN_PROGRESS"] } }, include: { patient: { include: { user: { select: { name: true } } } } } }),
      prisma.doctor.findMany({ where: { facilityId }, include: { user: { select: { name: true } } } }),
      prisma.diagnosticTest.findMany({ where: { facilityId, status: { in: ["REQUESTED", "SCHEDULED", "SAMPLE_COLLECTED", "REPORT_READY"] } } }),
    ]);
    const lowStockItems = lowStock.filter((i) => i.quantity <= i.lowStockThreshold);
    const notifications = await prisma.notification.findMany({ where: { userId: id, read: false }, orderBy: { createdAt: "desc" }, take: 10 });

    data = {
      ...data,
      facility: admin.facility,
      kpis: {
        todayAppointments: appointments.length,
        waitingQueue: queue.length,
        lowStock: lowStockItems.length,
        pendingReferralsIn: referralsTo.length,
        pendingReferralsOut: referralsFrom.length,
        doctors: doctors.length,
        pendingDiagnostics: diagnostics.length,
      },
      todayAppointments: appointments,
      queue,
      lowStock: lowStockItems,
      referralsTo,
      referralsFrom,
      doctors,
      diagnostics,
      notifications,
    };
  } else if (role === "SUPER_ADMIN") {
    const [
      patients, healthWorkers, doctors, facilities, appointments, referrals,
      pendingReferrals, emergencies, followUps, lowStockItems, notifications,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.healthWorker.count(),
      prisma.doctor.count(),
      prisma.facility.count(),
      prisma.appointment.count(),
      prisma.referral.count(),
      prisma.referral.count({ where: { status: { in: ["CREATED", "ACCEPTED", "SCHEDULED", "IN_PROGRESS"] } } }),
      prisma.emergencyAlert.count({ where: { status: "ACTIVE" } }),
      prisma.followUp.count({ where: { status: { in: ["SCHEDULED", "DUE"] } } }),
      prisma.medicineInventory.findMany({ include: { medicine: true, facility: true } }),
      prisma.notification.findMany({ where: { userId: id, read: false }, orderBy: { createdAt: "desc" }, take: 10 }),
    ]);
    const recentPatients = await prisma.patient.findMany({ include: { user: { select: { name: true, phone: true, createdAt: true } } }, orderBy: { createdAt: "desc" }, take: 8 });
    const recentReferrals = await prisma.referral.findMany({
      include: { patient: { include: { user: { select: { name: true } } } }, fromFacility: true, toFacility: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    const recentEmergencies = await prisma.emergencyAlert.findMany({
      include: { patient: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    data = {
      ...data,
      kpis: {
        patients, healthWorkers, doctors, facilities, appointments, referrals,
        pendingReferrals, emergencies, followUps,
        lowStock: lowStockItems.filter((i) => i.quantity <= i.lowStockThreshold).length,
      },
      recentPatients,
      recentReferrals,
      recentEmergencies,
      notifications,
      lowStock: lowStockItems.filter((i) => i.quantity <= i.lowStockThreshold),
    };
  }

  res.json({ success: true, data });
});

module.exports = { getDashboard };