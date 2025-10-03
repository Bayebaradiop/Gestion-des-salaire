import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Monitor,
  LogOut,
  ChevronDown,
  Crown,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const PremiumHeader = ({ onToggleSidebar, sidebarOpen }) => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications] = useState([
    { id: 1, title: 'Nouveau employé ajouté', message: 'Jean Dupont a été ajouté avec succès', time: '2 min', unread: true },
    { id: 2, title: 'Paiement traité', message: 'Salaires de décembre traités', time: '1h', unread: true },
    { id: 3, title: 'Rapport généré', message: 'Rapport mensuel disponible', time: '3h', unread: false },
  ]);
  
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Fermer les menus en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Recherche:', searchQuery);
  };

  const themeOptions = [
    { id: 'light', label: 'Clair', icon: Sun },
    { id: 'dark', label: 'Sombre', icon: Moon },
    { id: 'system', label: 'Système', icon: Monitor },
  ];

  const currentThemeOption = themeOptions.find(option => option.id === theme);
  const CurrentThemeIcon = currentThemeOption?.icon || Monitor;

  const user = { nom: 'Admin', email: 'admin@example.com', isPremium: true };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm shadow-gray-900/5"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent" />
        
        <div className="relative flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Section gauche */}
          <div className="flex items-center space-x-4">
            {/* Bouton menu mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-600 dark:text-gray-400"
            >
              <AnimatePresence mode="wait">
                {sidebarOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Logo et titre */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md -z-10"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Gestion Salaire
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Premium Edition</p>
              </div>
            </motion.div>
          </div>

          {/* Section centre - Recherche */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block flex-1 max-w-lg mx-8"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher employés, paiements..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </form>
          </motion.div>

          {/* Section droite */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-2"
          >
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-600 dark:text-gray-400"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Menu notifications */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-200 dark:border-gray-700 backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} nouvelles</p>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer ${notification.unread ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            {notification.unread && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sélecteur de thème */}
            <div className="relative" ref={themeMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-600 dark:text-gray-400"
              >
                <CurrentThemeIcon className="h-5 w-5" />
              </motion.button>

              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-200 dark:border-gray-700 backdrop-blur-xl py-2"
                  >
                    {themeOptions.map((option, index) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            setTheme(option.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${theme === option.id ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{option.label}</span>
                          {theme === option.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto w-2 h-2 bg-purple-500 rounded-full"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu utilisateur */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  {user?.isPremium && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.nom || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.isPremium ? 'Premium' : 'Utilisateur'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-200 dark:border-gray-700 backdrop-blur-xl py-2"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user?.nom || 'Utilisateur'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email || 'user@example.com'}
                      </p>
                      {user?.isPremium && (
                        <div className="mt-2 flex items-center space-x-1">
                          <Crown className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                            Compte Premium
                          </span>
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm">Profil</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Paramètres</span>
                    </motion.button>

                    {!user?.isPremium && (
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 text-purple-600 dark:text-purple-400"
                      >
                        <Crown className="h-4 w-4" />
                        <span className="text-sm font-medium">Passer à Premium</span>
                        <Sparkles className="h-3 w-3 ml-auto" />
                      </motion.button>
                    )}

                    <hr className="my-2 border-gray-200 dark:border-gray-700" />

                    <motion.button
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Se déconnecter</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default PremiumHeader;