import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [primaryColor, setPrimaryColor] = useState('#3B82F6'); // Couleur par défaut
  const [isLoading, setIsLoading] = useState(false);

  // Applique la couleur d'entreprise pour les admins et caissiers
  useEffect(() => {
    if (user && user.entreprise && user.entreprise.couleur && 
        (user.role === 'ADMIN' || user.role === 'CAISSIER')) {
      setPrimaryColor(user.entreprise.couleur);
      applyThemeToDocument(user.entreprise.couleur);
    } else {
      // Couleur par défaut pour les super admins
      setPrimaryColor('#3B82F6');
      applyThemeToDocument('#3B82F6');
    }
  }, [user]);

  // Applique les variables CSS personnalisées
  const applyThemeToDocument = (color) => {
    const root = document.documentElement;
    
    // Convertir hex en RGB pour les variantes
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Définir les variables CSS
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    
    // Variantes plus claires/foncées
    root.style.setProperty('--primary-50', `rgba(${r}, ${g}, ${b}, 0.05)`);
    root.style.setProperty('--primary-100', `rgba(${r}, ${g}, ${b}, 0.1)`);
    root.style.setProperty('--primary-200', `rgba(${r}, ${g}, ${b}, 0.2)`);
    root.style.setProperty('--primary-300', `rgba(${r}, ${g}, ${b}, 0.3)`);
    root.style.setProperty('--primary-500', color);
    root.style.setProperty('--primary-600', darkenColor(color, 0.1));
    root.style.setProperty('--primary-700', darkenColor(color, 0.2));
    root.style.setProperty('--primary-800', darkenColor(color, 0.3));
    root.style.setProperty('--primary-900', darkenColor(color, 0.4));
  };

  // Fonction pour assombrir une couleur
  const darkenColor = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const value = {
    primaryColor,
    setPrimaryColor,
    isLoading,
    applyThemeToDocument
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};