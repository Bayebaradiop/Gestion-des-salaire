import React from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';

const cardVariants = cva(
  "relative overflow-hidden backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        glass: "bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/50",
        gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700",
        premium: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800",
        success: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800",
        warning: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800",
        danger: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800"
      },
      size: {
        sm: "p-4 rounded-lg",
        default: "p-6 rounded-xl",
        lg: "p-8 rounded-2xl"
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        default: "shadow-md shadow-gray-900/5",
        lg: "shadow-lg shadow-gray-900/10",
        xl: "shadow-xl shadow-gray-900/20"
      },
      hover: {
        none: "",
        lift: "hover:shadow-xl hover:-translate-y-1",
        glow: "hover:shadow-2xl hover:shadow-purple-500/20",
        scale: "hover:scale-105"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "default",
      hover: "none"
    }
  }
);

const PremiumCard = ({ 
  children, 
  variant, 
  size, 
  shadow, 
  hover, 
  className = "",
  glowEffect = false,
  animateOnHover = true,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={animateOnHover ? { 
        scale: hover === 'scale' ? 1.05 : 1,
        y: hover === 'lift' ? -4 : 0,
        transition: { duration: 0.2 }
      } : {}}
      className={`${cardVariants({ variant, size, shadow, hover })} ${className}`}
      {...props}
    >
      {/* Effet de lueur pour les cartes premium */}
      {glowEffect && (
        <motion.div
          animate={{ 
            opacity: [0, 0.3, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl blur-xl -z-10"
        />
      )}
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Effet de brillance au survol */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
      />
    </motion.div>
  );
};

// Composants spécialisés
const StatsCard = ({ title, value, change, icon, trend = 'up', className = "" }) => {
  const trendColors = {
    up: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    down: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    neutral: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
  };

  return (
    <PremiumCard variant="glass" hover="lift" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {value}
          </p>
          {change && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
              <motion.span
                animate={{ y: trend === 'up' ? [-1, 1, -1] : trend === 'down' ? [1, -1, 1] : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </motion.span>
              <span className="ml-1">{change}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-lg"
          >
            {React.createElement(icon, { size: 24 })}
          </motion.div>
        )}
      </div>
    </PremiumCard>
  );
};

const FeatureCard = ({ title, description, icon, action, className = "" }) => {
  return (
    <PremiumCard 
      variant="gradient" 
      hover="lift" 
      className={`group cursor-pointer ${className}`}
      onClick={action}
      animateOnHover={true}
    >
      <div className="text-center space-y-4">
        {icon && (
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/25 transition-shadow duration-300"
          >
            {React.createElement(icon, { size: 32 })}
          </motion.div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Flèche d'action */}
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: 5 }}
          className="flex justify-center"
        >
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </motion.div>
      </div>
    </PremiumCard>
  );
};

const NotificationCard = ({ title, message, time, type = 'info', onClose, className = "" }) => {
  const typeStyles = {
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20',
    success: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20',
    warning: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20',
    error: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`relative p-4 rounded-xl border backdrop-blur-sm ${typeStyles[type]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {message}
          </p>
          {time && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {time}
            </p>
          )}
        </div>
        
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="ml-4 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export { PremiumCard, StatsCard, FeatureCard, NotificationCard };
export default PremiumCard;