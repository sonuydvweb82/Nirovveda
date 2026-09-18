import { useParams, useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, AlertTriangle, Info, HeartPulse } from 'lucide-react';
import { useLang } from '../context/LangContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export default function Teleconsultation() {
  const { room } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const roomName = (room || 'nirovveda-demo').replace(/[^a-z0-9-_]/gi, '-');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> {t('tc.back')}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HeartPulse size={22} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('tc.brand')}</span>
        </div>
        <div style={{ flex: 1 }} />
        <LanguageSwitcher />
        <span className="badge badge-green">{t('tc.roomActive')}</span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, minHeight: 0 }} className="consult-grid">
        <div style={{ background: '#111827', position: 'relative' }}>
          <iframe
            src={`https://meet.jit.si/${roomName}`}
            title="Teleconsultation — Jitsi Meet"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 60px)', border: 'none' }}
          />
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.65)', color: 'white', padding: '0.5rem 0.85rem', borderRadius: 10, fontSize: '0.78rem' }}>
            {t('tc.roomLabel')} <span style={{ fontFamily: 'monospace' }}>{roomName}</span>
          </div>
        </div>

        <aside style={{ padding: '1.25rem', background: 'var(--color-bg)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.9rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('tc.instructions')}</div>
            <ul style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0, paddingLeft: '1.2rem' }}>
              <li>{t('tc.li1')}</li>
              <li>{t('tc.li2')}</li>
              <li>{t('tc.li3')}</li>
              <li>{t('tc.li4')}</li>
              <li>{t('tc.li5')}</li>
            </ul>
          </div>

          <div style={{ padding: '0.9rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('tc.inSession')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              <div><Video size={15} style={{ color: 'var(--color-primary)', verticalAlign: 'middle', marginRight: 4 }} /> {t('tc.mute')}</div>
              <div><Info size={15} style={{ color: 'var(--color-info)', verticalAlign: 'middle', marginRight: 4 }} /> {t('tc.chat')}</div>
              <div><AlertTriangle size={15} style={{ color: 'var(--color-warning)', verticalAlign: 'middle', marginRight: 4 }} /> {t('tc.connection')}</div>
            </div>
          </div>

          <div style={{ padding: '0.9rem', background: 'linear-gradient(135deg,#0f766e,#0891b2)', color: 'white', borderRadius: 10, fontSize: '0.82rem' }}>
            {t('tc.context')}
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            {t('tc.footerNote')}
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .consult-grid { grid-template-columns: 1fr !important; }
          .consult-grid iframe { min-height: 360px !important; }
        }
      `}</style>
    </div>
  );
}