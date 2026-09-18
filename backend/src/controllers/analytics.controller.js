const prisma = require("../utils/prisma");
const { asyncHandler } = require("../middleware/error");

const systemAnalytics = asyncHandler(async (req, res) => {
  const [
    patientCount,
    healthWorkerCount,
    doctorCount,
    facilityCount,
    appointmentCount,
    referralCount,
    pendingReferrals,
    emergencyCount,
    followUpCount,
    completedFollowUps,
    totalConsultations,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.healthWorker.count(),
    prisma.doctor.count(),
    prisma.facility.count(),
    prisma.appointment.count(),
    prisma.referral.count(),
    prisma.referral.count({ where: { status: { in: ["CREATED", "PENDING", "ACCEPTED"] } } }),
    prisma.emergencyAlert.count({ where: { status: "ACTIVE" } }),
    prisma.followUp.count(),
    prisma.followUp.count({ where: { status: "COMPLETED" } }),
    prisma.consultation.count(),
  ]);

  // low stock count
  const allInv = await prisma.medicineInventory.findMany({ include: { medicine: true } });
  const lowStockCount = allInv.filter((i) => i.quantity <= i.lowStockThreshold).length;

  // appointments by status
  const appointmentsByStatus = await prisma.appointment.groupBy({
    by: ["status"],
    _count: true,
  });

  // referrals by status
  const referralsByStatus = await prisma.referral.groupBy({
    by: ["status"],
    _count: true,
  });

  // registrations per month (last 6 months)
  const sixMonths = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = await prisma.user.count({ where: { createdAt: { gte: start, lt: end } } });
    sixMonths.push({
      month: start.toLocaleString("en", { month: "short" }),
      year: start.getFullYear(),
      value: count,
    });
  }

  // facility workload
  const facilityWorkload = await prisma.facility.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      district: true,
      _count: { select: { appointments: true, queueTokens: true, doctors: true } },
    },
  });

  res.json({
    success: true,
    data: {
      kpis: {
        patients: patientCount,
        healthWorkers: healthWorkerCount,
        doctors: doctorCount,
        facilities: facilityCount,
        appointments: appointmentCount,
        referrals: referralCount,
        pendingReferrals,
        emergencies: emergencyCount,
        lowStock: lowStockCount,
        followUps: followUpCount,
        completedFollowUps,
        consultations: totalConsultations,
      },
      appointmentsByStatus,
      referralsByStatus,
      registrationsTrend: sixMonths,
      facilityWorkload,
    },
  });
});

const facilityAnalytics = asyncHandler(async (req, res) => {
  const admin = req.user.role === "FACILITY_ADMIN"
    ? await prisma.facilityAdmin.findUnique({ where: { userId: req.user.id } })
    : null;
  const facilityId = req.query.facilityId || admin?.facilityId;
  if (!facilityId) return res.json({ success: true, data: null });

  const [
    appointments,
    queue,
    doctors,
    inventory,
    referralsTo,
    referralsFrom,
  ] = await Promise.all([
    prisma.appointment.findMany({ where: { facilityId } }),
    prisma.queueToken.findMany({ where: { facilityId } }),
    prisma.doctor.count({ where: { facilityId } }),
    prisma.medicineInventory.findMany({ where: { facilityId }, include: { medicine: true } }),
    prisma.referral.findMany({ where: { toFacilityId: facilityId } }),
    prisma.referral.findMany({ where: { fromFacilityId: facilityId } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = appointments.filter((a) => a.scheduledAt >= today).length;

  res.json({
    success: true,
    data: {
      facility: { id: facilityId },
      kpis: {
        todayAppointments: todayCount,
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter((a) => a.status === "COMPLETED").length,
        waitingQueue: queue.filter((q) => q.status === "WAITING").length,
        doctors,
        lowStock: inventory.filter((i) => i.quantity <= i.lowStockThreshold).length,
        referralsReceived: referralsTo.length,
        referralsSent: referralsFrom.length,
      },
      appointmentsByStatus: Object.entries(
        appointments.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({ status, count })),
    },
  });
});

module.exports = { systemAnalytics, facilityAnalytics };