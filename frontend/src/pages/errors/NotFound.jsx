import { Link, useNavigate } from 'react-router-dom';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import ErrorLayout from './ErrorLayout';

export default function NotFound() {
  const { t } = useLang();
  const navigate = useNavigate();
  return (
    <ErrorLayout
      code="404"
      eyebrow={t('error.notFound.eyebrow')}
      title={t('error.notFound.title')}
      description={t('error.notFound.desc')}
      icon={MapPinOff}
      accent="blue"
      hint={t('error.notFound.hint')}
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
