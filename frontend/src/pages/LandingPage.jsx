import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, Menu, X, Stethoscope, Users, Building2, MapPin, Video,
  FileBarChart, Pill, ClipboardCheck, AlertTriangle, GitPullRequest, BellRing,
  ArrowRight, CheckCircle2, Languages, WifiOff, Activity, Brain, ExternalLink,
} from 'lucide-react';
import researchData from '../data/research';
import sourceList from '../data/sources';
import { useLang } from '../context/LangContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const services = [
  { icon: Video, k: 's1' },
  { icon: Brain, k: 's2' },
  { icon: FileBarChart, k: 's3' },
  { icon: GitPullRequest, k: 's4' },
  { icon: Pill, k: 's5' },
  { icon: Activity, k: 's6' },
  { icon: AlertTriangle, k: 's7' },
  { icon: MapPin, k: 's8' },
  { icon: BellRing, k: 's9' },
];

const steps = [
  { n: '1', k: 's1' },
  { n: '2', k: 's2' },
  { n: '3', k: 's3' },
  { n: '4', k: 's4' },
  { n: '5', k: 's5' },
  { n: '6', k: 's6' },
  { n: '7', k: 's7' },
];

const problems = [
  { icon: MapPin, k: 'c1' },
  { icon: Stethoscope, k: 'c2' },
  { icon: FileBarChart, k: 'c3' },
  { icon: GitPullRequest, k: 'c4' },
  { icon: Activity, k: 'c5' },
  { icon: Pill, k: 'c6' },
  { icon: ClipboardCheck, k: 'c7' },
  { icon: WifiOff, k: 'c8' },
];

const impact = [
  { k: 'c1' },
  { k: 'c2' },
  { k: 'c3' },
  { k: 'c4' },
];

