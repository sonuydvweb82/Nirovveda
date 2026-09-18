import { Link } from 'react-router-dom';
import { TriangleAlert, Home, RotateCcw } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import ErrorLayout from './ErrorLayout';

// Generic fallback for in-app failures (e.g. failed data load) where the
// app shell stays mounted and a full page navigation is not wanted.
export default function ErrorPage({
  code = '—',
  title,
  description,
  hint,
  onRetry,
}) {
  const { t } = useLang();
  return (
    <ErrorLayout
      code={code}
      eyebrow={t('error.generic.eyebrow')}
      title={title || t('error.generic.title')}
      description={description || t('error.generic.desc')}
      icon={TriangleAlert}
      accent="yellow"
      hint={hint}
    >
      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={16} /> {t('error.retry')}
        </button>
      )}
      <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <Home size={16} /> {t('error.home')}
      </Link>
    </ErrorLayout>
  );
}
