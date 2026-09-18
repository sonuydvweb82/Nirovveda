import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  ListOrdered, CalendarDays, Stethoscope, GitPullRequest, Pill, FileBarChart,
  ClipboardCheck, MapPin, Loader2, AlertTriangle, RefreshCw, Users,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLoad, load } from '../../hooks/useLoad';
import { Card, KpiCard, PageHeader, EmptyState, StatusBadge, Modal } from '../../components/ui';
import { formatDate, formatDateTime } from '../../utils';
import demoData from '../../data/demo';
import HealthcareMap from '../HealthcareMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DemoBadge({ show }) {
  if (!show) return null;
  return <span className="badge badge-yellow">Demo data</span>;
}

function Home({ demo }) {
  const { data, loading } = useLoad(() => load('/dashboard'), null, []);
  const k = data?.kpis || {};
  const queue = data?.queue || demoData.queue;
  const lowStock = data?.lowStock || demoData.inventory.filter((i) => i.quantity <= i.lowStockThreshold);
  const todayAppointments = data?.todayAppointments || demoData.appointments;

  return (
    <div>
      <PageHeader title="Facility Dashboard" subtitle="Operational view of your facility." actions={<DemoBadge show={demo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icon={CalendarDays} label="Appointments today" value={loading ? '…' : k.todayAppointments ?? todayAppointments.length} />
        <KpiCard icon={ListOrdered} label="In queue" value={loading ? '…' : k.waitingQueue ?? queue.filter((q) => q.status === 'WAITING').length} accent="yellow" />
        <KpiCard icon={Pill} label="Low-stock items" value={loading ? '…' : k.lowStock ?? lowStock.length} accent="red" />
        <KpiCard icon={Stethoscope} label="Doctors" value={loading ? '…' : k.doctors ?? 0} />
        <KpiCard icon={GitPullRequest} label="Referrals in" value={loading ? '…' : k.pendingReferralsIn ?? data?.referralsTo?.length ?? 0} />
        <KpiCard icon={FileBarChart} label="Pending diagnostics" value={loading ? '…' : k.pendingDiagnostics ?? 0} accent="yellow" />
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={16} /> {lowStock.length} medicine(s) are below reorder threshold. <Link to="medicine" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Review inventory</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Live queue" actions={<Link to="queue" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>Manage</Link>}>
          {queue.length === 0 ? <EmptyState icon="🎫" title="Queue empty" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {queue.slice(0, 5).map((q) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{q.tokenNumber}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{q.patient?.user?.name || q.patient?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{q.patient?.user?.phone}</div>
                  </div>
                  <StatusBadge value={q.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Today's appointments">
          {todayAppointments.length === 0 ? <EmptyState icon="🗓️" title="No appointments today" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {todayAppointments.slice(0, 5).map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{a.patient?.user?.name || a.patient?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{formatDateTime(a.scheduledAt)}</div>
                  </div>
                  <StatusBadge value={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function FQueue({ demo }) {
  const { toast } = useToast();
  const { data, loading, reload, isDemo } = useLoad(() => load('/queue'), demoData.queue, []);
  const q = data || [];
  const call = async (id) => { await load(`/queue/${id}/call`, 'POST', {}); toast('Token called', 'success'); reload(); };
  const complete = async (id) => { await load(`/queue/${id}/complete`, 'POST', {}); toast('Completed', 'success'); reload(); };
  const skip = async (id) => { await load(`/queue/${id}/skip`, 'POST', {}); toast('Skipped', 'info'); reload(); };
  return (
    <div>
      <PageHeader title="Queue Management" actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : q.length === 0 ? <EmptyState icon="🎫" title="Queue empty" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Token</th><th>Patient</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {q.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700 }}>#{t.tokenNumber}</td>
                  <td>{t.patient?.user?.name || t.patient?.name}</td>
                  <td><StatusBadge value={t.priority} /></td>
                  <td><StatusBadge value={t.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {t.status === 'WAITING' && <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => call(t.id)}>Call</button>}
                      {t.status === 'IN_PROGRESS' && <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => complete(t.id)}>Complete</button>}
                      {t.status === 'WAITING' && <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => skip(t.id)}>Skip</button>}
                    </div>
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

function FAppointments({ demo }) {
  const { toast } = useToast();
  const { data, loading, reload, isDemo } = useLoad(() => load('/appointments'), demoData.appointments, []);
  const list = data || [];
  const setStatus = async (id, status) => { try { await load(`/appointments/${id}/status`, 'PATCH', { status }); toast('Updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div>
      <PageHeader title="Appointments" actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="🗓️" title="No appointments" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.scheduledAt)}</td>
                  <td style={{ fontWeight: 600 }}>{a.patient?.user?.name || a.patient?.name}</td>
                  <td>{a.doctor?.user?.name || '—'}</td>
                  <td>{a.consultationType === 'TELEMEDICINE' ? 'Tele' : 'In-person'}</td>
                  <td><StatusBadge value={a.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {a.status === 'CONFIRMED' && <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(a.id, 'IN_PROGRESS')}>Start</button>}
                      {a.status === 'IN_PROGRESS' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(a.id, 'COMPLETED')}>Done</button>}
                    </div>
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

function FDoctors({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/doctors'), demoData.doctors.filter((d) => d.facilityId === 'f2'), []);
  const list = data || [];
  return (
    <div>
      <PageHeader title="Doctors" subtitle="Practitioners at your facility." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="🩺" title="No doctors assigned" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {list.map((d) => (
            <div key={d.id} className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-info-light)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(d.user?.name || d.name || '?' ).split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.user?.name || d.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{d.specialization}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.6rem' }}>Reg. No. {d.registrationNo || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FReferrals({ demo }) {
  const { toast } = useToast();
  const { data, loading, reload, isDemo } = useLoad(() => load('/referrals'), demoData.referrals, []);
  const r = data || [];
  const accept = async (id) => { try { await load(`/referrals/${id}/accept`, 'POST', {}); toast('Referral accepted', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  const setStatus = async (id, status) => { try { await load(`/referrals/${id}/status`, 'PATCH', { status }); toast('Updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div>
      <PageHeader title="Referrals" subtitle="Incoming and outgoing referrals." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : r.length === 0 ? <EmptyState icon="🛌" title="No referrals" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Created</th><th>Patient</th><th>Reason</th><th>From</th><th>To</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {r.map((rf) => (
                <tr key={rf.id}>
                  <td>{formatDate(rf.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{rf.patient?.user?.name || rf.patient?.name}</td>
                  <td>{rf.reason}</td>
                  <td>{rf.fromFacility?.name}</td>
                  <td>{rf.toFacility?.name || '—'}</td>
                  <td><StatusBadge value={rf.priority} /></td>
                  <td><StatusBadge value={rf.status} /></td>
                  <td>
                    {rf.status === 'CREATED' && <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => accept(rf.id)}>Accept</button>}
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

function FMedicine({ demo }) {
  const { toast } = useToast();
  const { data, loading, reload, isDemo } = useLoad(() => load('/medicines/inventory'), demoData.inventory, []);
  const inv = data || [];
  const low = inv.filter((i) => i.quantity <= i.lowStockThreshold);
  const update = async (id, quantity) => {
    try { await load(`/medicines/inventory/${id}`, 'PATCH', { quantity }); toast('Stock updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <div>
      <PageHeader title="Medicine Inventory" subtitle="Stock levels, thresholds and restocking." actions={<><DemoBadge show={demo || isDemo} /><button className="btn-secondary" onClick={reload}><RefreshCw size={15} /></button></>} />
      {low.length > 0 && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={16} /> {low.length} item(s) at or below reorder threshold.
        </div>
      )}
      {loading ? <div className="spinner" /> : inv.length === 0 ? <EmptyState icon="💊" title="No inventory loaded" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Medicine</th><th>Category</th><th>Qty</th><th>Threshold</th><th>Status</th><th>Restock</th></tr></thead>
            <tbody>
              {inv.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.medicine?.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{i.medicine?.category || '—'}</td>
                  <td>{i.quantity}</td>
                  <td>{i.lowStockThreshold}</td>
                  <td>{i.quantity === 0 ? <StatusBadge value="OUT_OF_STOCK" /> : i.quantity <= i.lowStockThreshold ? <StatusBadge value="LOW" /> : <StatusBadge value="AVAILABLE" />}</td>
                  <td>
                    <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => update(i.id, i.quantity + 50)}>+50</button>
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

function FDiagnostics({ demo }) {
  const { toast } = useToast();
  const { data, loading, reload, isDemo } = useLoad(() => load('/diagnostics'), demoData.diagnostics, []);
  const list = data || [];
  const setStatus = async (id, status) => { try { await load(`/diagnostics/${id}/status`, 'PATCH', { status }); toast('Updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div>
      <PageHeader title="Diagnostics" subtitle="Test workflow for the facility lab." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="🧪" title="No tests" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Requested</th><th>Patient</th><th>Test</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.requestedAt)}</td>
                  <td style={{ fontWeight: 600 }}>{t.patient?.user?.name || t.patient?.name}</td>
                  <td>{t.testType}</td>
                  <td><StatusBadge value={t.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {t.status === 'REQUESTED' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(t.id, 'SCHEDULED')}>Schedule</button>}
                      {t.status === 'SCHEDULED' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(t.id, 'SAMPLE_COLLECTED')}>Sample</button>}
                      {t.status === 'SAMPLE_COLLECTED' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(t.id, 'REPORT_READY')}>Report</button>}
                    </div>
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

function FAnalytics({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/analytics/facility'), demoData.analyticsFacility, []);
  if (loading) return <div className="spinner" />;
  const d = data || demoData.analyticsFacility;
  const k = d.kpis || {};
  return (
    <div>
      <PageHeader title="Facility Analytics" subtitle="Operational performance of this facility." actions={<DemoBadge show={demo || isDemo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard label="Appointments (all time)" value={k.totalAppointments ?? 0} />
        <KpiCard label="Completed" value={k.completedAppointments ?? 0} accent="green" />
        <KpiCard label="Waiting now" value={k.waitingQueue ?? 0} accent="yellow" />
        <KpiCard label="Low-stock items" value={k.lowStock ?? 0} accent="red" />
        <KpiCard label="Referrals received" value={k.referralsReceived ?? 0} />
        <KpiCard label="Referrals sent" value={k.referralsSent ?? 0} />
      </div>
      <Card title="Appointments by status">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={(d.appointmentsByStatus || []).map((s) => ({ name: s.status, count: s.count }))}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function FMap() {
  const { data, loading } = useLoad(() => load('/facilities'), demoData.facilities, []);
  return (
    <div>
      <PageHeader title="Facility Map" subtitle="Locations across the demo network." />
      {loading ? <div className="spinner" /> : <HealthcareMap facilities={data || []} />}
    </div>
  );
}

export default function FacilityDashboard() {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="queue" element={<FQueue />} />
      <Route path="appointments" element={<FAppointments />} />
      <Route path="doctors" element={<FDoctors />} />
      <Route path="referrals" element={<FReferrals />} />
      <Route path="medicine" element={<FMedicine />} />
      <Route path="diagnostics" element={<FDiagnostics />} />
      <Route path="analytics" element={<FAnalytics />} />
      <Route path="map" element={<FMap />} />
    </Routes>
  );
}