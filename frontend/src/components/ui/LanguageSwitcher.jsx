import { Languages } from 'lucide-react';
import { useLang, LANGS } from '../../context/LangContext';

export default function LanguageSwitcher({ className = '', style = {}, variant = 'select' }) {
  const { lang, setLang, t } = useLang();

  if (variant === 'buttons') {
    return (
      <div
        className={`lang-switcher-buttons ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(0,0,0,0.04)',
          padding: '0.2rem',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          ...style,
        }}
        role="group"
        aria-label={t('nav.langAria')}
      >
        <Languages size={14} style={{ marginLeft: 4, marginRight: 2, color: 'var(--color-text-muted)' }} />
        {LANGS.map((l) => {
          const isActive = lang === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              style={{
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-text-secondary)',
                border: 'none',
                borderRadius: 6,
                padding: '0.25rem 0.55rem',
                fontSize: '0.78rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`lang-switcher-select-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        position: 'relative',
        ...style,
      }}
    >
      <Languages size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label={t('nav.langAria')}
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '0.35rem 0.55rem',
          fontSize: '0.8rem',
          background: 'white',
          color: 'var(--color-text)',
          cursor: 'pointer',
          fontWeight: 500,
          outline: 'none',
        }}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
