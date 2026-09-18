import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, AlertCircle, Loader2, User, Phone, Mail, Lock, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';

const roleHome = (role) => {
  switch (role) {
    case 'PATIENT': return '/app/patient';
    case 'HEALTH_WORKER': return '/app/worker';
    case 'DOCTOR': return '/app/doctor';
    default: return '/app/patient';
  }
};

export default function Register() {
  const { register, loading } = useAuth();
  const { toast } = useToast();
  const { t } = useLang();
  const navigate = useNavigate();
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'PATIENT',
    gender: '', dateOfBirth: '', village: '', district: '', state: 'Maharashtra',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const user = await register(form);
      toast(t('reg.accountCreated') + user.name + '!', 'success');
      navigate(roleHome(user.role));
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const roles = [
    { value: 'PATIENT', label: t('reg.rolePatient') },
    { value: 'HEALTH_WORKER', label: t('reg.roleWorker') },
  ];

  return (
    <div className="auth-shell">
      <div style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <LanguageSwitcher />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-text)' }}>
            <HeartPulse size={32} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>NIROVVEDA</span>
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0 0.25rem' }}>{t('reg.title')}</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{t('reg.subtitle')}</p>
        </div>

        <form onSubmit={submit} className="card" style={{ padding: '1.5rem' }}>
          {err && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={16} /> {err}
            </div>
          )}

          <label className="form-label" htmlFor="reg-role">{t('reg.iAm')}</label>
          <select id="reg-role" className="form-input" value={form.role} onChange={set('role')}>
            {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.9rem' }} className="form-row">
            <div>
              <label className="form-label" htmlFor="reg-name">{t('reg.fullName')}</label>
              <div className="input-icon">
                <User size={16} />
                <input id="reg-name" className="form-input" placeholder={t('reg.namePh')}
                  value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="reg-phone">{t('reg.phone')}</label>
              <div className="input-icon">
                <Phone size={16} />
                <input id="reg-phone" className="form-input" type="tel" pattern="[0-9]{10}" placeholder={t('reg.phonePh')}
                  value={form.phone} onChange={set('phone')} required />
              </div>
            </div>
          </div>

          <label className="form-label" htmlFor="reg-email" style={{ marginTop: '0.9rem' }}>{t('reg.email')}</label>
          <div className="input-icon">
            <Mail size={16} />
            <input id="reg-email" type="email" className="form-input" placeholder={t('reg.emailPh')}
              value={form.email} onChange={set('email')} required />
          </div>

          <label className="form-label" htmlFor="reg-pass" style={{ marginTop: '0.9rem' }}>{t('reg.password')}</label>
          <div className="input-icon">
            <Lock size={16} />
            <input id="reg-pass" type="password" className="form-input" placeholder={t('reg.min8')}
              value={form.password} onChange={set('password')} minLength={8} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.9rem' }} className="form-row">
            <div>
              <label className="form-label" htmlFor="reg-gender">{t('reg.gender')}</label>
              <select id="reg-gender" className="form-input" value={form.gender} onChange={set('gender')}>
                <option value="">{t('reg.select')}</option>
                <option value="Male">{t('reg.male')}</option>
                <option value="Female">{t('reg.female')}</option>
                <option value="Other">{t('reg.other')}</option>
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="reg-dob">{t('reg.dob')}</label>
              <input id="reg-dob" type="date" className="form-input" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            </div>
          </div>

          <label className="form-label" htmlFor="reg-village" style={{ marginTop: '0.9rem' }}>{t('reg.villageTown')}</label>
          <div className="input-icon">
            <MapPin size={16} />
            <input id="reg-village" className="form-input" placeholder={t('reg.villagePh')}
              value={form.village} onChange={set('village')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.9rem' }} className="form-row">
            <div>
              <label className="form-label" htmlFor="reg-district">{t('reg.district')}</label>
              <input id="reg-district" className="form-input" placeholder="Amravati" value={form.district} onChange={set('district')} />
            </div>
            <div>
              <label className="form-label" htmlFor="reg-state">{t('reg.state')}</label>
              <input id="reg-state" className="form-input" value={form.state} onChange={set('state')} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : t('reg.createBtn')}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
            {t('reg.haveAccount')}{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t('reg.logIn')}</Link>
          </p>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          {t('reg.note')}
        </p>
      </div>
    </div>
  );
}