function NavBar() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const links = [
    { to: '#problem', label: t('nav.problem') },
    { to: '#how', label: t('nav.howWorks') },
    { to: '#services', label: t('nav.services') },
    { to: '#insights', label: t('nav.insights') },
    { to: '#research', label: t('nav.research') },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
      <nav style={{ maxWidth: 1180, margin: '0 auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-text)' }}>
          <HeartPulse size={28} strokeWidth={2.2} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>NIROVVEDA</span>
        </Link>

        <div style={{ display: 'flex', gap: '1.25rem', marginLeft: '2rem', flex: 1 }} className="nav-desktop">
          {links.map((l) => (
            <a key={l.to} href={l.to} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LanguageSwitcher />
          <Link to="/login" className="btn-secondary">{t('nav.login')}</Link>
          <Link to="/register" className="btn-primary">{t('nav.getStarted')}</Link>
          <button onClick={() => setOpen(!open)} className="nav-mobile-toggle" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', display: 'none' }} aria-label={t('nav.menuLabel')}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {links.map((l) => (
            <a key={l.to} href={l.to} onClick={() => setOpen(false)} style={{ padding: '0.6rem 0.75rem', color: 'var(--color-text)', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem' }}>
            <Link to="/login" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>{t('nav.login')}</Link>
            <Link to="/register" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>{t('nav.getStarted')}</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="hero-gradient" style={{ color: 'white' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '5rem 1.25rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'center' }} className="hero-grid">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.85rem', borderRadius: 999, fontSize: '0.78rem', marginBottom: '1.25rem' }}>
            <Languages size={14} /> {t('hero.badge')}
          </div>
          <h1 style={{ fontSize: '2.9rem', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 1rem' }}>
            {t('hero.title1')}<br />{t('hero.title2')}
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.92, maxWidth: 560, lineHeight: 1.6, margin: '0 0 1.75rem' }}>
            {t('hero.desc')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.4rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {t('hero.getStarted')} <ArrowRight size={18} />
            </Link>
            <a href="#insights" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.7rem 1.4rem', borderRadius: 'var(--radius-btn)', fontWeight: 600, textDecoration: 'none' }}>
              {t('hero.exploreInsights')}
            </a>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[
              [t('hero.stat1v'), t('hero.stat1l')],
              [t('hero.stat2v'), t('hero.stat2l')],
              [t('hero.stat3v'), t('hero.stat3l')],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '1.5rem', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building2 size={18} />
            <span style={{ fontWeight: 600 }}>{t('hero.workflowTitle')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
            {[
              { icon: Users, t: t('hero.ws1'), c: 'badge-green' },
              { icon: Activity, t: t('hero.ws2'), c: 'badge-yellow' },
              { icon: Video, t: t('hero.ws3'), c: 'badge-blue' },
              { icon: GitPullRequest, t: t('hero.ws4'), c: 'badge-yellow' },
              { icon: Pill, t: t('hero.ws5'), c: 'badge-green' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.08)', padding: '0.6rem 0.8rem', borderRadius: 10 }}>
                <s.icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{s.t}</span>
                <span className={`badge ${s.c}`}>✓</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.72rem', opacity: 0.8 }}>
            {t('hero.workflowNote')}
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const { t, tr } = useLang();
  return (
    <section id="problem" style={{ padding: '4rem 1.25rem', background: 'white' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('problem.label')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0.75rem' }}>{t('problem.title')}</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {t('problem.desc')}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {problems.map((p) => {
            const card = tr(`problem.${p.k}`);
            return (
              <div key={p.k} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.25rem', background: 'var(--color-bg)' }}>
                <p.icon size={22} style={{ color: 'var(--color-primary)', marginBottom: '0.6rem' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.35rem' }}>{card.t}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem' }}>{card.d}</p>
                <span className="badge badge-gray">{card.s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t, tr } = useLang();
  return (
    <section id="how" style={{ padding: '4rem 1.25rem' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('how.label')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0.75rem' }}>{t('how.title')}</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{t('how.desc')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {steps.map((s) => {
            const card = tr(`how.${s.k}`);
            return (
              <div key={s.n} style={{ display: 'flex', gap: '0.9rem', padding: '1.25rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'var(--color-primary)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>{s.n}</div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.3rem' }}>{card.t}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{card.d}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { t, tr } = useLang();
  return (
    <section id="services" style={{ padding: '4rem 1.25rem', background: 'white' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('services.label')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0.75rem' }}>{t('services.title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {services.map((s) => {
            const card = tr(`services.${s.k}`);
            return (
              <div key={s.k} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.5rem', transition: 'box-shadow 0.2s' }} className="kpi-card">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-info-light)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem' }}>
                  <s.icon size={24} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.4rem' }}>{card.t}</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>{card.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Insights() {
  const [active, setActive] = useState('esanjeevani');
  const { t, tr } = useLang();
  const data = researchData[active] || researchData.esanjeevani;
  const max = Math.max(...data.values.map((d) => d.value)) || 1;

  const rl = (field) => tr(`research.${active}.${field}`) ?? data[field];
  const valLabel = (label) => tr(`research.${active}.values.${label}`) ?? label;

  return (
    <section id="insights" style={{ padding: '4rem 1.25rem' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 2rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('insight.label')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0.75rem' }}>{t('insight.title')}</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {t('insight.desc')}
          </p>
        </div>

        <div className="filter-bar" style={{ justifyContent: 'center' }}>
          {Object.entries(researchData).map(([key]) => (
            <button key={key} className={`filter-chip ${active === key ? 'active' : ''}`} onClick={() => setActive(key)}>
              {tr(`research.${key}.chip`) ?? researchData[key].chip}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }} className="insights-grid">
          <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.35rem' }}>{rl('title')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1.25rem' }}>{rl('desc')}</p>

            {data.chartType === 'line' ? (
              <svg viewBox="0 0 400 220" style={{ width: '100%', height: 'auto' }}>
                <line x1="20" y1="190" x2="390" y2="190" stroke="#e2e8f0" strokeWidth="1" />
                {data.values.map((d, i) => {
                  const x = 30 + i * (340 / (data.values.length - 1));
                  const y = 185 - (d.value / max) * 150;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#0f766e" />
                      {i > 0 && (
                        <line x1={30 + (i - 1) * (340 / (data.values.length - 1))} y1={185 - (data.values[i - 1].value / max) * 150} x2={x} y2={y} stroke="#0f766e" strokeWidth="2" />
                      )}
                      <text x={x - 8} y="205" fontSize="10" fill="#94a3b8">{valLabel(d.label)}</text>
                      <text x={x + 6} y={y - 6} fontSize="10" fill="#475569" fontWeight="600">{d.value}</text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {data.values.map((d, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{valLabel(d.label)}</span>
                      <span style={{ fontWeight: 600 }}>{d.value}{data.unitLabel}</span>
                    </div>
                    <div style={{ height: 18, background: '#f1f5f9', borderRadius: 9, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(d.value / max) * 100}%`, background: 'linear-gradient(90deg,#0f766e,#14b8a6)', borderRadius: 9 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              {rl('note')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> {t('insight.verified')}
              </div>
              <div style={{ fontSize: '0.86rem', lineHeight: 1.6, marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
                {rl('summary')}
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.25rem', flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{t('insight.sourceLabel')}</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{data.sourceOrg}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>{rl('sourceTitle')}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{data.year}</div>
              <a href={data.sourceUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', marginTop: '0.6rem' }}>
                {t('insight.viewSource')} <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ background: 'linear-gradient(135deg,#0f766e,#0891b2)', color: 'white', borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{t('insight.respond')}</div>
              <p style={{ fontSize: '0.85rem', opacity: 0.95, margin: 0, lineHeight: 1.5 }}>{rl('solutionLink')}</p>
              <Link to="/research" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', background: 'white', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 600, padding: '0.4rem 0.9rem', borderRadius: 8, textDecoration: 'none' }}>
                {t('insight.seeAll')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const { t, tr } = useLang();
  return (
    <section style={{ padding: '4rem 1.25rem', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('impact.label')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0.75rem' }}>{t('impact.title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {impact.map((s) => {
            const card = tr(`impact.${s.k}`);
            return (
              <div key={s.k} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{card.v}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>{card.l}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.6rem' }}>{card.s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Sources() {
  const { t, tr } = useLang();
  return (
    <section id="research" style={{ padding: '4rem 1.25rem', background: 'white' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('nav.research')}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0.5rem 0 0.75rem' }}>{t('sourcesTitle')}</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{t('sourcesDesc')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {sourceList.slice(0, 8).map((s) => (
            <div key={s.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '1.25rem', background: 'var(--color-bg)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.orgShort}</div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0.35rem 0 0.25rem' }}>{tr(`sources.${s.id}.title`) ?? s.title}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.year}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0.5rem 0 0.6rem' }}>{tr(`sources.${s.id}.usedFor`) ?? s.usedFor}</p>
              <a href={s.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                {t('sourcesView')} <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/research" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            {t('sourcesOpenAll')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTABand() {
  const { t } = useLang();
  return (
    <section className="hero-gradient" style={{ color: 'white' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '3.5rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>{t('cta.title')}</h2>
        <p style={{ opacity: 0.92, maxWidth: 560, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          {t('cta.desc')}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-secondary" style={{ padding: '0.7rem 1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>{t('cta.getStarted')}</Link>
          <Link to="/login" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-btn)', fontWeight: 600, textDecoration: 'none' }}>{t('cta.viewDemo')}</Link>
        </div>
        <div style={{ marginTop: '1.75rem', fontSize: '0.75rem', opacity: 0.8 }}>
          {t('cta.demoCreds')}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLang();
  const platformLinks = [
    { label: t('footer.register'), to: '/register' },
    { label: t('footer.login'), to: '/login' },
    { label: t('footer.healthMap'), to: '/map' },
    { label: t('footer.teleconsult'), to: '/app' },
  ];
  return (
    <footer style={{ background: 'var(--color-text)', color: '#cbd5e1', padding: '3rem 1.25rem 2rem' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '2rem' }} className="footer-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '0.75rem' }}>
            <HeartPulse size={26} style={{ color: 'var(--color-primary-light)' }} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>NIROVVEDA</span>
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, margin: 0, maxWidth: 320 }}>
            {t('footer.desc')}
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('footer.platform')}</div>
          {platformLinks.map((l) => (
            <Link key={l.to + l.label} to={l.to} style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem', textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('footer.researchHeader')}</div>
          <Link to="/research" style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem', textDecoration: 'none' }}>{t('footer.healthInsights')}</Link>
          <Link to="/research#sources" style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.4rem', textDecoration: 'none' }}>{t('footer.researchSources')}</Link>
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t('footer.disclaimer')}</div>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.5, margin: 0, color: '#94a3b8' }}>
            {t('footer.disclaimerText')}
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
        <span>{t('footer.copyright')}</span>
        <span>{t('footer.builtWith')}</span>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div>
      <NavBar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Services />
      <Insights />
      <Impact />
      <Sources />
      <CTABand />
      <Footer />
    </div>
  );
}