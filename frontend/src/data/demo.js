// DEMO data used when the API/database is not reachable.
// Every consumer shows this behind an explicit "Demo data" badge.
// No claim is made that these are real records.

const now = new Date();
const iso = (daysFromNow, hour = 10) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const past = (daysAgo) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const demoFacilities = [
  { id: 'f1', name: 'Chikhaldara PHC', type: 'PHC', district: 'Amravati', state: 'Maharashtra', lat: 21.4137, lng: 77.3342, services: ['General OPD'], beds: 6 },
  { id: 'f2', name: 'Amravati CHC', type: 'CHC', district: 'Amravati', state: 'Maharashtra', lat: 20.9323, lng: 77.7621, services: ['General OPD', 'Diagnostics', 'Emergency'], beds: 30 },
  { id: 'f3', name: 'Amravati District Hospital', type: 'District Hospital', district: 'Amravati', state: 'Maharashtra', lat: 20.9331, lng: 77.7598, services: ['General OPD', 'Diagnostics', 'Surgery', 'Emergency', 'Maternity'], beds: 300 },
  { id: 'f4', name: 'Akola PHC', type: 'PHC', district: 'Akola', state: 'Maharashtra', lat: 20.7032, lng: 77.009, services: ['General OPD'], beds: 6 },
  { id: 'f5', name: 'Akola CHC', type: 'CHC', district: 'Akola', state: 'Maharashtra', lat: 20.6993, lng: 77.0305, services: ['General OPD', 'Diagnostics', 'Emergency'], beds: 30 },
  { id: 'f6', name: 'Akola District Hospital', type: 'District Hospital', district: 'Akola', state: 'Maharashtra', lat: 20.7029, lng: 77.0011, services: ['General OPD', 'Diagnostics', 'Surgery', 'Emergency', 'Maternity'], beds: 280 },
];

export const demoDoctors = [
  { id: 'd1', userId: 'u-d1', name: 'Dr. Sneha Deshmukh', specialization: 'General Physician', registrationNo: 'MH-12345', facilityId: 'f2', facility: { id: 'f2', name: 'Amravati CHC' } },
  { id: 'd2', userId: 'u-d2', name: 'Dr. Sameer Patil', specialization: 'Surgeon', registrationNo: 'MH-23456', facilityId: 'f3', facility: { id: 'f3', name: 'Amravati District Hospital' } },
  { id: 'd3', userId: 'u-d3', name: 'Dr. Priya Joshi', specialization: 'Gynaecologist', registrationNo: 'MH-34567', facilityId: 'f3', facility: { id: 'f3', name: 'Amravati District Hospital' } },
  { id: 'd4', userId: 'u-d4', name: 'Dr. Ravi Kulkarni', specialization: 'Paediatrician', registrationNo: 'MH-45678', facilityId: 'f5', facility: { id: 'f5', name: 'Akola CHC' } },
  { id: 'd5', userId: 'u-d5', name: 'Dr. Anjali Rao', specialization: 'General Physician', registrationNo: 'MH-56789', facilityId: 'f5', facility: { id: 'f5', name: 'Akola CHC' } },
];

