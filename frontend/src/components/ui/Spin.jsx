export function Spin({ size = 'md', label }) {
  const px = size === 'lg' ? 2.5 : size === 'sm' ? 1 : 1.75;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem 0', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: `${px}rem`, height: `${px}rem` }} />
      {label && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{label}</span>}
    </div>
  );
}