# 🛣️ PROMPT INTÉGRATION REACT ROUTER - NAVIGATION COMPLÈTE

## 🎯 MISSION SPÉCIFIQUE

**Objectif :** Créer une navigation React Router complète et professionnelle pour le système de gestion de paie avec toutes les pages nécessaires, routes protégées et navigation contextuelle selon les rôles utilisateurs.

**IMPORTANT :** Utilisez React Router v6+ avec la syntaxe moderne et tous les fichiers en format **.jsx**

---

## 📋 STRUCTURE COMPLÈTE DES ROUTES

### **🔗 App.jsx - Configuration Router Principal**

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import PremiumDashboard from './pages/dashboard/PremiumDashboard';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';

// Employee Pages
import EmployesPage from './pages/employes/EmployesPage';
import AjoutEmployePage from './pages/employes/AjoutEmployePage';
import ModifierEmployePage from './pages/employes/ModifierEmployePage';
import EmployeDetailPage from './pages/employes/EmployeDetailPage';
import EmployesEntreprisePage from './pages/employes/EmployesEntreprisePage';

// Pointage Pages
import PointagesPage from './pages/pointages/PointagesPage';
import EnregistrementPointage from './pages/pointages/EnregistrementPointage';
import ListePointagesPage from './pages/pointages/ListePointagesPage';
import ValidationPointagesPage from './pages/pointages/ValidationPointagesPage';
import HistoriquePointagesPage from './pages/pointages/HistoriquePointagesPage';

// Cycles & Bulletins Pages
import CyclesPage from './pages/cycles/CyclesPage';
import CreerCyclePage from './pages/cycles/CreerCyclePage';
import ModifierCyclePage from './pages/cycles/ModifierCyclePage';
import CycleDetailPage from './pages/cycles/CycleDetailPage';
import BulletinsPage from './pages/cycles/BulletinsPage';
import BulletinDetailPage from './pages/cycles/BulletinDetailPage';
import GenererBulletinsPage from './pages/cycles/GenererBulletinsPage';

// Payment Pages
import PaiementsPage from './pages/paiements/PaiementsPage';
import HistoriquePaiementsPage from './pages/paiements/HistoriquePaiementsPage';
import EnregistrerPaiementPage from './pages/paiements/EnregistrerPaiementPage';
import PaiementAutomatiquePage from './pages/paiements/PaiementAutomatiquePage';
import RecuPaiementPage from './pages/paiements/RecuPaiementPage';

// Admin Pages
import GestionUtilisateursPage from './pages/admin/GestionUtilisateursPage';
import GestionEntreprisesPage from './pages/admin/GestionEntreprisesPage';
import GestionAutorisationsPage from './pages/admin/GestionAutorisationsPage';
import ParametresSystemePage from './pages/admin/ParametresSystemePage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Reports Pages
import RapportsPage from './pages/rapports/RapportsPage';
import RapportMasseSalarialePage from './pages/rapports/RapportMasseSalarialePage';
import RapportPointagesPage from './pages/rapports/RapportPointagesPage';
import RapportPaiementsPage from './pages/rapports/RapportPaiementsPage';
import ExportDonneesPage from './pages/rapports/ExportDonneesPage';

