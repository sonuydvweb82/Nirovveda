import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  CalendarDays, ListOrdered, Users, Stethoscope, GitPullRequest, FileBarChart,
  Video, ClipboardCheck, Loader2, Search, AlertTriangle, CheckCircle2, Plus, Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLoad, load } from '../../hooks/useLoad';
import { Card, KpiCard, PageHeader, EmptyState, StatusBadge, Modal } from '../../components/ui';
import { formatDate, formatDateTime } from '../../utils';
import demoData from '../../data/demo';

function DemoBadge({ show }) {
  if (!show) return null;
  return <span className="badge badge-yellow">Demo data</span>;
}

function Home({ demo }) {
  const { data, loading } = useLoad(() => load('/dashboard'), null, []);
  const k = data?.kpis || {};
  const today = data?.todayAppointments || demoData.appointments;
  const highRisk = data?.highRiskReferrals || [];
  const queue = data?.queue || demoData.queue;

  return (
    <div>
      <PageHeader title="Doctor Dashboard" subtitle="Today's clinical workload at a glance." actions={<DemoBadge show={demo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icon={CalendarDays} label="Appointments today" value={loading ? '…' : k.todayAppointments ?? today.filter((a) => ['CONFIRMED', 'IN_PROGRESS'].includes(a.status)).length} />
        <KpiCard icon={ListOrdered} label="Waiting in queue" value={loading ? '…' : k.waitingQueue ?? queue.filter((q) => q.status === 'WAITING').length} accent="yellow" />
        <KpiCard icon={AlertTriangle} label="High-risk referrals" value={loading ? '…' : k.highRiskReferrals ?? highRisk.length} accent="red" />
        <KpiCard icon={ClipboardCheck} label="Overdue follow-ups" value={loading ? '…' : k.overdueFollowUps ?? 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Today's appointments" actions={<Link to="today" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>Manage</Link>}>
          {today.length === 0 ? <EmptyState icon="🗓️" title="No appointments today" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {today.slice(0, 5).map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.patient?.user?.name || a.patient?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{a.patient?.user?.phone} · {formatDateTime(a.scheduledAt)}</div>
                  </div>
                  <StatusBadge value={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="High-risk referrals" actions={<Link to="referrals" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>View all</Link>}>
          {highRisk.length === 0 ? <EmptyState icon="🛡️" title="No high-risk referrals" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {highRisk.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.patient?.user?.name || r.patient?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.reason}</div>
                  </div>
                  <StatusBadge value={r.priority} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Today({ demo }) {
  const { toast } = useToast();
  const { data, loading, reload, isDemo } = useLoad(() => load('/appointments'), demoData.appointments, []);
  const list = data || [];
  const setStatus = async (id, status) => {
    try { await load(`/appointments/${id}/status`, 'PATCH', { status }); toast(`Marked ${status.toLowerCase()}`, 'success'); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <div>
      <PageHeader title="Today's Appointments" subtitle="Manage patient flow for the day." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="🗓️" title="No appointments" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Time</th><th>Patient</th><th>Phone</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.scheduledAt)}</td>
                  <td style={{ fontWeight: 600 }}>{a.patient?.user?.name || a.patient?.name}</td>
                  <td>{a.patient?.user?.phone}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{a.reason || '—'}</td>
                  <td><StatusBadge value={a.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {a.status === 'CONFIRMED' && <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => setStatus(a.id, 'IN_PROGRESS')}>Start</button>}
                      {a.status === 'IN_PROGRESS' && <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => setStatus(a.id, 'COMPLETED')}><CheckCircle2 size={14} /> Done</button>}
                      {['CONFIRMED', 'PENDING'].includes(a.status) && <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => setStatus(a.id, 'CANCELLED')}>Cancel</button>}
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

function DQueue({ demo }) {
  const { toast } = useToast();
  const { data, loading, reload, isDemo } = useLoad(() => load('/queue'), demoData.queue, []);
  const q = data || [];
  const call = async (id) => { await load(`/queue/${id}/call`, 'POST', {}); toast('Token called', 'success'); reload(); };
  const complete = async (id) => { await load(`/queue/${id}/complete`, 'POST', {}); toast('Consultation done', 'success'); reload(); };
  const skip = async (id) => { await load(`/queue/${id}/skip`, 'POST', {}); toast('Token skipped', 'info'); reload(); };
  return (
    <div>
      <PageHeader title="Patient Queue" subtitle="Consultation queue for the clinic." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : q.length === 0 ? <EmptyState icon="🎫" title="Queue is empty" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Token</th><th>Patient</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {q.map((t) => (
                <tr key={t.id} style={{ background: t.status === 'IN_PROGRESS' ? 'var(--color-info-light)' : undefined }}>
                  <td style={{ fontWeight: 700 }}>#{t.tokenNumber}</td>
                  <td>{t.patient?.user?.name || t.patient?.name}<div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{t.patient?.user?.phone}</div></td>
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

function Patients({ demo }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const { data, loading, isDemo } = useLoad(() => load(`/patients?${q ? new URLSearchParams({ search: q }) : ''}`), demoData.patients, [q]);
  const list = data || [];
  return (
    <div>
      <PageHeader title="Patients" subtitle="Search your panel and open a longitudinal record." actions={<DemoBadge show={demo || isDemo} />} />
      <div className="filter-bar">
        <div className="input-icon" style={{ width: 280 }}>
          <Search size={16} />
          <input className="form-input" placeholder="Search by name, phone, ABHA" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="👥" title="No patients" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>ABHA</th><th>Name</th><th>Phone</th><th>Village</th><th>Chronic</th><th></th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.abhaId || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{p.user?.name || p.name}</td>
                  <td>{p.user?.phone || p.phone}</td>
                  <td>{p.village || '—'}</td>
                  <td>{(p.chronicConditions || []).join(', ') || '—'}</td>
                  <td><button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => setSel(p)}>Open record</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && <PatientDetail patient={sel} id={sel.id} onClose={() => setSel(null)} />}
    </div>
  );
}

function PatientDetail({ patient, id, onClose }) {
  const { data } = useLoad(() => load(`/patients/${id}`), null, [id]);
  const p = data || patient || {};
  return (
    <Modal open title={`${p.user?.name || p.name} — Longitudinal Record`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Patient</div>
          <div style={{ fontWeight: 600 }}>{p.user?.name || p.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            {p.gender || 'Gender —'} · {p.abhaId || 'no ABHA'} · {p.village || '—'}, {p.district || '—'}
          </div>
          {p.chronicConditions?.length > 0 && (
            <div style={{ marginTop: '0.4rem' }}>{(p.chronicConditions || []).map((c) => <span key={c} className="badge badge-yellow" style={{ marginRight: '0.3rem' }}>{c}</span>)}</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Recent vitals</div>
          {(p.vitals || []).length === 0 ? <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>None recorded</span> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(p.vitals || []).slice(0, 3).map((v) => (
                <div key={v.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--color-bg)', borderRadius: 8 }}>
                  <span>BP {v.bpSystolic || '—'}/{v.bpDiastolic || '—'} · HR {v.heartRate || '—'} · O₂ {v.oxygenSaturation || '—'}%</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(v.recordedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Link to={`/app/doctor/consultation?patient=${id}`} className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>Start consultation</Link>
      </div>
    </Modal>
  );
}

function Consultation({ demo }) {
  const { toast } = useToast();
  const { data: patients } = useLoad(() => load('/patients'), demoData.patients, []);
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await load(`/patients/${patientId}/records`, 'POST', { type: 'OPD_CONSULTATION', title, notes });
      await load('/records', 'POST', { patientId, type: 'OPD_CONSULTATION', title, notes });
      toast('Consultation record saved', 'success');
      setTitle(''); setNotes('');
    } catch (err) {
      toast(err.message || 'Could not save record', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title="Document a Consultation" subtitle="Record the OPD consultation in the patient's longitudinal record." actions={<DemoBadge show={demo} />} />
      <Card>
        <form onSubmit={submit}>
          <label className="form-label">Patient</label>
          <select className="form-input" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
            <option value="">Select patient</option>
            {(patients || []).map((p) => <option key={p.id} value={p.id}>{p.user?.name || p.name} · {p.user?.phone}</option>)}
          </select>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Consultation title</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. BP review — 3rd visit" required />
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Notes (findings, advice, referral need)</label>
          <textarea className="form-input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Clinical notes..." />
          <button className="btn-primary" style={{ marginTop: '1rem' }} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <><Stethoscope size={16} /> Save consultation</>}
          </button>
        </form>
      </Card>

      <Card title="Quick actions for prescriptions, diagnostics & referrals" style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link to="diagnostics" className="btn-secondary"><FileBarChart size={15} /> Request diagnostics</Link>
          <Link to="referrals" className="btn-secondary"><GitPullRequest size={15} /> Create referral</Link>
          <Link to="followups" className="btn-secondary"><ClipboardCheck size={15} /> Schedule follow-up</Link>
        </div>
      </Card>
    </div>
  );
}

function DReferrals({ demo }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, loading, reload, isDemo } = useLoad(() => load('/referrals'), demoData.referrals, []);
  const { data: patients } = useLoad(() => load('/patients'), demoData.patients, []);
  const { data: facilities } = useLoad(() => load('/facilities'), demoData.facilities, []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: '', toFacilityId: '', reason: '', notes: '', priority: 'MODERATE' });
  const r = data || [];

  const create = async (e) => {
    e.preventDefault();
    const fromFacilityId = user?.profile?.facilityId;
    if (!fromFacilityId) { toast('No facility linked to your profile.', 'error'); return; }
    try {
      await load('/referrals', 'POST', { ...form, fromFacilityId });
      toast('Referral created', 'success'); setOpen(false); reload();
    } catch (err) { toast(err.message, 'error'); }
  };
  const setStatus = async (id, status) => { try { await load(`/referrals/${id}/status`, 'PATCH', { status }); toast('Updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };

  return (
    <div>
      <PageHeader title="Referrals" subtitle="Create and track referrals to higher facilities." actions={<><DemoBadge show={demo || isDemo} /><button className="btn-primary" onClick={() => setOpen(true)}><GitPullRequest size={16} /> New referral</button></>} />
      {loading ? <div className="spinner" /> : r.length === 0 ? <EmptyState icon="🛌" title="No referrals" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Created</th><th>Patient</th><th>Reason</th><th>To</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {r.map((rf) => (
                <tr key={rf.id}>
                  <td>{formatDate(rf.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{rf.patient?.user?.name || rf.patient?.name}</td>
                  <td>{rf.reason}</td>
                  <td>{rf.toFacility?.name || '—'}</td>
                  <td><StatusBadge value={rf.priority} /></td>
                  <td><StatusBadge value={rf.status} /></td>
                  <td>
                    {['CREATED'].includes(rf.status) && <button className="btn-danger" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => setStatus(rf.id, 'CANCELLED')}>Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="Create referral" onClose={() => setOpen(false)}>
        <form onSubmit={create}>
          <label className="form-label">Patient</label>
          <select className="form-input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
            <option value="">Select patient</option>
            {(patients || []).map((p) => <option key={p.id} value={p.id}>{p.user?.name || p.name}</option>)}
          </select>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Refer to facility</label>
          <select className="form-input" value={form.toFacilityId} onChange={(e) => setForm({ ...form, toFacilityId: e.target.value })} required>
            <option value="">Select receiving facility</option>
            {(facilities || []).map((f) => <option key={f.id} value={f.id}>{f.name} ({f.type})</option>)}
          </select>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Reason</label>
          <input className="form-input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required placeholder="e.g. Specialist opinion needed" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.8rem' }} className="form-row">
            <div>
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option><option value="MODERATE">Moderate</option><option value="HIGH">High</option><option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <div>
              <label className="form-label">Notes</label>
              <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create referral</button>
        </form>
      </Modal>
    </div>
  );
}

function DDiagnostics({ demo }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, loading, reload, isDemo } = useLoad(() => load('/diagnostics'), demoData.diagnostics, []);
  const { data: patients } = useLoad(() => load('/patients'), demoData.patients, []);
  const { data: services } = useLoad(() => load('/diagnostics/services'), [], []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: '', testType: '', labNotes: '' });
  const list = data || [];

  const create = async (e) => {
    e.preventDefault();
    const doctorId = user?.profile?.id;
    const facilityId = user?.profile?.facilityId;
    if (!doctorId || !facilityId) { toast('Facility not linked to your profile.', 'error'); return; }
    try {
      await load('/diagnostics', 'POST', { ...form, doctorId, facilityId });
      toast('Diagnostic requested', 'success'); setOpen(false); reload();
    } catch (err) { toast(err.message, 'error'); }
  };
  const setStatus = async (id, status) => { try { await load(`/diagnostics/${id}/status`, 'PATCH', { status }); toast('Updated', 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };

  return (
    <div>
      <PageHeader title="Diagnostics" subtitle="Request lab tests and track sample/report status." actions={<><DemoBadge show={demo || isDemo} /><button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Request test</button></>} />
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
                      {t.status === 'SCHEDULED' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(t.id, 'SAMPLE_COLLECTED')}>Sample taken</button>}
                      {t.status === 'SAMPLE_COLLECTED' && <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }} onClick={() => setStatus(t.id, 'REPORT_READY')}>Report ready</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="Request diagnostic test" onClose={() => setOpen(false)}>
        <form onSubmit={create}>
          <label className="form-label">Patient</label>
          <select className="form-input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
            <option value="">Select patient</option>
            {(patients || []).map((p) => <option key={p.id} value={p.id}>{p.user?.name || p.name}</option>)}
          </select>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Test type</label>
          <input className="form-input" list="test-types" value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })} required placeholder="e.g. HbA1c" />
          <datalist id="test-types">
            <option value="Complete Blood Count" /><option value="HbA1c" /><option value="Blood Sugar (Fasting)" /><option value="Chest X-Ray" /><option value="Lipid Profile" /><option value="Urine R/M" /><option value="ECG" /><option value="Thyroid Function" />
          </datalist>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Lab notes</label>
          <input className="form-input" value={form.labNotes} onChange={(e) => setForm({ ...form, labNotes: e.target.value })} />
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Request test</button>
        </form>
      </Modal>
    </div>
  );
}

function DTeleconsult() {
  const { user } = useAuth();
  const room = `nirovveda-dr-${(user?.name || 'doctor').toLowerCase().replace(/\s/g, '-')}-${Date.now().toString(36)}`;
  return (
    <div>
      <PageHeader title="Teleconsultation" subtitle="Conduct remote consultations with patients at PHCs/AB-HWCs." />
      <div style={{ maxWidth: 520 }}>
        <Card>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Teleconsultation uses the assisted model demonstrated by eSanjeevani — the doctor is online, a trained health worker supports the patient on-site.
          </p>
          <label className="form-label">Room ID (simulated)</label>
          <input className="form-input" value={room} readOnly />
          <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => window.open(`/teleconsultation/${room}`, '_blank')}>
            <Video size={16} /> Join room
          </button>
        </Card>
      </div>
    </div>
  );
}

function DFollowups({ demo }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data, loading, reload, isDemo } = useLoad(() => load('/follow-ups'), demoData.followUps, []);
  const { data: patients } = useLoad(() => load('/patients'), demoData.patients, []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: '', scheduledFor: '', reason: '' });
  const list = data || [];

  const create = async (e) => {
    e.preventDefault();
    const doctorId = user?.profile?.id;
    const facilityId = user?.profile?.facilityId;
    if (!doctorId || !facilityId) { toast('Facility not linked to your profile.', 'error'); return; }
    try {
      await load('/follow-ups', 'POST', { ...form, doctorId, facilityId });
      toast('Follow-up scheduled', 'success'); setOpen(false); reload();
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle="Schedule follow-up visits for continuity of care." actions={<><DemoBadge show={demo || isDemo} /><button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Schedule follow-up</button></>} />
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="📌" title="No follow-ups" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Scheduled</th><th>Patient</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((f) => (
                <tr key={f.id}>
                  <td>{formatDate(f.scheduledFor)}</td>
                  <td style={{ fontWeight: 600 }}>{f.patient?.user?.name || f.patient?.name}</td>
                  <td>{f.reason}</td>
                  <td><StatusBadge value={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title="Schedule follow-up" onClose={() => setOpen(false)}>
        <form onSubmit={create}>
          <label className="form-label">Patient</label>
          <select className="form-input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
            <option value="">Select patient</option>
            {(patients || []).map((p) => <option key={p.id} value={p.id}>{p.user?.name || p.name}</option>)}
          </select>
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Follow-up date</label>
          <input type="date" className="form-input" value={form.scheduledFor} onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })} required />
          <label className="form-label" style={{ marginTop: '0.8rem' }}>Reason</label>
          <input className="form-input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. BP monitor" required />
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Schedule</button>
        </form>
      </Modal>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="today" element={<Today />} />
      <Route path="queue" element={<DQueue />} />
      <Route path="patients" element={<Patients />} />
      <Route path="consultation" element={<Consultation />} />
      <Route path="referrals" element={<DReferrals />} />
      <Route path="diagnostics" element={<DDiagnostics />} />
      <Route path="teleconsult" element={<DTeleconsult />} />
      <Route path="followups" element={<DFollowups />} />
    </Routes>
  );
}