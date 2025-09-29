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

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        
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
            {/* <Route path="/test" element={<TestPage />} /> */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>
      </Routes>
      
      {/* Composant de débogage pour les modales */}
      <DebugModal />
    </>
  );
}

export default App;