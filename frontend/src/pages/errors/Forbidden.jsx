import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import ErrorLayout from './ErrorLayout';

export default function Forbidden() {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <ErrorLayout
      code="403"
      eyebrow={t('error.forbidden.eyebrow')}
      title={t('error.forbidden.title')}
      description={t('error.forbidden.desc')}
      icon={ShieldAlert}
      accent="yellow"
      hint={t('error.forbidden.hint')}
    >
      <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <Home size={16} /> {t('error.home')}
      </Link>
      <button type="button" className="btn-secondary" onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> {t('error.back')}
      </button>
    </ErrorLayout>
  );
}
