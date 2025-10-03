import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/auth.service';
import { 
  User, 
  Building2, 
  Bell, 
  LogOut, 
  Settings, 
  ChevronDown,
  Menu,
  Search,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { primaryColor } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [entrepriseInfo, setEntrepriseInfo] = useState(null);

  useEffect(() => {
    const chargerInfosEntreprise = async () => {
      if (user && (user.role === 'ADMIN' || user.role === 'CAISSIER')) {
        try {
          const profil = await authService.obtenirProfil();
          if (profil?.entreprise) {
            setEntrepriseInfo(profil.entreprise);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des infos entreprise:', error);
        }
      }
    };

    chargerInfosEntreprise();
  }, [user]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const mockNotifications = [
    { id: 1, type: 'info', message: 'Nouveau cycle de paie créé', time: 'Il y a 2h' },
    { id: 2, type: 'success', message: 'Paiement effectué avec succès', time: 'Il y a 5h' },
    { id: 3, type: 'warning', message: '3 employés à valider', time: 'Hier' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Enterprise Info */}
            {entrepriseInfo && (user?.role === 'ADMIN' || user?.role === 'CAISSIER') && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl"
              >
                {entrepriseInfo.logo ? (
                  <img
                    src={entrepriseInfo.logo}
                    alt={`Logo ${entrepriseInfo.nom}`}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-white dark:ring-gray-800 shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{entrepriseInfo.nom}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'ADMIN' ? 'Administration' : 'Caisse'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Center Section - Search */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleNotifications}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Vous avez 3 nouvelles notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                          className="p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer"
                        >
                          <p className="text-sm text-gray-900 dark:text-white font-medium">{notif.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.time}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-200 dark:border-gray-800">
                      <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleDropdown}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{user?.prenom} {user?.nom}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      <div className="inline-flex px-3 py-1 bg-white dark:bg-gray-800 rounded-full">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{user?.role}</p>
                      </div>
                    </div>

                    {/* Enterprise Info Mobile */}
                    {entrepriseInfo && (user?.role === 'ADMIN' || user?.role === 'CAISSIER') && (
                      <div className="p-4 md:hidden border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          {entrepriseInfo.logo ? (
                            <img
                              src={entrepriseInfo.logo}
                              alt={`Logo ${entrepriseInfo.nom}`}
                              className="h-10 w-10 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{entrepriseInfo.nom}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.role === 'ADMIN' ? 'Administration' : 'Caisse'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/parametres"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Paramètres</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Déconnexion</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;