import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumHeader from './PremiumHeader';
import { NotificationProvider } from '../context/NotificationContext';
import { ThemeProvider } from '../context/AdvancedThemeContext';

const PremiumLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Overlay pour mobile */}
          <AnimatePresence>
            {isMobile && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Contenu principal */}
          <div className="transition-all duration-300 ease-in-out">
            {/* Header */}
            <PremiumHeader 
              onToggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
            />

            {/* Contenu de la page */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Effet de dégradé subtil en arrière-plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-pink-50/30 dark:from-purple-900/10 dark:via-transparent dark:to-pink-900/10 pointer-events-none" />
                
                {/* Contenu */}
                <div className="relative">
                  {children}
                </div>
              </div>
            </motion.main>

            {/* Footer premium */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">GS</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Gestion Salaire Premium
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Version 2.0 - Édition Premium
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <motion.a
                      whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                      href="#"
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      Support
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                      href="#"
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      Documentation
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.05, color: '#8b5cf6' }}
                      href="#"
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      Confidentialité
                    </motion.a>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    © 2024 Tous droits réservés
                  </div>
                </div>
              </div>

              {/* Effet de gradient en bas */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            </motion.footer>
          </div>

          {/* Bouton de retour en haut (scroll to top) */}
          <ScrollToTop />
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
};

// Composant pour le bouton de retour en haut
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="
            fixed bottom-8 right-8 z-40
            w-12 h-12 rounded-full 
            bg-gradient-to-r from-purple-500 to-pink-500
            shadow-lg shadow-purple-500/25
            flex items-center justify-center
            text-white hover:shadow-xl hover:shadow-purple-500/40
            transition-all duration-300
          "
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default PremiumLayout;