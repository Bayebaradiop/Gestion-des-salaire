import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard,
  Users,
  DollarSign,
  Building2,
  Settings,
  Clock,
  FileText,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin, isSuperAdmin, isCaissier } = useAuth();

  const NavItem = ({ to, icon: Icon, label, badge }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `
        group relative flex items-center gap-3 px-4 py-3.5 rounded-xl
        transition-all duration-300 overflow-hidden font-semibold text-base
        ${isActive 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40' 
          : 'text-gray-900 dark:text-gray-50 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-700 dark:hover:text-indigo-300'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3 w-full">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
            <span className="font-bold text-base">{label}</span>
            {badge && (
              <span className="ml-auto px-2.5 py-1 text-xs font-extrabold bg-red-500 text-white rounded-full shadow-md">
                {badge}
              </span>
            )}
            {!isActive && (
              <ChevronRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen hidden md:block">
      <div className="p-6 h-full flex flex-col">
        {/* Header with logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PayFlow
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestion des Salaires</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          <AnimatePresence>
            {isCaissier && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2"
              >
                <div className="px-2 mb-4">
                  <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                    Caissier
                  </p>
                </div>
                <NavItem to="/caissier" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/caissier/bulletins" icon={FileText} label="Bulletins" />
                <NavItem to="/pointages/enregistrement" icon={Clock} label="Pointage" />
              </motion.div>
            )}

            {!isSuperAdmin && !isCaissier && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2"
              >
                <div className="px-2 mb-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Principal
                  </p>
                </div>
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
                <NavItem to="/employes" icon={Users} label="Employés" />
                
                {isAdmin && (
                  <NavItem to="/cycles" icon={DollarSign} label="Cycles de Paie" />
                )}
                
                <div className="px-2 mt-6 mb-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Temps & Présence
                  </p>
                </div>
                <NavItem to="/pointages" icon={Clock} label="Pointages" />
                
                {(isAdmin || isCaissier) && (
                  <NavItem to="/pointages/enregistrement" icon={TrendingUp} label="Enregistrement" />
                )}
              </motion.div>
            )}

            {isSuperAdmin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2"
              >
                <div className="px-2 mb-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Super Admin
                  </p>
                </div>
                <NavItem to="/super-admin" icon={Building2} label="Entreprises" />
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
          <NavItem to="/parametres" icon={Settings} label="Paramètres" />
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Version</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">v2.0.0</p>
          </motion.div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;