export const demoPatients = [
  { id: 'p1', userId: 'u-p1', abhaId: '83-XXXX-XXXX-4301', name: 'Ramesh Gaikwad', phone: '9000000001', email: 'patient@nirovveda.in', gender: 'Male', dateOfBirth: '1985-04-12', bloodGroup: 'O+', village: 'Chikhaldara', district: 'Amravati', chronicConditions: ['Hypertension'], allergies: [] },
  { id: 'p2', userId: 'u-p2', abhaId: '83-XXXX-XXXX-4302', name: 'Sunita Bhosale', phone: '9000000002', email: 'patient2@nirovveda.in', gender: 'Female', dateOfBirth: '1992-09-03', bloodGroup: 'B+', village: 'Semadoh', district: 'Amravati', chronicConditions: ['Diabetes'], allergies: ['Penicillin'] },
  { id: 'p3', userId: 'u-p3', abhaId: '83-XXXX-XXXX-4303', name: 'Mohan Wankhede', phone: '9000000003', email: 'patient3@nirovveda.in', gender: 'Male', dateOfBirth: '1960-11-22', bloodGroup: 'A+', village: 'Harisal', district: 'Akola', chronicConditions: ['Hypertension', 'Diabetes'], allergies: [] },
  { id: 'p4', userId: 'u-p4', abhaId: '83-XXXX-XXXX-4304', name: 'Kavita Zade', phone: '9000000004', email: 'patient4@nirovveda.in', gender: 'Female', dateOfBirth: '2015-02-18', bloodGroup: 'AB+', village: 'Semadoh', district: 'Amravati', chronicConditions: [], allergies: [] },
];

export const demoAppointments = [
  { id: 'a1', patientId: 'p1', doctorId: 'd1', facilityId: 'f2', scheduledAt: iso(0, 9), status: 'CONFIRMED', reason: 'BP review', consultationType: 'IN_PERSON', patient: { name: 'Ramesh Gaikwad', phone: '9000000001' }, doctor: { name: 'Dr. Sneha Deshmukh' }, facility: { name: 'Amravati CHC' } },
  { id: 'a2', patientId: 'p2', doctorId: 'd5', facilityId: 'f5', scheduledAt: iso(0, 11), status: 'CONFIRMED', reason: 'Sugar check', consultationType: 'TELEMEDICINE', patient: { name: 'Sunita Bhosale', phone: '9000000002' }, doctor: { name: 'Dr. Anjali Rao' }, facility: { name: 'Akola CHC' } },
  { id: 'a3', patientId: 'p3', doctorId: 'd2', facilityId: 'f3', scheduledAt: iso(1, 10), status: 'CONFIRMED', reason: 'Wound dressing review', consultationType: 'IN_PERSON', patient: { name: 'Mohan Wankhede', phone: '9000000003' }, doctor: { name: 'Dr. Sameer Patil' }, facility: { name: 'Amravati District Hospital' } },
  { id: 'a4', patientId: 'p4', doctorId: 'd4', facilityId: 'f5', scheduledAt: iso(2, 15), status: 'CONFIRMED', reason: 'Fever follow-up', consultationType: 'IN_PERSON', patient: { name: 'Kavita Zade', phone: '9000000004' }, doctor: { name: 'Dr. Ravi Kulkarni' }, facility: { name: 'Akola CHC' } },
  { id: 'a5', patientId: 'p1', doctorId: 'd1', facilityId: 'f2', scheduledAt: past(7), status: 'COMPLETED', reason: 'Annual check-up', consultationType: 'IN_PERSON', patient: { name: 'Ramesh Gaikwad', phone: '9000000001' }, doctor: { name: 'Dr. Sneha Deshmukh' }, facility: { name: 'Amravati CHC' } },
];

export const demoQueue = [
  { id: 'q1', tokenNumber: 1, patientId: 'p1', facilityId: 'f2', doctorId: 'd1', priority: 'LOW', status: 'IN_PROGRESS', patient: { name: 'Ramesh Gaikwad', phone: '9000000001' } },
  { id: 'q2', tokenNumber: 2, patientId: 'p2', facilityId: 'f2', doctorId: 'd1', priority: 'MODERATE', status: 'WAITING', patient: { name: 'Sunita Bhosale', phone: '9000000002' } },
  { id: 'q3', tokenNumber: 3, patientId: 'p4', facilityId: 'f2', doctorId: 'd1', priority: 'HIGH', status: 'WAITING', patient: { name: 'Kavita Zade', phone: '9000000004' } },
  { id: 'q4', tokenNumber: 1, patientId: 'p3', facilityId: 'f5', doctorId: 'd5', priority: 'LOW', status: 'WAITING', patient: { name: 'Mohan Wankhede', phone: '9000000003' } },
];

