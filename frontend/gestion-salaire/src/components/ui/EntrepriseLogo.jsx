import React from 'react';

const EntrepriseLogo = ({ 
  entreprise, 
  size = 'md', 
  className = '', 
  showFallback = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const getSrc = (logo) => {
    if (!logo) return null;
    
    // Si c'est un chemin relatif, ajouter l'URL de base
    if (logo.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${logo}`;
    }
    
    // Sinon, utiliser tel quel (URL complète ou base64)
    return logo;
  };

  const handleImageError = (e) => {
    if (showFallback) {
      e.target.style.display = 'none';
      const fallback = e.target.nextSibling;
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {entreprise.logo && (
        <img
          src={getSrc(entreprise.logo)}
          alt={`Logo ${entreprise.nom}`}
          className={`${sizeClasses[size]} rounded-lg object-cover border`}
          onError={handleImageError}
        />
      )}
      
      {/* Fallback - affiché si pas de logo ou en cas d'erreur */}
      <div 
        className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${entreprise.logo ? 'hidden' : ''}`}
        style={entreprise.logo ? { display: 'none' } : {}}
      >
        <span className={`text-white font-bold ${textSizeClasses[size]}`}>
          {entreprise.nom?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>
    </div>
  );
};

export default EntrepriseLogo;