import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  Users, Stethoscope, MapPin, GitPullRequest, AlertTriangle, Pill, ClipboardCheck,
  FileBarChart, Loader2, ShieldAlert, Building2, Phone,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLoad, load } from '../../hooks/useLoad';
import { Card, KpiCard, PageHeader, EmptyState, StatusBadge } from '../../components/ui';
import { formatDate, formatDateTime } from '../../utils';
import demoData from '../../data/demo';
import ResearchPage from '../ResearchPage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function DemoBadge({ show }) {
  if (!show) return null;
  return <span className="badge badge-yellow">Demo data</span>;
}

function Home({ demo }) {
  const { data, loading } = useLoad(() => load('/dashboard'), null, []);
  const k = data?.kpis || {};
  const recentPatients = data?.recentPatients || demoData.patients;
  const recentReferrals = data?.recentReferrals || demoData.referrals;
  const recentEmergencies = data?.recentEmergencies || demoData.emergencies;
  const lowStock = data?.lowStock || demoData.inventory.filter((i) => i.quantity <= i.lowStockThreshold);

  return (
    <div>
      <PageHeader title="Platform Admin" subtitle="Executive overview of the Nirovveda network." actions={<DemoBadge show={demo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icon={Users} label="Patients" value={loading ? '…' : k.patients ?? 0} />
        <KpiCard icon={Stethoscope} label="Doctors" value={loading ? '…' : k.doctors ?? 0} />
        <KpiCard icon={Building2} label="Facilities" value={loading ? '…' : k.facilities ?? 0} />
        <KpiCard icon={Users} label="Health workers" value={loading ? '…' : k.healthWorkers ?? 0} />
        <KpiCard icon={ClipboardCheck} label="Appointments" value={loading ? '…' : k.appointments ?? 0} />
        <KpiCard icon={GitPullRequest} label="Active referrals" value={loading ? '…' : k.pendingReferrals ?? 0} accent="yellow" />
        <KpiCard icon={AlertTriangle} label="Emergencies" value={loading ? '…' : k.emergencies ?? 0} accent="red" />
        <KpiCard icon={Pill} label="Low stock" value={loading ? '…' : k.lowStock ?? lowStock.length} accent="red" />
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-error" role="alert">
          <ShieldAlert size={16} /> {lowStock.length} medicine(s) below threshold across {new Set(lowStock.map((i) => i.facility?.name)).size} facility/facilities. <Link to="medicine" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Review</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Recently registered patients" actions={<Link to="patients" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>All</Link>}>
          {recentPatients.length === 0 ? <EmptyState icon="👥" title="No patients" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentPatients.slice(0, 4).map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.user?.name || p.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{p.user?.phone}</div></div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{formatDate(p.createdAt || p.user?.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Recent referrals">
          {recentReferrals.length === 0 ? <EmptyState icon="🛌" title="No referrals" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentReferrals.slice(0, 4).map((r) => (
                <div key={r.id}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.patient?.user?.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>→ {r.toFacility?.name}</span></div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{formatDateTime(r.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Active emergencies" actions={<Link to="emergency" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>Manage</Link>}>
          {recentEmergencies.length === 0 ? <EmptyState icon="🛡️" title="No emergencies" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentEmergencies.map((e) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{e.patient?.user?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{e.location || '—'}</div>
                  </div>
                  <StatusBadge value={e.alertLevel} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function APatients() {
  const { data, loading } = useLoad(() => load('/patients'), demoData.patients, []);
  const list = data || [];
  return (
    <div>
      <PageHeader title="Patients" subtitle="All registered patients across the network." />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="👥" title="No patients" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>ABHA</th><th>Name</th><th>Phone</th><th>Village</th><th>District</th><th>Chronic</th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.abhaId || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{p.user?.name || p.name}</td>
                  <td>{p.user?.phone || p.phone}</td>
                  <td>{p.village || '—'}</td>
                  <td>{p.district || '—'}</td>
                  <td>{(p.chronicConditions || []).join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ADoctors() {
  const { data, loading } = useLoad(() => load('/doctors'), demoData.doctors, []);
  const list = data || [];
  return (
    <div>
      <PageHeader title="Doctors" subtitle="All practitioners on the platform." />
      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {list.map((d) => (
            <div key={d.id} className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-info-light)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(d.user?.name || d.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.user?.name || d.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{d.specialization} · Reg. {d.registrationNo}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.6rem' }}>📍 {d.facility?.name || demoData.facilities.find((f) => f.id === d.facilityId)?.name || 'Unassigned'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AFacilities() {
  const { data, loading } = useLoad(() => load('/facilities'), demoData.facilities, []);
  const list = data || [];
  return (
    <div>
      <PageHeader title="Facilities" subtitle="PHCs, CHCs and hospitals registered on the network." />
      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {list.map((f) => (
            <div key={f.id} className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{f.type} · {f.district}, {f.state}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(f.services || []).map((s) => <span key={s} className="badge badge-gray">{s}</span>)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.6rem' }}>{f._count?.doctors ?? 0} doctors</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AReferrals() {
  const { toast } = useToast();
  const { data, loading, reload } = useLoad(() => load('/referrals'), demoData.referrals, []);
  const list = data || [];
  const setStatus = async (id, status) => { try { await load(`/referrals/${id}/status`, 'PATCH', { status }); toast('Updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div>
      <PageHeader title="Referrals" subtitle="Cross-network referral tracking." />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="🛌" title="No referrals" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Created</th><th>Patient</th><th>Reason</th><th>From</th><th>To</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{r.patient?.user?.name}</td>
                  <td>{r.reason}</td>
                  <td>{r.fromFacility?.name}</td>
                  <td>{r.toFacility?.name || '—'}</td>
                  <td><StatusBadge value={r.priority} /></td>
                  <td><StatusBadge value={r.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {r.status === 'ACCEPTED' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(r.id, 'IN_PROGRESS')}>Start</button>}
                      {r.status === 'IN_PROGRESS' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(r.id, 'COMPLETED')}>Complete</button>}
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

function AEmergency() {
  const { toast } = useToast();
  const { data, loading, reload } = useLoad(() => load('/emergency'), demoData.emergencies, []);
  const list = data || [];
  const setStatus = async (id, status) => { try { await load(`/emergency/${id}/status`, 'PATCH', { status }); toast('Updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div>
      <PageHeader title="Emergency Escalations" subtitle="Monitor and coordinate high-priority alerts." />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="🛡️" title="No emergency alerts" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Raised</th><th>Patient</th><th>Phone</th><th>Location</th><th>Description</th><th>Level</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <td>{formatDateTime(e.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{e.patient?.user?.name}</td>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} /> {e.patient?.user?.phone}</span></td>
                  <td>{e.location || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{e.description}</td>
                  <td><StatusBadge value={e.alertLevel} /></td>
                  <td><StatusBadge value={e.status} /></td>
                  <td>
                    {e.status === 'ACTIVE' && <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(e.id, 'ATTENDED')}>Mark attended</button>}
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

function AMedicine() {
  const { data, loading } = useLoad(() => load('/medicines/low-stock'), demoData.inventory.filter((i) => i.quantity <= i.lowStockThreshold), []);
  const list = data || [];
  return (
    <div>
      <PageHeader title="Medicine Stock Alerts" subtitle="All low and out-of-stock items across the network." />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="✅" title="No low-stock items" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Medicine</th><th>Facility</th><th>District</th><th>Qty</th><th>Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.medicine?.name}</td>
                  <td>{i.facility?.name}</td>
                  <td>{i.facility?.district}</td>
                  <td>{i.quantity}</td>
                  <td>{i.lowStockThreshold}</td>
                  <td>{i.quantity === 0 ? <StatusBadge value="OUT_OF_STOCK" /> : <StatusBadge value="LOW" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AAnalytics({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/analytics'), demoData.analyticsSystem, []);
  if (loading) return <div className="spinner" />;
  const d = data || demoData.analyticsSystem;
  const k = d.kpis || {};
  const trend = d.registrationsTrend || [];
  const workload = d.facilityWorkload || [];
  return (
    <div>
      <PageHeader title="Platform Analytics" subtitle="Adoption and workload across the network." actions={<DemoBadge show={demo || isDemo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icon={Users} label="Patients" value={k.patients ?? 0} />
        <KpiCard icon={Stethoscope} label="Doctors" value={k.doctors ?? 0} />
        <KpiCard icon={Building2} label="Facilities" value={k.facilities ?? 0} />
        <KpiCard label="Appointments" value={k.appointments ?? 0} />
        <KpiCard label="Referrals" value={k.referrals ?? 0} />
        <KpiCard label="Emergencies" value={k.emergencies ?? 0} accent="red" />
        <KpiCard label="Low-stock" value={k.lowStock ?? 0} accent="red" />
        <KpiCard label="Consultations (completed)" value={k.consultations ?? 0} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="User registrations — last 6 months">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" name="Registrations" stroke="#0f766e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Facility workload">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={workload.map((f) => ({ name: f.name, appointments: f._count.appointments, queue: f._count.queueTokens }))}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="queue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }} className="insights-grid">
        <Card title="Appointments by status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(d.appointmentsByStatus || []).map((s) => ({ name: s.status, count: s._count }))}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip /><Legend />
              <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Referrals by status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(d.referralsByStatus || []).map((s) => ({ name: s.status, count: s._count }))}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip /><Legend />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="patients" element={<APatients />} />
      <Route path="doctors" element={<ADoctors />} />
      <Route path="facilities" element={<AFacilities />} />
      <Route path="referrals" element={<AReferrals />} />
      <Route path="emergency" element={<AEmergency />} />
      <Route path="medicine" element={<AMedicine />} />
      <Route path="analytics" element={<AAnalytics />} />
      <Route path="research" element={<ResearchPage embedded />} />
    </Routes>
  );
}