// Profile & Settings Pages
import ProfilPage from './pages/profil/ProfilPage';
import ParametresPage from './pages/parametres/ParametresPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// Error Pages
import NotFoundPage from './pages/errors/NotFoundPage';
import UnauthorizedPage from './pages/errors/UnauthorizedPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              {/* Routes Publiques */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } />

              {/* Routes Protégées avec Layout */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard Routes */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="premium-dashboard" element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <PremiumDashboard />
                  </ProtectedRoute>
                } />
                <Route path="super-admin" element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Employee Management Routes */}
                <Route path="employes">
                  <Route index element={<EmployesPage />} />
                  <Route path="ajouter" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <AjoutEmployePage />
                    </ProtectedRoute>
                  } />
                  <Route path=":id/modifier" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <ModifierEmployePage />
                    </ProtectedRoute>
                  } />
                  <Route path=":id" element={<EmployeDetailPage />} />
                  <Route path="entreprise/:entrepriseId" element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <EmployesEntreprisePage />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Pointage Routes */}
                <Route path="pointages">
                  <Route index element={<PointagesPage />} />
                  <Route path="enregistrement" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'CAISSIER']}>
                      <EnregistrementPointage />
                    </ProtectedRoute>
                  } />
                  <Route path="liste" element={<ListePointagesPage />} />
                  <Route path="validation" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ValidationPointagesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="historique" element={<HistoriquePointagesPage />} />
                  <Route path="employe/:employeId" element={<HistoriquePointagesPage />} />
                </Route>

                {/* Payroll Cycles Routes */}
                <Route path="cycles">
                  <Route index element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <CyclesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="creer" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <CreerCyclePage />
                    </ProtectedRoute>
                  } />
                  <Route path=":id/modifier" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <ModifierCyclePage />
                    </ProtectedRoute>
                  } />
                  <Route path=":id" element={<CycleDetailPage />} />
                  <Route path=":id/bulletins">
                    <Route index element={<BulletinsPage />} />
                    <Route path="generer" element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                        <GenererBulletinsPage />
                      </ProtectedRoute>
                    } />
                  </Route>
                </Route>

                {/* Bulletin Routes */}
                <Route path="bulletins">
                  <Route index element={<BulletinsPage />} />
                  <Route path=":id" element={<BulletinDetailPage />} />
                  <Route path="cycle/:cycleId" element={<BulletinsPage />} />
                </Route>

                {/* Payment Routes */}
                <Route path="paiements">
                  <Route index element={<PaiementsPage />} />
                  <Route path="historique" element={<HistoriquePaiementsPage />} />
                  <Route path="enregistrer" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'CAISSIER']}>
                      <EnregistrerPaiementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="bulletin/:bulletinId/enregistrer" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'CAISSIER']}>
                      <EnregistrerPaiementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="automatique" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <PaiementAutomatiquePage />
                    </ProtectedRoute>
                  } />
                  <Route path=":id/recu" element={<RecuPaiementPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <Routes>
                      <Route index element={<Navigate to="/admin/utilisateurs" replace />} />
                      <Route path="utilisateurs" element={<GestionUtilisateursPage />} />
                      <Route path="entreprises" element={<GestionEntreprisesPage />} />
                      <Route path="autorisations" element={<GestionAutorisationsPage />} />
                      <Route path="systeme" element={<ParametresSystemePage />} />
                      <Route path="audit" element={<AuditLogsPage />} />
                    </Routes>
                  </ProtectedRoute>
                } />

                {/* Reports Routes */}
                <Route path="rapports">
                  <Route index element={<RapportsPage />} />
                  <Route path="masse-salariale" element={<RapportMasseSalarialePage />} />
                  <Route path="pointages" element={<RapportPointagesPage />} />
                  <Route path="paiements" element={<RapportPaiementsPage />} />
                  <Route path="export" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <ExportDonneesPage />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Profile & Settings Routes */}
                <Route path="profil" element={<ProfilPage />} />
                <Route path="parametres" element={<ParametresPage />} />
                <Route path="notifications" element={<NotificationsPage />} />

                {/* Error Routes */}
                <Route path="unauthorized" element={<UnauthorizedPage />} />
                <Route path="server-error" element={<ServerErrorPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🔐 COMPOSANTS DE PROTECTION DES ROUTES

### **ProtectedRoute.jsx - Protection par Rôles**

```jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Vérification des rôles si spécifiés
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### **PublicRoute.jsx - Routes Publiques**

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
```

---

## 🏗️ LAYOUT PRINCIPAL AVEC NAVIGATION

### **Layout.jsx - Structure Principale**

```jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <MobileSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          user={user} 
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
```

### **Sidebar.jsx - Navigation Principale**

```jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, Users, Clock, Calendar, DollarSign, 
  FileText, BarChart3, Settings, User, Bell, LogOut,
  Building2, Shield, Database, Download, Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout, isAdmin, isSuperAdmin, isCaissier } = useAuth();
  const location = useLocation();

  const navigation = [
    // Dashboard
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN']
    },
    {
      name: 'Dashboard Premium',
      href: '/premium-dashboard',
      icon: BarChart3,
      roles: ['ADMIN', 'SUPER_ADMIN']
    },

    // Gestion des employés
    {
      name: 'Employés',
      href: '/employes',
      icon: Users,
      roles: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'],
      children: [
        { name: 'Liste des employés', href: '/employes' },
        { name: 'Ajouter employé', href: '/employes/ajouter', roles: ['ADMIN', 'SUPER_ADMIN'] }
      ]
    },

    // Pointages
    {
      name: 'Pointages',
      href: '/pointages',
      icon: Clock,
      roles: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'],
      children: [
        { name: 'Vue d\'ensemble', href: '/pointages' },
        { name: 'Enregistrement', href: '/pointages/enregistrement', roles: ['ADMIN', 'CAISSIER'] },
        { name: 'Liste & Validation', href: '/pointages/liste' },
        { name: 'Historique', href: '/pointages/historique' }
      ]
    },

    // Cycles de paie
    {
      name: 'Cycles de Paie',
      href: '/cycles',
      icon: Calendar,
      roles: ['ADMIN', 'SUPER_ADMIN'],
      children: [
        { name: 'Gestion des cycles', href: '/cycles' },
        { name: 'Créer un cycle', href: '/cycles/creer' }
      ]
    },

    // Bulletins
    {
      name: 'Bulletins de Paie',
      href: '/bulletins',
      icon: FileText,
      roles: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN']
    },

    // Paiements
    {
      name: 'Paiements',
      href: '/paiements',
      icon: Wallet,
      roles: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'],
      children: [
        { name: 'Gestion paiements', href: '/paiements' },
        { name: 'Historique', href: '/paiements/historique' },
        { name: 'Paiement automatique', href: '/paiements/automatique', roles: ['ADMIN'] }
      ]
    },

    // Rapports
    {
      name: 'Rapports',
      href: '/rapports',
      icon: BarChart3,
      roles: ['ADMIN', 'SUPER_ADMIN'],
      children: [
        { name: 'Vue d\'ensemble', href: '/rapports' },
        { name: 'Masse salariale', href: '/rapports/masse-salariale' },
        { name: 'Pointages', href: '/rapports/pointages' },
        { name: 'Paiements', href: '/rapports/paiements' },
        { name: 'Export données', href: '/rapports/export' }
      ]
    },

    // Administration (Super Admin uniquement)
    {
      name: 'Administration',
      href: '/admin',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
      children: [
        { name: 'Utilisateurs', href: '/admin/utilisateurs' },
        { name: 'Entreprises', href: '/admin/entreprises' },
        { name: 'Autorisations', href: '/admin/autorisations' },
        { name: 'Système', href: '/admin/systeme' },
        { name: 'Audit', href: '/admin/audit' }
      ]
    }
  ];

  const bottomNavigation = [
    { name: 'Profil', href: '/profil', icon: User },
    { name: 'Paramètres', href: '/parametres', icon: Settings },
    { name: 'Notifications', href: '/notifications', icon: Bell }
  ];

  const isActiveLink = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const hasPermission = (roles) => {
    if (!roles) return true;
    return roles.includes(user?.role);
  };

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center space-x-2"
        >
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            GestionPaie
          </span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          if (!hasPermission(item.roles)) return null;

          return (
            <div key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActiveLink(item.href)
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`
                }
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActiveLink(item.href)
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </NavLink>

              {/* Sous-navigation */}
              {item.children && isActiveLink(item.href) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-1 space-y-1"
                >
                  {item.children.map((child) => {
                    if (child.roles && !hasPermission(child.roles)) return null;
                    
                    return (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        className={({ isActive }) =>
                          `block px-2 py-1 text-sm rounded-md transition-colors duration-200 ${
                            isActive
                              ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/50'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        {child.name}
                      </NavLink>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Navigation du bas */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-4 space-y-1">
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}

        {/* Déconnexion */}
        <button
          onClick={logout}
          className="w-full group flex items-center px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Déconnexion
        </button>
      </div>

      {/* Info utilisateur */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
```

---

## 🎯 NAVIGATION CONTEXTUELLE PAR RÔLES

### **Permissions par Rôle :**

```jsx
// hooks/usePermissions.js
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = {
    // Dashboard
    canViewDashboard: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'].includes(user?.role),
    canViewPremiumDashboard: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),
    canViewSuperAdminDashboard: user?.role === 'SUPER_ADMIN',

    // Employés
    canViewEmployees: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'].includes(user?.role),
    canCreateEmployee: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),
    canEditEmployee: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),
    canDeleteEmployee: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),

    // Pointages
    canViewPointages: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'].includes(user?.role),
    canRecordPointages: ['ADMIN', 'CAISSIER'].includes(user?.role),
    canValidatePointages: user?.role === 'ADMIN',

    // Cycles de paie
    canViewCycles: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),
    canCreateCycle: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),
    canEditCycle: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),

    // Bulletins
    canViewBulletins: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'].includes(user?.role),
    canGenerateBulletins: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),

    // Paiements
    canViewPayments: ['ADMIN', 'CAISSIER', 'SUPER_ADMIN'].includes(user?.role),
    canRecordPayments: ['ADMIN', 'CAISSIER'].includes(user?.role),
    canAutomaticPayments: user?.role === 'ADMIN',

    // Administration
    canViewAdmin: user?.role === 'SUPER_ADMIN',
    canManageUsers: user?.role === 'SUPER_ADMIN',
    canManageEnterprises: user?.role === 'SUPER_ADMIN',

    // Rapports
    canViewReports: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role),
    canExportData: ['ADMIN', 'SUPER_ADMIN'].includes(user?.role)
  };

  return permissions;
};
```

---

## 🔄 NAVIGATION PROGRAMMATIQUE

### **Hooks de Navigation Métier :**

```jsx
// hooks/useNavigation.js
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navigateToEmployee = (employeeId) => {
    navigate(`/employes/${employeeId}`);
  };

  const navigateToEmployeeEdit = (employeeId) => {
    navigate(`/employes/${employeeId}/modifier`);
  };

  const navigateToCycle = (cycleId) => {
    navigate(`/cycles/${cycleId}`);
  };

  const navigateToCycleBulletins = (cycleId) => {
    navigate(`/cycles/${cycleId}/bulletins`);
  };

  const navigateToBulletinDetail = (bulletinId) => {
    navigate(`/bulletins/${bulletinId}`);
  };

  const navigateToPaymentRecord = (bulletinId) => {
    navigate(`/paiements/bulletin/${bulletinId}/enregistrer`);
  };

  const navigateToEmployeePointages = (employeId) => {
    navigate(`/pointages/employe/${employeId}`);
  };

  const navigateWithRole = (path, allowedRoles = []) => {
    if (allowedRoles.length === 0 || allowedRoles.includes(user?.role)) {
      navigate(path);
    } else {
      navigate('/unauthorized');
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.startsWith('/employes')) return 'employes';
    if (path.startsWith('/pointages')) return 'pointages';
    if (path.startsWith('/cycles')) return 'cycles';
    if (path.startsWith('/bulletins')) return 'bulletins';
    if (path.startsWith('/paiements')) return 'paiements';
    if (path.startsWith('/rapports')) return 'rapports';
    if (path.startsWith('/admin')) return 'admin';
    return 'dashboard';
  };

  return {
    navigateToEmployee,
    navigateToEmployeeEdit,
    navigateToCycle,
    navigateToCycleBulletins,
    navigateToBulletinDetail,
    navigateToPaymentRecord,
    navigateToEmployeePointages,
    navigateWithRole,
    goBack,
    isCurrentPath,
    getCurrentSection,
    navigate,
    location
  };
};
```

---

## 📱 NAVIGATION RESPONSIVE

### **MobileSidebar.jsx - Navigation Mobile**

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

const MobileSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 lg:hidden"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            GestionPaie
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </motion.div>
    </>
  );
};

export default MobileSidebar;
```

---

## 🎯 BREADCRUMBS & NAVIGATION CONTEXTUELLE

### **Breadcrumbs.jsx - Fil d'Ariane**

```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Accueil', href: '/dashboard', icon: Home }];

    const pathMap = {
      'employes': 'Employés',
      'pointages': 'Pointages',
      'cycles': 'Cycles de Paie',
      'bulletins': 'Bulletins',
      'paiements': 'Paiements',
      'rapports': 'Rapports',
      'admin': 'Administration',
      'profil': 'Profil',
      'parametres': 'Paramètres'
    };

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const name = pathMap[path] || path;
      
      breadcrumbs.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        href: currentPath,
        current: index === paths.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
              <Link
                to={breadcrumb.href}
                className={`flex items-center text-sm font-medium ${
                  breadcrumb.current
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {breadcrumb.icon && (
                  <breadcrumb.icon className="h-4 w-4 mr-1" />
                )}
                {breadcrumb.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
```

---

## 🚀 LIVRABLES ATTENDUS

1. **App.jsx complet** avec toutes les routes
2. **Composants de protection** (ProtectedRoute, PublicRoute)
3. **Layout responsive** avec sidebar et header
4. **Navigation contextuelle** par rôles
5. **Hooks personnalisés** pour navigation métier
6. **Breadcrumbs** et navigation mobile
7. **Transitions animées** entre les pages

Cette structure de navigation React Router vous donnera une application professionnelle et complète pour votre concours ! 🛣️✨