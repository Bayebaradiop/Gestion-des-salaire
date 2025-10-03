import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Users,
  DollarSign,
  BarChart3,
  Building2,
  Settings,
  Calendar,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Wallet,
  UserCheck,
  Clock,
  Archive
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/AdvancedThemeContext';
import { Button } from '../ui/AdvancedButton';

const PremiumSidebar = ({ isCollapsed = false, onToggle }) => {
  const { user, logout, isAdmin, isSuperAdmin, isCaissier } = useAuth();
  const { isDark, primaryColor } = useTheme();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Configuration des menus par rôle
  const menuConfig = {
    SUPER_ADMIN: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/dashboard',
        badge: { text: 'Pro', variant: 'gradient' }
      },
      {
        id: 'entreprises',
        label: 'Entreprises',
        icon: Building2,
        submenu: [
          { label: 'Toutes les entreprises', path: '/admin/entreprises', icon: Building2 },
          { label: 'Statistiques', path: '/admin/entreprises/stats', icon: TrendingUp },
          { label: 'Rapports', path: '/admin/entreprises/reports', icon: FileText }
        ]
      },
      {
        id: 'users',
        label: 'Utilisateurs',
        icon: Users,
        submenu: [
          { label: 'Gestion utilisateurs', path: '/admin/users', icon: Users },
          { label: 'Rôles & permissions', path: '/admin/roles', icon: Shield },
          { label: 'Audit logs', path: '/admin/audit', icon: Archive }
        ]
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        path: '/admin/analytics',
        badge: { text: 'New', variant: 'success' }
      }
    ],
    ADMIN: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/dashboard'
      },
      {
        id: 'employees',
        label: 'Employés',
        icon: Users,
        submenu: [
          { label: 'Liste des employés', path: '/employes', icon: Users },
          { label: 'Ajouter employé', path: '/employes/ajouter', icon: UserCheck },
          { label: 'Historique', path: '/employes/historique', icon: Clock }
        ]
      },
      {
        id: 'payroll',
        label: 'Gestion Paie',
        icon: DollarSign,
        submenu: [
          { label: 'Cycles de paie', path: '/cycles', icon: Calendar },
          { label: 'Bulletins', path: '/bulletins', icon: FileText },
          { label: 'Paiements', path: '/paiements', icon: Wallet }
        ]
      },
      {
        id: 'reports',
        label: 'Rapports',
        icon: BarChart3,
        path: '/reports'
      }
    ],
    CAISSIER: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/caissier'
      },
      {
        id: 'payments',
        label: 'Paiements',
        icon: DollarSign,
        path: '/caissier/paiements'
      },
      {
        id: 'bulletins',
        label: 'Bulletins',
        icon: FileText,
        path: '/caissier/bulletins'
      }
    ]
  };

  const menuItems = menuConfig[user?.role] || [];

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' }
  };

  const MenuIcon = ({ icon: Icon, isActive, hasSubmenu, isExpanded }) => (
    <div className={`
      relative p-2 rounded-xl transition-all duration-200
      ${isActive 
        ? `bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25` 
        : isDark ? 'bg-gray-700/50' : 'bg-gray-100'
      }
      group-hover:scale-110 group-hover:shadow-lg
    `}>
      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'}`} />
      
      {hasSubmenu && (
        <div className="absolute -right-1 -top-1">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-primary-500" />
          ) : (
            <ChevronRight className="h-3 w-3 text-primary-500" />
          )}
        </div>
      )}
      
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  );

  const Badge = ({ badge }) => {
    if (!badge) return null;
    
    const variants = {
      gradient: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      success: 'bg-green-500 text-white',
      primary: 'bg-primary-500 text-white'
    };

    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          px-2 py-0.5 text-xs font-medium rounded-full
          ${variants[badge.variant] || variants.primary}
          shadow-lg animate-pulse
        `}
      >
        {badge.text}
      </motion.span>
    );
  };

  const MenuItem = ({ item, level = 0 }) => {
    const isActive = location.pathname === item.path;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.id];
    const showSubmenu = hasSubmenu && (isExpanded || (!isCollapsed && isExpanded));

    return (
      <div>
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasSubmenu ? (
            <button
              onClick={() => toggleSubmenu(item.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1
                transition-all duration-200 group relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-l-4 border-primary-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <MenuIcon 
                  icon={item.icon} 
                  isActive={isActive} 
                  hasSubmenu={hasSubmenu}
                  isExpanded={isExpanded}
                />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center space-x-2"
                    >
                      <span className={`font-medium ${isActive ? 'text-primary-600' : isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                      <Badge badge={item.badge} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl mb-1
                transition-all duration-200 group relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-l-4 border-primary-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              <MenuIcon icon={item.icon} isActive={isActive} />
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <span className={`font-medium ${isActive ? 'text-primary-600' : isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                    <Badge badge={item.badge} />
                  </motion.div>
                )}
              </AnimatePresence>
            </NavLink>
          )}
        </motion.div>

        {/* Submenu */}
        <AnimatePresence>
          {showSubmenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 overflow-hidden"
            >
              {item.submenu.map((subItem, index) => (
                <motion.div
                  key={subItem.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={subItem.path}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-2 rounded-lg mb-1 ml-8
                      transition-all duration-200 relative
                      ${isActive 
                        ? 'bg-primary-500/10 text-primary-600 border-l-2 border-primary-500' 
                        : isDark ? 'text-gray-300 hover:bg-gray-700/30' : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <subItem.icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{subItem.label}</span>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative min-h-screen backdrop-blur-lg border-r transition-all duration-300
        ${isDark 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
        }
        shadow-2xl
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <motion.div
          initial={false}
          animate={{ 
            justifyContent: isCollapsed ? 'center' : 'space-between' 
          }}
          className="flex items-center"
        >
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    PayManager
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Premium Edition
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="ml-auto"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}

        {/* Divider */}
        <div className="py-4">
          <div className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>

        {/* Additional Links */}
        <MenuItem 
          item={{
            id: 'settings',
            label: 'Paramètres',
            icon: Settings,
            path: '/settings'
          }}
        />
        
        <MenuItem 
          item={{
            id: 'help',
            label: 'Aide & Support',
            icon: HelpCircle,
            path: '/help',
            badge: { text: '24/7', variant: 'success' }
          }}
        />
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`
            p-3 rounded-xl cursor-pointer transition-all duration-200
            ${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'}
          `}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>
            
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogOut />}
                onClick={logout}
                className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Déconnexion
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse/Expand indicator */}
      <motion.div
        className="absolute top-1/2 -right-3 z-10"
        whileHover={{ scale: 1.1 }}
      >
        <button
          onClick={onToggle}
          className={`
            h-6 w-6 rounded-full shadow-lg border-2 flex items-center justify-center
            ${isDark 
              ? 'bg-gray-800 border-gray-600 text-gray-300' 
              : 'bg-white border-gray-300 text-gray-600'
            }
            hover:shadow-xl transition-all duration-200
          `}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-3 w-3" />
          </motion.div>
        </button>
      </motion.div>
    </motion.aside>
  );
};

export default PremiumSidebar;