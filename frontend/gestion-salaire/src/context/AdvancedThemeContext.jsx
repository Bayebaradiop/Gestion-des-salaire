import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Détecter la préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Détecter la préférence pour les animations réduites
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    setAnimations(!mediaQuery.matches);

    const handleChange = (e) => {
      setReducedMotion(e.matches);
      setAnimations(!e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Appliquer le thème au document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Appliquer la couleur primaire personnalisée
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    
    // Calculer les variantes de couleur
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Générer automatiquement une palette complète
    const hsl = rgbToHsl(r, g, b);
    
    for (let i = 50; i <= 950; i += i < 100 ? 50 : 100) {
      const lightness = i === 50 ? 97 : i === 100 ? 94 : i === 200 ? 86 : i === 300 ? 77 : 
                       i === 400 ? 65 : i === 500 ? 53 : i === 600 ? 42 : i === 700 ? 33 : 
                       i === 800 ? 24 : i === 900 ? 15 : 6;
      
      const [nr, ng, nb] = hslToRgb(hsl[0], hsl[1], lightness / 100);
      const color = `#${Math.round(nr).toString(16).padStart(2, '0')}${Math.round(ng).toString(16).padStart(2, '0')}${Math.round(nb).toString(16).padStart(2, '0')}`;
      
      root.style.setProperty(`--primary-${i}`, color);
    }
  }, [theme, primaryColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setCustomTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const toggleAnimations = () => {
    setAnimations(prev => !prev);
  };

  const value = {
    theme,
    setTheme: setCustomTheme,
    toggleTheme,
    primaryColor,
    setPrimaryColor,
    animations,
    setAnimations,
    toggleAnimations,
    reducedMotion,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Utilitaires de conversion de couleur
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    return [r * 255, g * 255, b * 255];
  }
}