import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LangContext';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';

const DEMO_ACCOUNTS = [
  { key: 'admin', email: 'admin@nirovveda.in' },
  { key: 'facility', email: 'facility@nirovveda.in' },
  { key: 'doctor', email: 'doctor@nirovveda.in' },
  { key: 'worker', email: 'worker@nirovveda.in' },
  { key: 'patient', email: 'patient@nirovveda.in' },
];

export default function Login() {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);

  const roleHome = (role) => {
    switch (role) {
      case 'PATIENT': return '/app/patient';
      case 'HEALTH_WORKER': return '/app/worker';
      case 'DOCTOR': return '/app/doctor';
      case 'FACILITY_ADMIN': return '/app/facility';
      case 'SUPER_ADMIN': return '/app/admin';
      default: return '/app/patient';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const user = await login(email.trim(), password);
      toast(t('login.welcomeBack') + user.name, 'success');
      navigate(roleHome(user.role));
    } catch (err) {
      setErr(err.message);
    }
  };

  return (
    <div className="auth-shell">
      <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <LanguageSwitcher />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-text)' }}>
            <HeartPulse size={32} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>NIROVVEDA</span>
          </Link>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0 0.25rem' }}>{t('login.title')}</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{t('login.subtitle')}</p>
        </div>

        <form onSubmit={submit} className="card" style={{ padding: '1.5rem' }}>
          {err && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={16} /> {err}
            </div>
          )}

          <label className="form-label" htmlFor="email">{t('login.email')}</label>
          <div className="input-icon">
            <Mail size={16} />
            <input id="email" type="email" className="form-input" placeholder={t('login.emailPh')}
              value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <label className="form-label" htmlFor="password" style={{ marginTop: '0.9rem' }}>{t('login.password')}</label>
          <div className="input-icon">
            <Lock size={16} />
            <input id="password" type="password" className="form-input" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : t('login.submit')}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
            {t('login.newHere')}{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t('login.createAccount')}</Link>
          </p>
        </form>

        <div style={{ marginTop: '1.25rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1rem', background: 'var(--color-bg)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>{t('login.demoAccounts')}</div>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => { setEmail(a.email); setPassword('Nirovveda@123'); setErr(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'none', border: 'none', padding: '0.4rem 0.25rem', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text)' }}
            >
              <span className="badge badge-primary">{t(`login.roles.${a.key}.label`)}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{a.email}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{t(`login.roles.${a.key}.desc`)}</span>
            </button>
          ))}
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.6rem' }}>
            {t('login.passwordForAll')} <span style={{ fontFamily: 'monospace' }}>Nirovveda@123</span>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
          {t('login.prototypeNote')}
        </p>
      </div>
    </div>
  );
}