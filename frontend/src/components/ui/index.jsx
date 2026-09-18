import { clsx } from '../../utils';

export function Badge({ status, children }) {
  const map = {
    green: 'badge-green',
    red: 'badge-red',
    yellow: 'badge-yellow',
    blue: 'badge-blue',
    gray: 'badge-gray',
  };
  const color = map[status] || map.gray;
  return <span className={clsx('badge', color)}>{children}</span>;
}

export function StatusBadge({ value }) {
  const v = (value || '').toUpperCase();
  let color = 'gray';
  if (['CONFIRMED', 'ACCEPTED', 'COMPLETED', 'AVAILABLE', 'SCHEDULED', 'IN_PROGRESS', 'ATTENDED', 'RESOLVED'].includes(v)) color = v === 'COMPLETED' ? 'green' : 'blue';
  if (['PENDING', 'WAITING', 'REQUESTED', 'DUE', 'LOW'].includes(v)) color = 'yellow';
  if (['CANCELLED', 'MISSED', 'REJECTED', 'SKIPPED', 'OUT_OF_STOCK', 'EMERGENCY'].includes(v)) color = 'red';
  if (v === 'HIGH' || v === 'ACTIVE') color = 'red';
  if (v === 'MODERATE') color = 'yellow';
  if (v === 'LOW') color = 'green';
  if (v === 'CREATED') color = 'yellow';
  if (['SAMPLE_COLLECTED', 'REPORT_READY'].includes(v)) color = 'blue';
  return <Badge status={color}>{value || '—'}</Badge>;
}

export function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', lineHeight: 1.1 }}>{value}</div>
          {sub && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: accent === 'red' ? 'var(--color-danger-light)' : accent === 'yellow' ? 'var(--color-warning-light)' : 'var(--color-info-light)',
            color: accent === 'red' ? 'var(--color-danger)' : accent === 'yellow' ? '#92400e' : 'var(--color-info)',
          }}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', lineHeight: 1, cursor: 'pointer', color: 'var(--color-text-muted)' }} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, subtitle, icon }) {
  return (
    <div className="empty-state">
      {icon && <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.6 }}>{icon}</div>}
      <h3>{title}</h3>
      {subtitle && <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{subtitle}</p>}
    </div>
  );
}

export function Card({ title, subtitle, children, actions }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.125rem 0 0' }}>{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  );
}

export { default as LanguageSwitcher } from './LanguageSwitcher';