export const demoReferrals = [
  { id: 'r1', patientId: 'p1', fromFacilityId: 'f1', toFacilityId: 'f3', reason: 'Suspected cardiac issue — cardiology opinion', notes: 'Stable vitals', priority: 'HIGH', status: 'ACCEPTED', createdAt: past(1), patient: { name: 'Ramesh Gaikwad', phone: '9000000001' }, fromFacility: { name: 'Chikhaldara PHC' }, toFacility: { name: 'Amravati District Hospital' } },
  { id: 'r2', patientId: 'p2', fromFacilityId: 'f1', toFacilityId: 'f2', reason: 'Uncontrolled diabetes', notes: 'HbA1c 9.2', priority: 'MODERATE', status: 'CREATED', createdAt: past(0), patient: { name: 'Sunita Bhosale', phone: '9000000002' }, fromFacility: { name: 'Chikhaldara PHC' }, toFacility: { name: 'Amravati CHC' } },
  { id: 'r3', patientId: 'p3', fromFacilityId: 'f4', toFacilityId: 'f5', reason: 'Cataract surgery evaluation', priority: 'MODERATE', status: 'SCHEDULED', createdAt: past(2), patient: { name: 'Mohan Wankhede', phone: '9000000003' }, fromFacility: { name: 'Akola PHC' }, toFacility: { name: 'Akola CHC' } },
];

export const demoMedicines = [
  { id: 'm1', name: 'Paracetamol 500mg', category: 'Analgesic' },
  { id: 'm2', name: 'Amlodipine 5mg', category: 'Antihypertensive' },
  { id: 'm3', name: 'Metformin 500mg', category: 'Antidiabetic' },
  { id: 'm4', name: 'ORS Sachet', category: 'Rehydration' },
  { id: 'm5', name: 'Amoxicillin 250mg', category: 'Antibiotic' },
  { id: 'm6', name: 'Iron + Folic Acid', category: 'Supplement' },
  { id: 'm7', name: 'Cetirizine 10mg', category: 'Antihistamine' },
  { id: 'm8', name: 'Insulin (Mixtard)', category: 'Antidiabetic' },
];

export const demoInventory = [
  { id: 'i1', medicineId: 'm1', facilityId: 'f2', quantity: 120, lowStockThreshold: 30, medicine: demoMedicines[0], facility: demoFacilities[1] },
  { id: 'i2', medicineId: 'm2', facilityId: 'f2', quantity: 18, lowStockThreshold: 30, medicine: demoMedicines[1], facility: demoFacilities[1] },
  { id: 'i3', medicineId: 'm3', facilityId: 'f2', quantity: 64, lowStockThreshold: 40, medicine: demoMedicines[2], facility: demoFacilities[1] },
  { id: 'i4', medicineId: 'm4', facilityId: 'f1', quantity: 8, lowStockThreshold: 20, medicine: demoMedicines[3], facility: demoFacilities[0] },
  { id: 'i5', medicineId: 'm5', facilityId: 'f2', quantity: 210, lowStockThreshold: 40, medicine: demoMedicines[4], facility: demoFacilities[1] },
  { id: 'i6', medicineId: 'm6', facilityId: 'f1', quantity: 95, lowStockThreshold: 30, medicine: demoMedicines[5], facility: demoFacilities[0] },
  { id: 'i7', medicineId: 'm7', facilityId: 'f5', quantity: 0, lowStockThreshold: 25, medicine: demoMedicines[6], facility: demoFacilities[4] },
  { id: 'i8', medicineId: 'm8', facilityId: 'f5', quantity: 12, lowStockThreshold: 25, medicine: demoMedicines[7], facility: demoFacilities[4] },
];

