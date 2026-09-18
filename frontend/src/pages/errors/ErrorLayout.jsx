import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const ACCENTS = {
  blue: { soft: 'var(--color-info-light)', solid: 'var(--color-info)' },
  red: { soft: 'var(--color-danger-light)', solid: 'var(--color-danger)' },
  yellow: { soft: 'var(--color-warning-light)', solid: '#92400e' },
  teal: { soft: '#ecfeff', solid: 'var(--color-primary)' },
};

export default function ErrorLayout({
  code,
  eyebrow,
  title,
  description,
  icon: Icon,
  accent = 'teal',
  hint,
  children,
}) {
  const colors = ACCENTS[accent] || ACCENTS.teal;
  return (
    <div className="auth-shell">
      <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              textDecoration: 'none', color: 'var(--color-text)',
            }}
          >
            <HeartPulse size={30} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
              NIROVVEDA
            </span>
          </Link>
        </div>

        <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          {Icon && (
            <div
              style={{
                width: 64, height: 64, borderRadius: 16, margin: '0 auto 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: colors.soft, color: colors.solid,
              }}
            >
              <Icon size={30} />
            </div>
          )}
          <div
            style={{
              fontSize: '3.5rem', fontWeight: 800, lineHeight: 1,
              letterSpacing: '-0.04em', color: 'var(--color-text)',
            }}
          >
            {code}
          </div>
          {eyebrow && (
            <div
              style={{
                marginTop: '0.5rem', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.75rem 0 0' }}>
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: '0.9rem', color: 'var(--color-text-secondary)',
                lineHeight: 1.6, margin: '0.5rem 0 0',
              }}
            >
              {description}
            </p>
          )}
          <div
            style={{
              display: 'flex', gap: '0.75rem', justifyContent: 'center',
              flexWrap: 'wrap', marginTop: '1.5rem',
            }}
          >
            {children}
          </div>
          {hint && (
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '1.25rem 0 0' }}>
              {hint}
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1.25rem' }}>
          © 2026 Nirovveda · Team Vengeance
        </p>
      </div>
    </div>
  );
}
