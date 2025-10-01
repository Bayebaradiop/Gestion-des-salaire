import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardSalairePage from './pages/dashboard/DashboardSalairePage';
import EmployesPage from './pages/employes/EmployesPage';
import AjoutEmployePage from './pages/employes/AjoutEmployePage';
import CyclesPage from './pages/cycles/CyclesPage';
import CreerCyclePage from './pages/cycles/CreerCyclePage';
import BulletinsPage from './pages/cycles/BulletinsPage';
import BulletinDetailPage from './pages/cycles/BulletinDetailPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminEntrepriseDetailsPage from './pages/SuperAdminEntrepriseDetailsPage';
import EmployesEntreprisePage from './pages/employes/EmployesEntreprisePage';
import CaissierDashboard from './pages/CaissierDashboard';
import ConsultationBulletins from './pages/ConsultationBulletins';
// import TestPage from './pages/TestPage';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DebugModal from './components/debug/DebugModal';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirection basée sur le rôle
  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'CAISSIER') return '/caissier';
    if (user.role === 'SUPER_ADMIN') return '/super-admin';
    return '/dashboard';
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getDefaultRoute()} />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/salaires" element={<DashboardSalairePage />} />
            <Route path="/employes" element={<EmployesPage />} />
            <Route path="/employes/ajouter" element={<AjoutEmployePage />} />
            <Route path="/cycles" element={<CyclesPage />} />
            <Route path="/cycles/creer" element={<CreerCyclePage />} />
            <Route path="/cycles/:cycleId/bulletins" element={<BulletinsPage />} />
            <Route path="/bulletins/:bulletinId" element={<BulletinDetailPage />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/entreprises/:entrepriseId" element={<SuperAdminEntrepriseDetailsPage />} />
            <Route path="/super-admin/entreprises/:entrepriseId/employes" element={<EmployesEntreprisePage />} />
            <Route path="/caissier" element={<CaissierDashboard />} />
            <Route path="/caissier/bulletins" element={<ConsultationBulletins />} />
            <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
            <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
          </Route>
        </Route>
      </Routes>
      
      {/* <DebugModal /> */}
    </>
  );
}

export default App;