import React from 'react';
import { CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

/**
 * Badge de statut de pointage avec icône et couleurs
 * @param {Object} props
 * @param {string} props.statut - PRESENT, RETARD, ABSENT, HEURES_SUP, CONGE, MALADIE
 * @param {number} props.retardMinutes - Minutes de retard (optionnel)
 * @param {number} props.heuresSupMinutes - Minutes d'heures sup (optionnel)
 * @param {string} props.size - 'sm', 'md', 'lg'
 * @returns {JSX.Element}
 */
const StatutBadge = ({ 
  statut, 
  retardMinutes = 0, 
  heuresSupMinutes = 0, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const configs = {
    PRESENT: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      border: 'border-emerald-600',
      icon: CheckCircle2,
      label: 'Présent',
      emoji: '✅'
    },
    RETARD: {
      bg: 'bg-amber-500',
      text: 'text-white',
      border: 'border-amber-600',
      icon: Clock,
      label: retardMinutes > 0 ? `Retard (${retardMinutes}min)` : 'Retard',
      emoji: '⚠️'
    },
    ABSENT: {
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-600',
      icon: XCircle,
      label: 'Absent',
      emoji: '❌'
    },
    HEURES_SUP: {
      bg: 'bg-blue-500',
      text: 'text-white',
      border: 'border-blue-600',
      icon: TrendingUp,
      label: heuresSupMinutes > 0 ? 
        `Heures sup (${Math.floor(heuresSupMinutes / 60)}h${(heuresSupMinutes % 60).toString().padStart(2, '0')})` : 
        'Heures sup',
      emoji: '🔵'
    },
    CONGE: {
      bg: 'bg-sky-500',
      text: 'text-white',
      border: 'border-sky-600',
      icon: Calendar,
      label: 'Congé',
      emoji: '🏖️'
    },
    MALADIE: {
      bg: 'bg-violet-500',
      text: 'text-white',
      border: 'border-violet-600',
      icon: AlertTriangle,
      label: 'Maladie',
      emoji: '🤒'
    }
  };

  const config = configs[statut] || configs.PRESENT;
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-semibold rounded-full border
      ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border}
    `}>
      <Icon className={iconSize[size]} />
      <span>{config.label}</span>
    </span>
  );
};

/**
 * Badge simple avec emoji (version allégée)
 */
export const StatutEmoji = ({ statut, retardMinutes = 0, heuresSupMinutes = 0 }) => {
  const configs = {
    PRESENT: '✅ Présent',
    RETARD: `⚠️ Retard${retardMinutes > 0 ? ` (${retardMinutes}min)` : ''}`,
    ABSENT: '❌ Absent',
    HEURES_SUP: `🔵 Heures sup${heuresSupMinutes > 0 ? ` (${Math.floor(heuresSupMinutes / 60)}h${(heuresSupMinutes % 60).toString().padStart(2, '0')})` : ''}`,
    CONGE: '🏖️ Congé',
    MALADIE: '🤒 Maladie'
  };

  return (
    <span className="text-sm font-medium">
      {configs[statut] || configs.PRESENT}
    </span>
  );
};

export default StatutBadge;