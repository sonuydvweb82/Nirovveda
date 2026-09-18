import { Link } from 'react-router-dom';
import { ServerCrash, Home, RotateCcw } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import ErrorLayout from './ErrorLayout';

export default function ServerError({ onRetry }) {
  const { t } = useLang();
  const retry = onRetry || (() => window.location.reload());
  return (
    <ErrorLayout
      code="500"
      eyebrow={t('error.server.eyebrow')}
      title={t('error.server.title')}
      description={t('error.server.desc')}
      icon={ServerCrash}
      accent="red"
      hint={t('error.server.hint')}
    >
      <button type="button" className="btn-primary" onClick={retry} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <RotateCcw size={16} /> {t('error.retry')}
      </button>
      <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <Home size={16} /> {t('error.home')}
      </Link>
    </ErrorLayout>
  );
}
