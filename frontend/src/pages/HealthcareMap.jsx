import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Stethoscope, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import demoData from '../data/demo';
import { useLoad, load } from '../hooks/useLoad';
import { PageHeader } from '../components/ui';
import { useLang } from '../context/LangContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const iconMap = {
  PHC: new L.DivIcon({ className: '', html: `<div style="width:28px;height:28px;background:#14b8a6;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg></div>`, iconSize: [28, 28] }),
  SUB_CENTRE: new L.DivIcon({ className: '', html: `<div style="width:28px;height:28px;background:#14b8a6;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg></div>`, iconSize: [28, 28] }),
  CHC: new L.DivIcon({ className: '', html: `<div style="width:32px;height:32px;background:#0f766e;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg></div>`, iconSize: [32, 32] }),
  DISTRICT_HOSPITAL: new L.DivIcon({ className: '', html: `<div style="width:36px;height:36px;background:#dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg></div>`, iconSize: [36, 36] }),
  PRIVATE_HOSPITAL: new L.DivIcon({ className: '', html: `<div style="width:36px;height:36px;background:#dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg></div>`, iconSize: [36, 36] }),
};
const fallbackIcon = iconMap.PHC;

function Legend() {
  const { t } = useLang();
  return (
    <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'white', borderRadius: 8, padding: '0.7rem 0.9rem', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#14b8a6', border: '1px solid white' }} /> {t('map.legendPhc')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#0f766e', border: '1px solid white' }} /> {t('map.legendChc')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626', border: '1px solid white' }} /> {t('map.legendDh')}</div>
      <div style={{ marginTop: '0.2rem', fontSize: '0.68rem', color: '#64748b' }}>{t('map.legendNote')}</div>
    </div>
  );
}

export default function HealthcareMap({ facilities: propFacilities, embedded = false }) {
  const { t } = useLang();
  const { data, loading } = useLoad(() => load('/facilities'), demoData.facilities, []);
  const facilities = propFacilities || data || [];
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? facilities : facilities.filter((f) => f.type === filter);
  const chips = [
    { value: 'All', label: t('map.all') },
    { value: 'PHC', label: 'PHC' },
    { value: 'CHC', label: 'CHC' },
    { value: 'DISTRICT_HOSPITAL', label: t('map.districtHospital') },
    { value: 'SUB_CENTRE', label: t('map.subCentre') },
  ];

  return (
    <div>
      <PageHeader
        title={t('map.label')}
        subtitle={t('map.subtitle')}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-bar">
              {chips.map((c) => (
                <button key={c.value} className={`filter-chip ${filter === c.value ? 'active' : ''}`} onClick={() => setFilter(c.value)}>{c.label}</button>
              ))}
            </div>
            <LanguageSwitcher />
            {!embedded && (
              <Link to="/" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}>
                {t('researchPage.backHome')}
              </Link>
            )}
          </div>
        }
      />

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>{t('map.noFacilities')}</div>
      ) : (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <MapContainer center={[20.95, 77.35]} zoom={9} scrollWheelZoom={true} style={{ height: 520, width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((f) => (
              <Marker key={f.id} position={[f.latitude || 20.93, f.longitude || 77.75]} icon={iconMap[f.type] || fallbackIcon}>
                <Popup>
                  <div style={{ fontSize: '0.85rem', minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{f.name}</div>
                    <div style={{ color: '#64748b' }}>{f.type} · {f.district}, {f.state}</div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', margin: '0.4rem 0' }}>
                      {(f.services || []).map((s) => <span key={s} style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: 999 }}>{s}</span>)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      {(t('map.doctorsCount') || '{n} doctors').replace('{n}', f._count?.doctors ?? 0)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <Legend />
        </div>
      )}

      <div style={{ marginTop: '1.25rem', padding: '0.9rem 1rem', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
        <AlertTriangle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          <b>{t('map.contextIntro')}</b> {t('map.context')}
        </div>
      </div>
    </div>
  );
}