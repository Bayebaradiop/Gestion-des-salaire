import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Composant Modal simplifié qui ne dépend pas de createPortal
 * Cela évite les problèmes potentiels avec ReactDOM et le rendu
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md',
  footer = null
}) => {
  // Empêcher le défilement du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      // Bloquer le scroll
      document.body.classList.add('overflow-hidden');
    } else {
      // Réactiver le scroll
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      // Nettoyage au démontage
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Classes de taille pour la modale
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Ne rien afficher si la modale est fermée
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        // Fermer si on clique sur l'overlay (pas sur le contenu)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => {
          // Empêcher la fermeture en cliquant sur le contenu
          e.stopPropagation();
        }}
      >
          {/* En-tête */}
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors"
              aria-label="Fermer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Corps */}
          <div className="p-6" style={{ pointerEvents: 'auto' }}>
            {children}
          </div>

          {/* Pied de page si fourni */}
          {footer && (
            <div className="flex justify-end space-x-3 rounded-b-lg border-t bg-gray-50 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
    </div>
  );
};

export default Modal;