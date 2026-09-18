import { useState } from 'react';
import { ExternalLink, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import researchData from '../data/research';
import sourceList from '../data/sources';
import { Card, PageHeader } from '../components/ui';
import { useLang } from '../context/LangContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const levelColor = { red: '#dc2626', yellow: '#f59e0b', green: '#16a34a', blue: '#2563eb' };

function BarChart({ data, maxValue, unit, valLabel }) {
  const max = maxValue || Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>{valLabel ? valLabel(d.label) : d.label}</span>
            <span style={{ fontWeight: 700 }}>{d.value}{unit}</span>
          </div>
          <div style={{ height: 20, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, background: 'linear-gradient(90deg,#0f766e,#14b8a6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: d.value / max > 0.25 ? '0.5rem' : 0 }}>
              {d.value / max > 0.25 && <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>{d.value}{unit}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, valLabel }) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const W = 620, H = 240, PAD = 36;
  const stepX = (W - PAD * 2) / (data.length - 1);
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2);
  const pts = data.map((d, i) => [PAD + i * stepX, y(d.value), d]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} y1={y(max * f) === 0 ? H - PAD : y(max * f)} x2={W - PAD} y2={y(max * f) === 0 ? H - PAD : y(max * f)} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      <polyline
        points={pts.map((p) => `${p[0]},${p[1]}`).join(' ')}
        fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
      {pts.map(([x, yy, d], i) => (
        <g key={i}>
          <circle cx={x} cy={yy} r="4.5" fill="#fff" stroke="#0f766e" strokeWidth="2.5" />
          <text x={x} y={H - 8} fontSize="11" fill="#64748b" textAnchor="middle">{valLabel ? valLabel(d.label) : d.label}</text>
          <text x={x} y={yy - 9} fontSize="11" fill="#0f172a" fontWeight="700" textAnchor="middle">{d.value} Cr</text>
        </g>
      ))}
    </svg>
  );
}

export default function ResearchPage({ embedded = false }) {
  const [active, setActive] = useState('esanjeevani');
  const { t, tr } = useLang();
  const data = researchData[active] || researchData.esanjeevani;

  const rl = (field) => tr(`research.${active}.${field}`) ?? data[field];
  const valLabel = (label) => tr(`research.${active}.values.${label}`) ?? label;

  return (
    <div>
      <PageHeader
        title={t('researchPage.title')}
        subtitle={t('researchPage.subtitle')}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <LanguageSwitcher />
            {!embedded && (
              <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
                {t('researchPage.backHome')}
              </Link>
            )}
          </div>
        }
      />

      <div style={{ marginBottom: '1.5rem', padding: '0.9rem 1rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          <span>{t('researchPage.verified')}</span>
        </div>
      </div>

      <div className="filter-bar">
        {Object.entries(researchData).map(([key, d]) => (
          <button key={key} className={`filter-chip ${active === key ? 'active' : ''}`} onClick={() => setActive(key)}>
            {tr(`research.${key}.chip`) ?? d.chip}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }} className="insights-grid">
        <Card title={rl('title')} subtitle={rl('desc')}>
          {data.chartType === 'line' ? (
            <LineChart data={data.values} valLabel={valLabel} />
          ) : (
            <BarChart data={data.values} unit={data.unitLabel} valLabel={valLabel} />
          )}
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{rl('note')}</div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card title={t('researchPage.whyMatters')}>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>{rl('summary')}</p>
          </Card>

          <Card title={t('researchPage.respond')}>
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.9rem', borderRadius: 10, background: 'linear-gradient(135deg,#0f766e,#0891b2)', color: 'white' }}>
              <Info size={18} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{rl('solutionLink')}</p>
            </div>
          </Card>

          <Card title={t('researchPage.source')}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{data.sourceOrg}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{rl('sourceTitle')} · {data.year}</div>
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', marginTop: '0.6rem' }}>
              {t('researchPage.viewSource')} <ExternalLink size={14} />
            </a>
          </Card>
        </div>
      </div>

      <div id="sources" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{t('researchPage.fullSourceList')}</h2>
          <span className="badge badge-gray">
            {(t('researchPage.verifiedRefs') || '{n} verified references').replace('{n}', sourceList.length)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {sourceList.map((s) => (
            <div key={s.id} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.orgShort} · {s.year}</div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 600, margin: '0.35rem 0 0.3rem' }}>{tr(`sources.${s.id}.title`) ?? s.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 0.6rem' }}>{tr(`sources.${s.id}.usedFor`) ?? s.usedFor}</p>
              <a href={s.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                {t('researchPage.viewSource')} <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            {t('researchPage.backHomeBtn') || t('researchPage.backHome')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}