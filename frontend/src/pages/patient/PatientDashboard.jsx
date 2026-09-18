import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  CalendarDays, FileBarChart, GitPullRequest, Pill, MapPin, Video, ClipboardCheck,
  HeartPulse, Info, ExternalLink, Phone, User, Loader2, Search, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLoad, load } from '../../hooks/useLoad';
import { Card, KpiCard, PageHeader, EmptyState, Modal, StatusBadge } from '../../components/ui';
import { formatDate, formatDateTime, isToday } from '../../utils';
import demoData from '../../data/demo';
import HealthcareMap from '../HealthcareMap';

function DemoBadge({ show }) {
  if (!show) return null;
  return <span className="badge badge-yellow">Demo data</span>;
}

function Home({ profile, demo }) {
  const { data, loading } = useLoad(
    () => load('/dashboard'),
    null,
    []
  );

  const k = data?.kpis || {};
  const appointments = data?.appointments || demoData.appointments;
  const referrals = data?.referrals || demoData.referrals;
  const followUps = data?.followUps || demoData.followUps;
  const notifications = data?.notifications || demoData.notifications;
  const queue = data?.queue;

  return (
    <div>
      <PageHeader
        title="Your Health Dashboard"
        subtitle="A continuous view of your care across facilities."
        actions={<DemoBadge show={demo} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icon={CalendarDays} label="Upcoming appointments" value={loading ? '…' : k.upcomingAppointments ?? 0} />
        <KpiCard icon={GitPullRequest} label="Active referrals" value={loading ? '…' : k.activeReferrals ?? referrals.length} accent="yellow" />
        <KpiCard icon={ClipboardCheck} label="Follow-ups due" value={loading ? '…' : k.pendingFollowUps ?? followUps.filter((f) => f.status === 'DUE').length} accent="red" />
        <KpiCard icon={HeartPulse} label="Unread notifications" value={loading ? '…' : k.unreadNotifications ?? notifications.length} />
      </div>

      {queue && queue.status === 'WAITING' && (
        <div className="alert" style={{ background: 'var(--color-info-light)', border: '1px solid #bfdbfe', color: 'var(--color-info)' }}>
          <Info size={16} /> Your token <b>#{queue.tokenNumber}</b> is currently waiting at <b>{queue.facility?.name}</b>.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Upcoming appointments" actions={<Link to="appointments" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>Book / view</Link>}>
          {loading ? <div className="spinner" /> : appointments.length === 0 ? (
            <EmptyState icon="🗓️" title="No upcoming appointments" subtitle="Book a consultation from the Appointments page." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {appointments.slice(0, 4).map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.doctor?.user?.name || a.doctor?.name || 'Facility consultation'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{a.facility?.name} · {formatDateTime(a.scheduledAt)}</div>
                  </div>
                  <StatusBadge value={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Active referrals" actions={<Link to="referrals" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>View all</Link>}>
          {referrals.length === 0 ? (
            <EmptyState icon="🛌" title="No active referrals" subtitle="Referrals will appear here when created." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {referrals.slice(0, 4).map((r) => (
                <div key={r.id} style={{ padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.reason}</span>
                    <StatusBadge value={r.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {r.fromFacility?.name} <b>→</b> {r.toFacility?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <Card title="Notifications" actions={<Link to="/app/patient/notifications" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>See all</Link>}>
          {notifications.length === 0 ? <EmptyState icon="🔔" title="You're all caught up" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.5rem', borderRadius: 10, background: n.read ? 'transparent' : 'var(--color-info-light)' }}>
                  <BellIcon type={n.type} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{n.message}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function BellIcon({ type }) {
  const color = type === 'EMERGENCY' ? 'var(--color-danger)' : 'var(--color-info)';
  return <ClipboardCheck size={16} style={{ color, marginTop: 2 }} />;
}

function Appointments({ demo }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data, loading, reload, isDemo } = useLoad(() => load(`/appointments?${new URLSearchParams({ date })}`), demoData.appointments, [date]);
  const { data: facilities } = useLoad(() => load('/facilities'), demoData.facilities, []);
  const { data: doctors } = useLoad(() => load('/doctors'), demoData.doctors, []);
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookOpen, setBookOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ facilityId: '', doctorId: '', time: '', reason: '', consultationType: 'IN_PERSON' });

  const book = async (e) => {
    e.preventDefault();
    setBooking(true);
    try {
      const me = await load('/auth/me');
      const patientId = me?.user?.profile?.id;
      if (!patientId) throw new Error('Patient profile not found. Please contact support.');
      const res = await load('/appointments', 'POST', {
        patientId,
        doctorId: form.doctorId || null,
        facilityId: form.facilityId,
        scheduledAt: `${date}T${form.time}`,
        reason: form.reason,
        consultationType: form.consultationType,
      });
      toast('Appointment booked', 'success');
      setBookOpen(false);
      reload();
    } catch (err) {
      toast(err.message || 'Could not book appointment', 'error');
    } finally {
      setBooking(false);
    }
  };

  const cancel = async (id) => {
    try {
      await load(`/appointments/${id}/cancel`, 'PATCH', {});
      toast('Appointment cancelled', 'info');
      reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Book and manage consultations across the Nirovveda network."
        actions={
          <>
            <DemoBadge show={demo || isDemo} />
            <button className="btn-primary" onClick={() => setBookOpen(true)}><CalendarDays size={16} /> Book appointment</button>
          </>
        }
      />

      <div className="filter-bar">
        <input type="date" className="input" style={{ width: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn-secondary" onClick={reload}><RefreshCw size={15} /> Refresh</button>
      </div>

      {loading ? <div className="spinner" /> : data.length === 0 ? (
        <EmptyState icon="🗓️" title="No appointments" subtitle="Book a new appointment to get started." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Doctor</th><th>Facility</th><th>Type</th><th>Reason</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.scheduledAt)}</td>
                  <td>{a.doctor?.user?.name || a.doctor?.name || '—'}</td>
                  <td>{a.facility?.name}</td>
                  <td>{a.consultationType === 'TELEMEDICINE' ? 'Tele' : 'In-person'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{a.reason || '-'}</td>
                  <td><StatusBadge value={a.status} /></td>
                  <td>
                    {['CONFIRMED', 'PENDING'].includes(a.status) && (
                      <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }} onClick={() => cancel(a.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={bookOpen} title="Book an appointment" onClose={() => setBookOpen(false)}>
        <form onSubmit={book}>
          <label className="form-label">Facility</label>
          <select className="form-input" value={form.facilityId} onChange={(e) => setForm({ ...form, facilityId: e.target.value })} required>
            <option value="">Select facility</option>
            {(facilities || []).map((f) => <option key={f.id} value={f.id}>{f.name} ({f.type})</option>)}
          </select>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Doctor (optional)</label>
          <select className="form-input" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
            <option value="">Any available doctor</option>
            {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.user?.name || d.name} — {d.specialization}</option>)}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.8rem' }} className="form-row">
            <div>
              <label className="form-label">Time</label>
              <select className="form-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required>
                {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Consultation</label>
              <select className="form-input" value={form.consultationType} onChange={(e) => setForm({ ...form, consultationType: e.target.value })}>
                <option value="IN_PERSON">In-person</option>
                <option value="TELEMEDICINE">Telemedicine</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Reason</label>
          <input className="form-input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. BP review" />
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={booking}>
            {booking ? <Loader2 size={16} className="spin" /> : 'Confirm booking'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Records({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/dashboard'), null, []);
  const records = data?.recentRecords || demoData.records;
  const presc = data?.prescriptions || [];
  const diag = data?.diagnosticTests || demoData.diagnostics;

  return (
    <div>
      <PageHeader title="My Records" subtitle="Your longitudinal health record — abha-aligned continuity across the network." actions={<DemoBadge show={demo || isDemo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Medical records">
          {loading ? <div className="spinner" /> : records.length === 0 ? <EmptyState icon="📋" title="No records yet" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {records.map((r) => (
                <div key={r.id} style={{ padding: '0.7rem', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.title}</span>
                    <span className="badge badge-gray">{r.type?.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{r.notes}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>{r.createdBy?.name || r.createdByName} · {formatDate(r.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Diagnostics">
            {diag.length === 0 ? <EmptyState icon="🧪" title="No tests" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {diag.slice(0, 5).map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.testType}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{formatDate(t.requestedAt)}</div>
                    </div>
                    <StatusBadge value={t.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
          <div className="alert" style={{ background: 'var(--color-info-light)', border: '1px solid #bfdbfe', color: 'var(--color-info)' }}>
            <Info size={16} /> Your records are designed to be ABHA-aligned — portable across any ABDM-compliant facility.
          </div>
        </div>
      </div>
    </div>
  );
}

function Referrals({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/referrals'), demoData.referrals, []);
  const r = data || [];
  return (
    <div>
      <PageHeader title="Referrals" subtitle="Track every referral from origin to completion." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : r.length === 0 ? <EmptyState icon="🛌" title="No referrals yet" subtitle="Referrals created by your care team will appear here." /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Created</th><th>Reason</th><th>From</th><th>To</th><th>Priority</th><th>Status</th></tr></thead>
            <tbody>
              {r.map((rf) => (
                <tr key={rf.id}>
                  <td>{formatDate(rf.createdAt)}</td>
                  <td>{rf.reason}</td>
                  <td>{rf.fromFacility?.name}</td>
                  <td><b>→</b> {rf.toFacility?.name || 'To be assigned'}</td>
                  <td><StatusBadge value={rf.priority} /></td>
                  <td><StatusBadge value={rf.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Medicine({ demo }) {
  const [q, setQ] = useState('');
  const { data, loading, reload, isDemo } = useLoad(() => load(`/medicines/availability?${q ? new URLSearchParams({ medicine: q }) : ''}`), demoData.inventory, [q]);
  return (
    <div>
      <PageHeader title="Medicine Availability" subtitle="Search which facility stocks a medicine today." actions={<DemoBadge show={demo || isDemo} />} />
      <div className="filter-bar">
        <div className="input-icon" style={{ width: 260 }}>
          <Search size={16} />
          <input className="form-input" placeholder="Search medicine (e.g. amlodipine)" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={reload}><RefreshCw size={15} /></button>
      </div>
      {loading ? <div className="spinner" /> : data.length === 0 ? <EmptyState icon="💊" title="No stock found" subtitle="Try a different medicine or check facility inventory." /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Medicine</th><th>Facility</th><th>Qty on shelf</th><th>Status</th></tr></thead>
            <tbody>
              {data.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.medicine?.name}</td>
                  <td>{i.facility?.name} · {i.facility?.district}</td>
                  <td>{i.quantity} units</td>
                  <td>
                    {i.quantity === 0 ? <StatusBadge value="OUT_OF_STOCK" /> : i.quantity <= i.lowStockThreshold ? <StatusBadge value="LOW" /> : <StatusBadge value="AVAILABLE" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MapPage({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/facilities'), demoData.facilities, []);
  return (
    <div>
      <PageHeader title="Nearby Facilities" subtitle="PHCs, CHCs and hospitals in the demo network." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : <HealthcareMap facilities={data || []} />}
    </div>
  );
}

function Teleconsult({ demo }) {
  const { user } = useAuth();
  const [room, setRoom] = useState(`nirovveda-${(user?.name || 'patient').toLowerCase().replace(/\s/g, '-')}-${Date.now().toString(36)}`);
  return (
    <div>
      <PageHeader title="Teleconsultation" subtitle="Assisted video consultation supported by the facility team." actions={<DemoBadge show={demo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Your consultation room">
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Teleconsultation is delivered through the model proven by India's national eSanjeevani initiative —
            connecting rural patients to doctors at district facilities. In this prototype, room IDs are simulated.
          </p>
          <label className="form-label" style={{ marginTop: '0.75rem' }}>Room ID</label>
          <input className="form-input" value={room} onChange={(e) => setRoom(e.target.value)} readOnly />
          <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => window.open(`/teleconsultation/${room}`, '_blank')}>
            <Video size={16} /> Join consultation room
          </button>
        </Card>
        <Card title="Joining checklist">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            {['Good internet / visit nearest AB-HWC access point', 'Aadhaar or ABHA ID optional for identification', 'Keep medicine list and latest vitals handy', 'A health worker can assist you at the facility'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <User size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Followups({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/follow-ups'), demoData.followUps, []);
  const r = data || [];
  return (
    <div>
      <PageHeader title="Follow-ups" subtitle="Scheduled follow-up visits keep your care continuous." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : r.length === 0 ? <EmptyState icon="📌" title="No follow-ups" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Scheduled</th><th>Reason</th><th>Doctor</th><th>Facility</th><th>Status</th></tr></thead>
            <tbody>
              {r.map((f) => (
                <tr key={f.id}>
                  <td>{formatDate(f.scheduledFor)}</td>
                  <td>{f.reason}</td>
                  <td>{f.doctor?.user?.name || f.doctor?.name || '—'}</td>
                  <td>{f.facility?.name || '—'}</td>
                  <td><StatusBadge value={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { data, loading } = useLoad(() => load('/notifications'), demoData.notifications, []);
  const r = data || [];
  return (
    <div>
      <PageHeader title="Notifications" />
      {loading ? <div className="spinner" /> : r.length === 0 ? <EmptyState icon="🔔" title="Nothing here" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {r.map((n) => (
            <div key={n.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.9rem 1rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 10 }}>
              <BellIcon type={n.type} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{n.message}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{formatDateTime(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="records" element={<Records />} />
      <Route path="referrals" element={<Referrals />} />
      <Route path="medicine" element={<Medicine />} />
      <Route path="map" element={<MapPage />} />
      <Route path="teleconsult" element={<Teleconsult />} />
      <Route path="followups" element={<Followups />} />
      <Route path="notifications" element={<Notifications />} />
    </Routes>
  );
}