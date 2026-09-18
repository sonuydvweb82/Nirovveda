import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import PatientDashboard from './pages/patient/PatientDashboard';
import HealthWorkerDashboard from './pages/health-worker/HealthWorkerDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import FacilityDashboard from './pages/facility/FacilityDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import HealthcareMap from './pages/HealthcareMap';
import ResearchPage from './pages/ResearchPage';
import Teleconsultation from './pages/Teleconsultation';
import NotFound from './pages/errors/NotFound';
import Forbidden from './pages/errors/Forbidden';
import ServerError from './pages/errors/ServerError';
import ErrorBoundary from './components/ErrorBoundary';
import { Spin } from './components/ui/Spin';

const roleHome = (role) => {
  switch (role) {
    case 'PATIENT': return '/app/patient';
    case 'HEALTH_WORKER': return '/app/worker';
    case 'DOCTOR': return '/app/doctor';
    case 'FACILITY_ADMIN': return '/app/facility';
    case 'SUPER_ADMIN': return '/app/admin';
    default: return '/login';
  }
}

function ProtectedRoute({ children, allowed }) {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowed && !allowed.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={roleHome(user.role)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={roleHome(user.role)} replace /> : <Register />} />
      <Route path="/research" element={<ResearchPage />} />
      <Route path="/map" element={<HealthcareMap />} />

      <Route path="/app" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to={roleHome(user?.role)} replace />} />
        <Route path="patient/*" element={<ProtectedRoute allowed={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="worker/*" element={<ProtectedRoute allowed={['HEALTH_WORKER', 'FACILITY_ADMIN', 'SUPER_ADMIN']}><HealthWorkerDashboard /></ProtectedRoute>} />
        <Route path="doctor/*" element={<ProtectedRoute allowed={['DOCTOR', 'FACILITY_ADMIN', 'SUPER_ADMIN']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="facility/*" element={<ProtectedRoute allowed={['FACILITY_ADMIN', 'SUPER_ADMIN']}><FacilityDashboard /></ProtectedRoute>} />
        <Route path="admin/*" element={<ProtectedRoute allowed={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/teleconsultation/:room" element={<ProtectedRoute><Teleconsultation /></ProtectedRoute>} />

      <Route path="/403" element={<Forbidden />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </div>
  );
}