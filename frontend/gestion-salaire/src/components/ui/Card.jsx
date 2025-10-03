import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Card = ({ 
  children, 
  className = '', 
  title,
  actions,
  padding = true,
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    gradient: 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-2 border-gray-200 dark:border-gray-800 shadow-lg'
  };

  return (
    <div 
      className={`
        rounded-2xl ${variants[variant]}
        ${className}
      `} 
      {...props}
    >
      {title && (
        <div className="border-b-2 border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="font-extrabold text-xl text-gray-900 dark:text-white">{title}</h2>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export const StatCard = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral',
  icon, 
  color = 'indigo',
  className = '' 
}) => {
  const colors = {
    indigo: {
      bg: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: 'bg-indigo-600',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    emerald: {
      bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: 'bg-emerald-600',
      text: 'text-emerald-600 dark:text-emerald-400'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'bg-purple-600',
      text: 'text-purple-600 dark:text-purple-400'
    },
    amber: {
      bg: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'bg-amber-600',
      text: 'text-amber-600 dark:text-amber-400'
    }
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    neutral: <Minus className="w-4 h-4" />
  };

  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  const colorScheme = colors[color] || colors.indigo;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`p-7 bg-gradient-to-br ${colorScheme.bg} rounded-2xl border-2 ${colorScheme.border} shadow-md hover:shadow-xl transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-4 ${colorScheme.icon} rounded-xl shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm font-bold ${trendColors[trend]}`}>
          {trendIcons[trend]}
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    primary: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
  };

  return (
    <span className={`inline-flex px-3 py-1.5 text-sm font-extrabold rounded-lg border-2 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Card;