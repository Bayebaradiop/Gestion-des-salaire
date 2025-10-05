import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Composant Toggle Switch moderne pour activer/désactiver l'accès Super-Admin
 */
const ToggleSwitch = ({ 
  enabled = false, 
  onChange, 
  disabled = false, 
  loading = false,
  label = "Accès Super-Admin",
  enabledText = "Autorisé",
  disabledText = "Bloqué"
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!disabled && !loading && onChange) {
      onChange(!enabled);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-gray-900">{label}</span>
        <span className={`text-sm font-medium ${
          enabled 
            ? 'text-emerald-600' 
            : 'text-rose-600'
        }`}>
          {enabled ? `✅ ${enabledText}` : `❌ ${disabledText}`}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Indicateur de statut textuel */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          enabled 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-rose-100 text-rose-700 border border-rose-200'
        }`}>
          {enabled ? enabledText : disabledText}
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={handleClick}
          disabled={disabled || loading}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out
            ${enabled 
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' 
              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
            }
            ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-md hover:shadow-lg'}
            ${isHovered ? 'scale-105' : 'scale-100'}
          `}
        >
          <motion.span
            className={`
              inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300
              ${loading ? 'animate-pulse' : ''}
            `}
            animate={{
              x: enabled ? 28 : 4,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.span>
        </button>
      </div>
    </div>
  );
};

export default ToggleSwitch;