import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  Users, UserPlus, HeartPulse, CalendarDays, ListOrdered, GitPullRequest,
  ClipboardCheck, Pill, MapPin, Loader2, Search, RefreshCw, Phone, User,
  AlertTriangle, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLoad, load } from '../../hooks/useLoad';
import { Card, KpiCard, PageHeader, EmptyState, StatusBadge, Modal } from '../../components/ui';
import { formatDate, formatDateTime } from '../../utils';
import demoData from '../../data/demo';
import HealthcareMap from '../HealthcareMap';

function DemoBadge({ show }) {
  if (!show) return null;
  return <span className="badge badge-yellow">Demo data</span>;
}

function Home({ demo }) {
  const { data, loading } = useLoad(() => load('/dashboard'), null, []);
  const k = data?.kpis || {};
  const referrals = data?.pendingReferrals || demoData.referrals;
  const queue = data?.queue || demoData.queue;
  const followUps = data?.followUps || demoData.followUps;

  return (
    <div>
      <PageHeader
        title="Frontline Worker Dashboard"
        subtitle="Every patient journey starts here — at the PHC / AB-HWC access point."
        actions={<DemoBadge show={demo} />}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icon={CalendarDays} label="Today's appointments" value={loading ? '…' : k.todayAppointments ?? 0} />
        <KpiCard icon={ListOrdered} label="Waiting in queue" value={loading ? '…' : k.waitingQueue ?? queue.filter((q) => q.status === 'WAITING').length} accent="yellow" />
        <KpiCard icon={GitPullRequest} label="Pending referrals" value={loading ? '…' : k.pendingReferrals ?? referrals.length} accent="red" />
        <KpiCard icon={ClipboardCheck} label="Follow-ups due" value={loading ? '…' : k.followUpsDue ?? followUps.filter((f) => f.status === 'DUE').length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Quick actions">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { to: 'register', icon: UserPlus, label: 'Register patient', c: 'primary' },
              { to: 'triage', icon: HeartPulse, label: 'Run AI triage', c: 'primary' },
              { to: 'queue', icon: ListOrdered, label: 'Manage queue', c: 'primary' },
              { to: 'referrals', icon: GitPullRequest, label: 'New referral', c: 'warning' },
              { to: 'appointments', icon: CalendarDays, label: 'Book appointment', c: 'primary' },
              { to: 'followups', icon: ClipboardCheck, label: 'Follow-ups', c: 'primary' },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="kpi-card" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', color: 'var(--color-text)', padding: '0.9rem' }}>
                <a.icon size={18} style={{ color: a.c === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)' }} />
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Queue today" actions={<Link to="queue" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>Manage</Link>}>
          {queue.length === 0 ? <EmptyState icon="🎫" title="No tokens yet today" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {queue.slice(0, 5).map((q) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{q.tokenNumber}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{q.patient?.user?.name || q.patient?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{q.patient?.user?.phone || q.patient?.phone}</div>
                  </div>
                  <StatusBadge value={q.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <Card title="Follow-ups needing attention">
          {followUps.filter((f) => f.status === 'DUE').length === 0 ? <EmptyState icon="✅" title="No follow-ups due" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {followUps.filter((f) => f.status === 'DUE').map((f) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                  <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.patient?.user?.name || f.patient?.name}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{f.reason}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>due {formatDate(f.scheduledFor)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Patients({ demo }) {
  const [q, setQ] = useState('');
  const { data, loading, isDemo } = useLoad(() => load(`/patients?${q ? new URLSearchParams({ search: q }) : ''}`), demoData.patients, [q]);
  const list = data || [];
  return (
    <div>
      <PageHeader title="Patients" subtitle="Registered patients in your served area." actions={<DemoBadge show={demo || isDemo} />} />
      <div className="filter-bar">
        <div className="input-icon" style={{ width: 280 }}>
          <Search size={16} />
          <input className="form-input" placeholder="Search name, phone or ABHA" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Link to="register" className="btn-primary"><UserPlus size={16} /> Register patient</Link>
      </div>
      {loading ? <div className="spinner" /> : list.length === 0 ? <EmptyState icon="👥" title="No patients found" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>ABHA</th><th>Name</th><th>Phone</th><th>Village</th><th>Chronic</th></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.abhaId || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{p.user?.name || p.name}</td>
                  <td>{p.user?.phone || p.phone}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{p.village || '—'}</td>
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

function RegisterPatient({ demo }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: '', dateOfBirth: '', village: '', district: '', bloodGroup: '', chronicConditions: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name, phone: form.phone, email: form.email || undefined,
        gender: form.gender, dateOfBirth: form.dateOfBirth || undefined,
        village: form.village, district: form.district, bloodGroup: form.bloodGroup,
        chronicConditions: form.chronicConditions ? form.chronicConditions.split(',').map((s) => s.trim()) : [],
      };
      await load('/patients', 'POST', body);
      toast('Patient registered successfully', 'success');
      setForm({ name: '', phone: '', email: '', gender: '', dateOfBirth: '', village: '', district: '', bloodGroup: '', chronicConditions: '' });
    } catch (err) {
      toast(err.message || 'Registration failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeader title="Register Patient" subtitle="Works offline — data syncs to the network when back online." actions={<DemoBadge show={demo} />} />
      <Card>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }} className="form-row">
            <div>
              <label className="form-label">Full name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="form-label">Phone *</label>
              <input className="form-input" type="tel" pattern="[0-9]{10}" value={form.phone} onChange={set('phone')} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginTop: '0.9rem' }} className="form-row">
            <div>
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={set('gender')}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date of birth</label>
              <input className="form-input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginTop: '0.9rem' }} className="form-row">
            <div>
              <label className="form-label">Village / town</label>
              <input className="form-input" value={form.village} onChange={set('village')} />
            </div>
            <div>
              <label className="form-label">District</label>
              <input className="form-input" value={form.district} onChange={set('district')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginTop: '0.9rem' }} className="form-row">
            <div>
              <label className="form-label">Blood group</label>
              <select className="form-input" value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">—</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Chronic conditions (comma-separated)</label>
              <input className="form-input" placeholder="e.g. Hypertension, Diabetes" value={form.chronicConditions} onChange={set('chronicConditions')} />
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: '1.25rem' }} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <><UserPlus size={16} /> Register</>}
          </button>
        </form>
      </Card>
    </div>
  );
}

function Triage({ demo }) {
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState(35);
  const [vitals, setVitals] = useState({ temperature: '', heartRate: '', bpSystolic: '', bpDiastolic: '', oxygenSaturation: '' });
  const [chronic, setChronic] = useState('');
  const [result, setResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    try {
      const num = (v) => (v === '' || v == null ? null : Number(v));
      const res = await load('/ai/triage', 'POST', {
        age: Number(age), gender: 'Not specified', symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
        vitals: {
          temperature: num(vitals.temperature), heartRate: num(vitals.heartRate),
          bpSystolic: num(vitals.bpSystolic), bpDiastolic: num(vitals.bpDiastolic),
          oxygenSaturation: num(vitals.oxygenSaturation),
        },
        chronicConditions: chronic ? chronic.split(',').map((s) => s.trim()) : [],
      });
      setResult(res.data);
    } catch (err) {
      toast('AI service unreachable — using local rule-based assessment', 'warning');
      const local = localTriage({ age, vitals, symptoms });
      setResult({ ...local, provider: 'rule-based-fallback' });
    } finally {
      setLoadingAI(false);
    }
  };

  const levelColor = (l) => l === 'EMERGENCY' ? 'var(--color-danger)' : l === 'HIGH' ? '#ea580c' : l === 'MODERATE' ? 'var(--color-warning)' : 'var(--color-success)';

  return (
    <div>
      <PageHeader title="AI-Assisted Triage" subtitle="Preliminary risk assessment — advisory only, always reviewed by a professional." actions={<DemoBadge show={demo} />} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="insights-grid">
        <Card title="Symptoms & vitals">
          <form onSubmit={submit}>
            <label className="form-label">Symptoms (comma-separated)</label>
            <input className="form-input" placeholder="e.g. fever, severe breathlessness, chest pain" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.8rem' }} className="form-row">
              <div>
                <label className="form-label">Age</label>
                <input type="number" className="form-input" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Temp (°C)</label>
                <input type="number" step="0.1" className="form-input" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.8rem' }} className="form-row">
              <div>
                <label className="form-label">Heart rate (bpm)</label>
                <input type="number" className="form-input" value={vitals.heartRate} onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })} />
              </div>
              <div>
                <label className="form-label">SpO₂ (%)</label>
                <input type="number" className="form-input" value={vitals.oxygenSaturation} onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.8rem' }} className="form-row">
              <div>
                <label className="form-label">BP systolic</label>
                <input type="number" className="form-input" value={vitals.bpSystolic} onChange={(e) => setVitals({ ...vitals, bpSystolic: e.target.value })} />
              </div>
              <div>
                <label className="form-label">BP diastolic</label>
                <input type="number" className="form-input" value={vitals.bpDiastolic} onChange={(e) => setVitals({ ...vitals, bpDiastolic: e.target.value })} />
              </div>
            </div>
            <label className="form-label" style={{ marginTop: '0.8rem' }}>Chronic conditions</label>
            <input className="form-input" placeholder="e.g. Hypertension" value={chronic} onChange={(e) => setChronic(e.target.value)} />
            <button className="btn-primary" style={{ marginTop: '1rem' }} disabled={loadingAI}>
              {loadingAI ? <Loader2 size={16} className="spin" /> : <><HeartPulse size={16} /> Run triage</>}
            </button>
          </form>
        </Card>

        <div>
          {!result ? (
            <Card title="Assessment panel">
              <EmptyState icon="🤖" title="Run triage to see the assessment" subtitle="Risk level, reasons, flags and recommended next steps." />
              <div className="alert" style={{ background: 'var(--color-info-light)', border: '1px solid #bfdbfe', color: 'var(--color-info)' }}>
                <AlertTriangle size={15} /> AI output is advisory and does not replace professional medical diagnosis.
              </div>
            </Card>
          ) : (
            <Card title="Triage result">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: levelColor(result.risk_level), flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Score {result.score} · Confidence {(result.confidence * 100).toFixed(0)}% · {result.provider}
                  </div>
                </div>
              </div>
              {(result.reasons || []).length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>REASONS</div>
                  {result.reasons.map((r, i) => <div key={i} style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>• {r}</div>)}
                </div>
              )}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>RECOMMENDED NEXT STEPS</div>
                {(result.recommendations || []).map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.25rem' }}><CheckCircle2 size={15} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {r}</div>
                ))}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{result.disclaimer}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function localTriage({ age, vitals, symptoms }) {
  let score = 0;
  const reasons = [];
  const flags = [];
  const sym = (symptoms || '').toLowerCase();
  if (['chest pain', 'severe breathlessness', 'unconscious', 'stroke', 'heavy bleeding'].some((f) => sym.includes(f))) { score += 10; flags.push({ code: 'RED_FLAG', message: 'Red-flag symptom present.' }); }
  if (['shortness of breath', 'high fever', 'vomiting', 'dizziness'].some((f) => sym.includes(f))) score += 5;
  if (['cough', 'fever', 'headache', 'fatigue'].some((f) => sym.includes(f))) score += 1;
  if (vitals.temperature > 39.5) { score += 6; reasons.push('Very high fever (>39.5°C).'); }
  if (vitals.heartRate > 120) { score += 5; reasons.push('Abnormal heart rate.'); }
  if (vitals.bpSystolic >= 180) { score += 8; reasons.push('Very high blood pressure.'); }
  if (vitals.oxygenSaturation < 90) { score += 10; reasons.push('Dangerously low oxygen saturation.'); }
  if (age < 2 || age >= 75) score += 3;
  const level = score >= 12 ? 'EMERGENCY' : score >= 8 ? 'HIGH' : score >= 4 ? 'MODERATE' : 'LOW';
  const titles = {
    EMERGENCY: 'Emergency — immediate medical attention advised',
    HIGH: 'High risk — needs prompt professional review',
    MODERATE: 'Moderate risk — schedule a consultation',
    LOW: 'Low risk — routine care',
  };
  const recs = {
    EMERGENCY: ['Escalate immediately to the nearest emergency-capable facility', 'Follow facility emergency protocol'],
    HIGH: ['Priority appointment or immediate doctor review recommended', 'Consider referral if specialist care is needed'],
    MODERATE: ['Book an appointment within 24–48 hours', 'Return to the facility if symptoms worsen'],
    LOW: ['Routine consultation can be scheduled', 'Re-evaluate if symptoms persist'],
  };
  return { risk_level: level, title: titles[level], score, reasons, flags, recommendations: recs[level], confidence: 0.8 };
}

function WAppointments({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/appointments'), demoData.appointments, []);
  return (
    <div>
      <PageHeader title="Appointments" subtitle="Appointments for your facility." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : (data || []).length === 0 ? <EmptyState icon="🗓️" title="No appointments" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.scheduledAt)}</td>
                  <td style={{ fontWeight: 600 }}>{a.patient?.user?.name || a.patient?.name}</td>
                  <td>{a.doctor?.user?.name || a.doctor?.name || '—'}</td>
                  <td>{a.consultationType === 'TELEMEDICINE' ? 'Tele' : 'In-person'}</td>
                  <td><StatusBadge value={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Queue({ demo }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');
  const { data, loading, reload, isDemo } = useLoad(() => load('/queue'), demoData.queue, []);
  const q = data || [];

  const call = async (id) => { await load(`/queue/${id}/call`, 'POST', {}); toast('Token called', 'success'); reload(); };
  const complete = async (id) => { await load(`/queue/${id}/complete`, 'POST', {}); toast('Consultation done', 'success'); reload(); };
  const skip = async (id) => { await load(`/queue/${id}/skip`, 'POST', {}); toast('Token skipped', 'info'); reload(); };

  const issue = async () => {
    try {
      if (!patientId) throw new Error('Enter a patient ID');
      const facilityId = user?.profile?.facilityId;
      if (!facilityId) throw new Error('No facility linked to your profile.');
      await load('/queue', 'POST', { patientId, facilityId });
      toast('Token issued', 'success');
      setPatientId(''); reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div>
      <PageHeader title="Queue Management" subtitle="Issue tokens and manage the consultation queue." actions={<DemoBadge show={demo || isDemo} />} />
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input className="input" placeholder="Patient ID" style={{ width: 220 }} value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        <button className="btn-primary" onClick={issue}>Issue token</button>
      </div>
      {loading ? <div className="spinner" /> : q.length === 0 ? <EmptyState icon="🎫" title="Queue is empty" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Token</th><th>Patient</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {q.map((t) => (
                <tr key={t.id} style={{ background: t.status === 'IN_PROGRESS' ? 'var(--color-info-light)' : undefined }}>
                  <td style={{ fontWeight: 700 }}>#{t.tokenNumber}</td>
                  <td>{t.patient?.user?.name || t.patient?.name}<div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{t.patient?.user?.phone || t.patient?.phone}</div></td>
                  <td><StatusBadge value={t.priority} /></td>
                  <td><StatusBadge value={t.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
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

function WReferrals({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/referrals'), demoData.referrals, []);
  const r = data || [];
  return (
    <div>
      <PageHeader title="Referrals" subtitle="Referrals created at your facility." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : r.length === 0 ? <EmptyState icon="🛌" title="No referrals" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Created</th><th>Patient</th><th>Reason</th><th>To</th><th>Priority</th><th>Status</th></tr></thead>
            <tbody>
              {r.map((rf) => (
                <tr key={rf.id}>
                  <td>{formatDate(rf.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{rf.patient?.user?.name || rf.patient?.name}</td>
                  <td>{rf.reason}</td>
                  <td>{rf.toFacility?.name || '—'}</td>
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

function WFollowups({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/follow-ups/overdue'), demoData.followUps, []);
  const { toast } = useToast();
  const r = data || [];
  const markDone = async (id) => {
    try { await load(`/follow-ups/${id}/status`, 'PATCH', { status: 'COMPLETED' }); toast('Follow-up completed', 'success'); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <div>
      <PageHeader title="Follow-ups" subtitle="Scheduled and overdue follow-up visits." actions={<DemoBadge show={demo || isDemo} />} />
      {loading ? <div className="spinner" /> : r.length === 0 ? <EmptyState icon="✅" title="No follow-ups" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Scheduled</th><th>Patient</th><th>Reason</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {r.map((f) => (
                <tr key={f.id}>
                  <td>{formatDate(f.scheduledFor)}</td>
                  <td style={{ fontWeight: 600 }}>{f.patient?.user?.name || f.patient?.name} <span style={{ color: 'var(--color-text-muted)' }}>{f.patient?.user?.phone}</span></td>
                  <td>{f.reason}</td>
                  <td><StatusBadge value={f.status} /></td>
                  <td>{['SCHEDULED', 'DUE'].includes(f.status) && <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => markDone(f.id)}>Mark done</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WMedicine({ demo }) {
  const { data, loading, isDemo } = useLoad(() => load('/medicines/inventory'), demoData.inventory, []);
  const inv = data || [];
  const low = inv.filter((i) => i.quantity <= i.lowStockThreshold);
  return (
    <div>
      <PageHeader title="Medicine Inventory" subtitle="Stock levels and low-stock items." actions={<DemoBadge show={demo || isDemo} />} />
      {low.length > 0 && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={16} /> {low.length} medicine(s) below reorder threshold — alert facility admin.
        </div>
      )}
      {loading ? <div className="spinner" /> : inv.length === 0 ? <EmptyState icon="💊" title="No inventory loaded" /> : (
        <div className="table-container">
          <table>
            <thead><tr><th>Medicine</th><th>Facility</th><th>Qty</th><th>Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {inv.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.medicine?.name}</td>
                  <td>{i.facility?.name}</td>
                  <td>{i.quantity}</td>
                  <td>{i.lowStockThreshold}</td>
                  <td>{i.quantity === 0 ? <StatusBadge value="OUT_OF_STOCK" /> : i.quantity <= i.lowStockThreshold ? <StatusBadge value="LOW" /> : <StatusBadge value="AVAILABLE" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WMap() {
  const { data, loading } = useLoad(() => load('/facilities'), demoData.facilities, []);
  return (
    <div>
      <PageHeader title="Facility Map" subtitle="PHCs, CHCs and hospitals in the demo network." />
      {loading ? <div className="spinner" /> : <HealthcareMap facilities={data || []} />}
    </div>
  );
}

export default function HealthWorkerDashboard() {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="patients" element={<Patients />} />
      <Route path="register" element={<RegisterPatient />} />
      <Route path="triage" element={<Triage />} />
      <Route path="appointments" element={<WAppointments />} />
      <Route path="queue" element={<Queue />} />
      <Route path="referrals" element={<WReferrals />} />
      <Route path="followups" element={<WFollowups />} />
      <Route path="medicine" element={<WMedicine />} />
      <Route path="map" element={<WMap />} />
    </Routes>
  );
}