export const demoFollowUps = [
  { id: 'fu1', patientId: 'p1', doctorId: 'd1', facilityId: 'f2', scheduledFor: iso(3, 10), reason: 'BP monitor follow-up', status: 'SCHEDULED', patient: { name: 'Ramesh Gaikwad', phone: '9000000001' }, doctor: { name: 'Dr. Sneha Deshmukh' } },
  { id: 'fu2', patientId: 'p2', doctorId: 'd5', facilityId: 'f5', scheduledFor: iso(-1, 9), reason: 'Diabetes check — missed visit', status: 'DUE', patient: { name: 'Sunita Bhosale', phone: '9000000002' }, doctor: { name: 'Dr. Anjali Rao' } },
  { id: 'fu3', patientId: 'p3', doctorId: 'd2', facilityId: 'f3', scheduledFor: iso(6, 12), reason: 'Post-op review', status: 'SCHEDULED', patient: { name: 'Mohan Wankhede', phone: '9000000003' }, doctor: { name: 'Dr. Sameer Patil' } },
];

export const demoDiagnostics = [
  { id: 't1', patientId: 'p1', doctorId: 'd1', facilityId: 'f2', testType: 'Blood Pressure (ABPM)', status: 'REPORT_READY', labNotes: 'Monitor over 24h', requestedAt: past(2) },
  { id: 't2', patientId: 'p2', doctorId: 'd5', facilityId: 'f5', testType: 'HbA1c', status: 'REQUESTED', labNotes: 'Fasting preferred', requestedAt: past(1) },
  { id: 't3', patientId: 'p3', doctorId: 'd2', facilityId: 'f3', testType: 'Chest X-Ray', status: 'SAMPLE_COLLECTED', labNotes: '', requestedAt: past(0) },
  { id: 't4', patientId: 'p4', doctorId: 'd4', facilityId: 'f5', testType: 'Complete Blood Count', status: 'COMPLETED', labNotes: '', requestedAt: past(4) },
];

export const demoEmergencies = [
  { id: 'e1', patientId: 'p3', alertLevel: 'HIGH', location: 'Harisal, Akola', description: 'Sudden breathlessness reported by family', status: 'ACTIVE', createdAt: past(0), patient: { name: 'Mohan Wankhede', phone: '9000000003' } },
  { id: 'e2', patientId: 'p1', alertLevel: 'MODERATE', location: 'Chikhaldara', description: 'Dizziness at home', status: 'RESOLVED', createdAt: past(3), patient: { name: 'Ramesh Gaikwad', phone: '9000000001' } },
];

export const demoNotifications = [
  { id: 'n1', type: 'APPOINTMENT', title: 'Appointment confirmed', message: 'BP review at Amravati CHC today at 9:00 AM.', read: false, createdAt: past(0) },
  { id: 'n2', type: 'REFERRAL', title: 'Referral accepted', message: 'Cardiology referral accepted by Amravati District Hospital.', read: false, createdAt: past(1) },
  { id: 'n3', type: 'LOW_STOCK', title: 'Low medicine stock', message: 'Amlodipine 5mg is low at Amravati CHC.', read: false, createdAt: past(0) },
];

export const demoRecords = [
  { id: 'rec1', patientId: 'p1', type: 'OPD_CONSULTATION', title: 'Hypertension consultation', notes: 'BP 150/95. Advised lifestyle modification, reviewed medication.', createdAt: past(7), createdByName: 'Dr. Sneha Deshmukh' },
  { id: 'rec2', patientId: 'p1', type: 'PRESCRIPTION', title: 'Antihypertensive refill', notes: 'Amlodipine 5mg OD x 30 days.', createdAt: past(30), createdByName: 'Dr. Sneha Deshmukh' },
];

