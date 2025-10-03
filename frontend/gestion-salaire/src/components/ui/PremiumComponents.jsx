import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🎨 BUTTON COMPONENT - Système de design premium
 * Variants: primary, secondary, outline, ghost, danger
 * Sizes: sm, md, lg, xl
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/50 focus:ring-indigo-500/50 border-2 border-transparent',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600 focus:ring-gray-500/50 border-2 border-gray-300 dark:border-gray-600 shadow-md',
    outline: 'border-2 border-indigo-600 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:ring-indigo-500/50 shadow-md hover:shadow-lg font-extrabold',
    ghost: 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500/50 font-semibold',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50 focus:ring-red-500/50 border-2 border-transparent',
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/50 focus:ring-emerald-500/50 border-2 border-transparent',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-5 py-3 text-base gap-2.5',
    lg: 'px-7 py-4 text-lg gap-3',
    xl: 'px-9 py-5 text-xl gap-3.5',
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
};

/**
 * 🎨 CARD COMPONENT - Cartes premium avec glassmorphism
 */
export const Card = ({ 
  children, 
  variant = 'default',
  hover = false,
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-md',
    glass: 'glass-effect border-2 border-white/20 dark:border-gray-700/50',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-md',
  };
  
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' } : {}}
      className={`
        rounded-2xl overflow-hidden transition-all duration-300
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * 🎨 INPUT COMPONENT - Champs de saisie modernes
 */
export const Input = ({ 
  label, 
  error, 
  icon, 
  helperText,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-xl
            ${icon ? 'pl-12' : ''}
            border-2 transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20' 
              : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
            }
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            placeholder-gray-400
            focus:outline-none
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

/**
 * 🎨 BADGE COMPONENT - Badges colorés
 */
export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon,
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {icon && icon}
      {children}
    </span>
  );
};

/**
 * 🎨 STAT CARD - Cartes de statistiques animées
 */
export const StatCard = ({ 
  title, 
  value, 
  change, 
  trend = 'up', 
  icon,
  color = 'indigo' 
}) => {
  const colorClasses = {
    indigo: 'from-indigo-500 to-purple-600',
    emerald: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
    cyan: 'from-cyan-500 to-blue-600',
  };
  
  return (
    <Card variant="gradient" hover>
      <div className="p-7">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-none">
              {value}
            </h3>
          </div>
          {icon && (
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className={`p-4 bg-gradient-to-br ${colorClasses[color]} rounded-2xl shadow-xl flex-shrink-0 ml-4`}
            >
              <div className="text-white">
                {icon}
              </div>
            </motion.div>
          )}
        </div>
        {change && (
          <div className={`flex items-center gap-2 text-base font-bold ${
            trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 
            trend === 'down' ? 'text-red-600 dark:text-red-400' : 
            'text-gray-700 dark:text-gray-300'
          }`}>
            {trend === 'up' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {trend === 'down' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-extrabold">{change}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * 🎨 ALERT COMPONENT - Alertes modernes
 */
export const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const types = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-800 dark:text-blue-200',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-800 dark:text-emerald-200',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-800 dark:text-amber-200',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200',
    },
  };
  
  const config = types[type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl border-2
        ${config.bg}
        ${className}
      `}
    >
      <div className={`flex-shrink-0 ${config.icon}`}>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold mb-1 ${config.text}`}>{title}</h4>
        )}
        <p className={`text-sm ${config.text}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${config.icon} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};
