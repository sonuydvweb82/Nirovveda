import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, ListOrdered, GitPullRequest,
  Stethoscope, Pill, ClipboardCheck, Bell, AlertTriangle, MapPin,
  LogOut, Menu, X, FileBarChart, Video, HeartPulse, Phone, UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useOnline } from '../../hooks/useOnline';
import { clsx, initials } from '../../utils';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const navItemDefs = {
  PATIENT: [
    { to: '/app/patient', k: 'dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/patient/appointments', k: 'appointments', icon: CalendarDays },
    { to: '/app/patient/records', k: 'dash.myRecords', icon: FileBarChart },
    { to: '/app/patient/referrals', k: 'referrals', icon: GitPullRequest },
    { to: '/app/patient/medicine', k: 'dash.medicineAvailability', icon: Pill },
    { to: '/app/patient/map', k: 'dash.nearbyFacilities', icon: MapPin },
    { to: '/app/patient/teleconsult', k: 'dash.teleconsultation', icon: Video },
    { to: '/app/patient/followups', k: 'followUps', icon: ClipboardCheck },
  ],
  HEALTH_WORKER: [
    { to: '/app/worker', k: 'dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/worker/patients', k: 'patients', icon: Users },
    { to: '/app/worker/register', k: 'dash.registerPatient', icon: UserPlus },
    { to: '/app/worker/triage', k: 'dash.aiTriage', icon: HeartPulse },
    { to: '/app/worker/appointments', k: 'appointments', icon: CalendarDays },
    { to: '/app/worker/queue', k: 'queue', icon: ListOrdered },
    { to: '/app/worker/referrals', k: 'referrals', icon: GitPullRequest },
    { to: '/app/worker/followups', k: 'followUps', icon: ClipboardCheck },
    { to: '/app/worker/medicine', k: 'dash.medicine', icon: Pill },
    { to: '/app/worker/map', k: 'dash.facilityMap', icon: MapPin },
  ],
  DOCTOR: [
    { to: '/app/doctor', k: 'dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/doctor/today', k: 'dash.todaysAppointments', icon: CalendarDays },
    { to: '/app/doctor/queue', k: 'dash.patientQueue', icon: ListOrdered },
    { to: '/app/doctor/patients', k: 'patients', icon: Users },
    { to: '/app/doctor/consultation', k: 'dash.consultations', icon: Stethoscope },
    { to: '/app/doctor/referrals', k: 'referrals', icon: GitPullRequest },
    { to: '/app/doctor/diagnostics', k: 'diagnostics', icon: FileBarChart },
    { to: '/app/doctor/teleconsult', k: 'dash.teleconsultation', icon: Video },
    { to: '/app/doctor/followups', k: 'followUps', icon: ClipboardCheck },
  ],
  FACILITY_ADMIN: [
    { to: '/app/facility', k: 'dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/facility/queue', k: 'dash.queueManagement', icon: ListOrdered },
    { to: '/app/facility/appointments', k: 'appointments', icon: CalendarDays },
    { to: '/app/facility/doctors', k: 'dash.doctors', icon: Stethoscope },
    { to: '/app/facility/referrals', k: 'referrals', icon: GitPullRequest },
    { to: '/app/facility/medicine', k: 'dash.inventory', icon: Pill },
    { to: '/app/facility/diagnostics', k: 'diagnostics', icon: FileBarChart },
    { to: '/app/facility/analytics', k: 'dash.analytics', icon: ClipboardCheck },
    { to: '/app/facility/map', k: 'dash.facilityMap', icon: MapPin },
  ],
  SUPER_ADMIN: [
    { to: '/app/admin', k: 'dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/admin/patients', k: 'patients', icon: Users },
    { to: '/app/admin/doctors', k: 'dash.doctors', icon: Stethoscope },
    { to: '/app/admin/facilities', k: 'dash.facilities', icon: MapPin },
    { to: '/app/admin/referrals', k: 'referrals', icon: GitPullRequest },
    { to: '/app/admin/emergency', k: 'emergency', icon: AlertTriangle },
    { to: '/app/admin/medicine', k: 'dash.medicines', icon: Pill },
    { to: '/app/admin/analytics', k: 'dash.analytics', icon: ClipboardCheck },
    { to: '/app/admin/research', k: 'dash.research', icon: FileBarChart },
  ],
};

const roleKeyMap = {
  PATIENT: 'patient',
  HEALTH_WORKER: 'worker',
  DOCTOR: 'doctor',
  FACILITY_ADMIN: 'facility',
  SUPER_ADMIN: 'admin',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const online = useOnline();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const roleKey = roleKeyMap[user?.role] || 'patient';
  const roleLabel = t(`login.roles.${roleKey}.label`) || user?.role?.replace('_', ' ');

  const items = (navItemDefs[user?.role] || []).map((item) => ({
    ...item,
    label: t(item.k),
  }));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebar = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}>
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HeartPulse size={26} strokeWidth={2.2} style={{ color: 'var(--color-sidebar-active)' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.1 }}>NIROVVEDA</div>
          <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>{t('dash.brandSub')}</div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
            onClick={() => setOpen(false)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div style={{ margin: '0.75rem 0 0.5rem', height: 1, background: 'rgba(255,255,255,0.08)' }} />
        <NavLink to="/research" className="sidebar-link" onClick={() => setOpen(false)}>
          <FileBarChart size={18} />
          <span>{t('dash.research')}</span>
        </NavLink>
        <NavLink to="/map" className="sidebar-link" onClick={() => setOpen(false)}>
          <MapPin size={18} />
          <span>{t('dash.healthMap')}</span>
        </NavLink>
      </nav>

      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--color-sidebar-active)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem',
          }}>
            {initials(user?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>{roleLabel}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={18} /> <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', display: 'none' }} className="desktop-sidebar">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgb(0 0 0 / 0.5)' }} onClick={() => setOpen(false)}>
          <div style={{ width: 280, height: '100%', background: 'var(--color-sidebar-bg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} aria-label="Close menu"><X size={22} /></button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'white', borderBottom: '1px solid var(--color-border)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', display: 'inline-flex' }} className="desktop-hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Phone size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{t('dash.network')}</span>
          </div>

          <LanguageSwitcher />

          <span className={clsx('badge', online ? 'badge-green' : 'badge-red')}>
            {online ? t('dash.online') : t('dash.offline')}
          </span>
          {!online && (
            <span className="badge badge-yellow">{t('sync_pending')}</span>
          )}

          <Link to="/app" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.8rem' }}>
            <Bell size={18} />
          </Link>
        </header>

        <main style={{ padding: '1.5rem 1.5rem', flex: 1 }}>
          <Outlet />
        </main>

        <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>{t('dash.footerNote')}</span>
          <span>{online ? t('dash.footerStatus') : t('dash.footerPending')}</span>
        </footer>
      </div>
    </div>
  );
}