export const demoVitals = [
  { id: 'v1', patientId: 'p1', bpSystolic: 150, bpDiastolic: 95, heartRate: 84, temperature: 98.4, oxygenSaturation: 97, respiratoryRate: 16, weightKg: 72, recordedAt: past(1), symptoms: ['headache'] },
  { id: 'v2', patientId: 'p1', bpSystolic: 144, bpDiastolic: 92, heartRate: 80, temperature: 98.2, oxygenSaturation: 98, respiratoryRate: 15, weightKg: 71.5, recordedAt: past(3), symptoms: [] },
  { id: 'v3', patientId: 'p2', bpSystolic: 126, bpDiastolic: 82, heartRate: 78, temperature: 98.6, oxygenSaturation: 98, respiratoryRate: 14, weightKg: 63, recordedAt: past(1), symptoms: ['fatigue'] },
];

export const demoSummary = {
  patient: { id: 'p1', userId: 'u-p1', abhaId: '83-XXXX-XXXX-4301', name: 'Ramesh Gaikwad', phone: '9000000001', gender: 'Male', bloodGroup: 'O+', village: 'Chikhaldara', district: 'Amravati', chronicConditions: ['Hypertension'] },
  worker: { id: 'w1', userId: 'u-w1', name: 'Sarita Ingale', designation: 'ANM', facilityId: 'f1', facility: { name: 'Chikhaldara PHC' } },
  doctor: { id: 'd1', userId: 'u-d1', name: 'Dr. Sneha Deshmukh', specialization: 'General Physician', facilityId: 'f2', facility: { name: 'Amravati CHC' } },
  facility: { id: 'f2', name: 'Amravati CHC', type: 'CHC', district: 'Amravati', beds: 30 },
};

export const demoAuto = { id: 'ai0', name: 'AI Triage Review' };

// Analytics demo payloads
export const demoAnalyticsSystem = {
  kpis: { patients: 4, healthWorkers: 2, doctors: 5, facilities: 6, appointments: 5, referrals: 3, pendingReferrals: 1, emergencies: 1, lowStock: 4, followUps: 3, completedFollowUps: 1, consultations: 1 },
  appointmentsByStatus: [
    { status: 'CONFIRMED', _count: 4 }, { status: 'COMPLETED', _count: 1 },
  ],
  referralsByStatus: [
    { status: 'CREATED', _count: 1 }, { status: 'ACCEPTED', _count: 1 }, { status: 'SCHEDULED', _count: 1 },
  ],
  registrationsTrend: [
    { month: 'Apr', year: 2026, value: 6 }, { month: 'May', year: 2026, value: 11 },
    { month: 'Jun', year: 2026, value: 9 }, { month: 'Jul', year: 2026, value: 16 },
    { month: 'Aug', year: 2026, value: 14 }, { month: 'Sep', year: 2026, value: 22 },
  ],
  facilityWorkload: demoFacilities.map((f) => ({ id: f.id, name: f.name, type: f.type, district: f.district, _count: { appointments: f.id === 'f2' ? 4 : 2, queueTokens: f.id === 'f2' ? 3 : 1, doctors: f.id === 'f3' ? 2 : 1 } })),
};

export const demoAnalyticsFacility = {
  kpis: {
    todayAppointments: 2, totalAppointments: 5, completedAppointments: 1,
    waitingQueue: 2, doctors: 1, lowStock: 2, referralsReceived: 1, referralsSent: 1,
  },
  appointmentsByStatus: [
    { status: 'CONFIRMED', count: 4 }, { status: 'COMPLETED', count: 1 },
  ],
};

export default {
  facilities: demoFacilities, doctors: demoDoctors, patients: demoPatients,
  appointments: demoAppointments, queue: demoQueue, referrals: demoReferrals,
  medicines: demoMedicines, inventory: demoInventory, followUps: demoFollowUps,
  diagnostics: demoDiagnostics, emergencies: demoEmergencies, notifications: demoNotifications,
  records: demoRecords, vitals: demoVitals, summary: demoSummary,
  analyticsSystem: demoAnalyticsSystem, analyticsFacility: demoAnalyticsFacility,
};