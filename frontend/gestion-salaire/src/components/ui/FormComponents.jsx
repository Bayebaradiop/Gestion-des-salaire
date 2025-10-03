import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, X, AlertCircle, Search, Calendar, ChevronDown } from 'lucide-react';

/**
 * 📝 INPUT FIELD - Champ de saisie premium avec validation
 */
export const InputField = ({ 
  label, 
  error, 
  icon: Icon, 
  type = 'text',
  helperText,
  required = false,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={inputType}
          className={`
            w-full px-4 py-4 rounded-xl
            font-semibold text-base
            ${Icon ? 'pl-12' : ''}
            ${type === 'password' ? 'pr-12' : ''}
            border-2 transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100' 
              : focused
              ? 'border-indigo-600 focus:border-indigo-700 focus:ring-4 focus:ring-indigo-500/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50'
            }
            placeholder:text-gray-500 dark:placeholder:text-gray-400
            placeholder:font-normal
            focus:outline-none focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900
            shadow-sm hover:shadow-md focus:shadow-lg
            ${className}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2.5 text-base text-red-700 dark:text-red-300 font-semibold bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-600"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {helperText && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 📋 SELECT FIELD - Menu déroulant premium
 */
export const SelectField = ({ 
  label, 
  error, 
  icon: Icon,
  options = [],
  placeholder = 'Sélectionner...',
  required = false,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <select
          className={`
            w-full px-4 py-4 rounded-xl font-semibold text-base appearance-none cursor-pointer
            ${Icon ? 'pl-12' : ''}
            pr-12
            border-2 transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100' 
              : focused
              ? 'border-indigo-600 focus:border-indigo-700 focus:ring-4 focus:ring-indigo-500/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50'
            }
            focus:outline-none focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md focus:shadow-lg
            ${className}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

/**
 * 📝 TEXTAREA FIELD - Zone de texte premium
 */
export const TextareaField = ({ 
  label, 
  error, 
  helperText,
  required = false,
  rows = 4,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-4 rounded-xl font-semibold text-base resize-none leading-relaxed
          border-2 transition-all duration-200
          ${error 
            ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100' 
            : focused
            ? 'border-indigo-600 focus:border-indigo-700 focus:ring-4 focus:ring-indigo-500/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50'
          }
          placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:font-normal
          focus:outline-none focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md focus:shadow-lg
          ${className}
        `}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

/**
 * ☑️ CHECKBOX FIELD - Case à cocher premium
 */
export const CheckboxField = ({ 
  label, 
  description,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg transition-all duration-200 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-500/20 group-hover:border-indigo-400">
            <Check className="w-full h-full p-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex-1">
          <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {label}
          </span>
          {description && (
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      </label>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

/**
 * 🔘 RADIO GROUP - Groupe de boutons radio premium
 */
export const RadioGroup = ({ 
  label, 
  options = [],
  value,
  onChange,
  error,
  required = false,
  className = ''
}) => {
  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`space-y-2 ${className}`}>
        {options.map((option, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="peer sr-only"
              />
              <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 rounded-full transition-all duration-200 peer-checked:border-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-500/20 group-hover:border-indigo-400">
                <div className="w-full h-full p-1">
                  <div className="w-full h-full rounded-full bg-indigo-600 opacity-0 peer-checked:opacity-100 transition-opacity scale-0 peer-checked:scale-100" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

/**
 * 🔍 SEARCH INPUT - Champ de recherche premium
 */
export const SearchInput = ({ 
  placeholder = 'Rechercher...', 
  onSearch,
  className = '',
  ...props 
}) => {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onSearch) {
      onSearch(newValue);
    }
  };
  
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
          w-full pl-12 pr-4 py-3.5 rounded-xl font-medium
          border-2 transition-all duration-200
          ${focused
            ? 'border-indigo-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-gray-900'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900'
          }
          text-gray-900 dark:text-gray-100
          placeholder-gray-400
          focus:outline-none
          ${className}
        `}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {value && (
        <button
          onClick={() => {
            setValue('');
            if (onSearch) onSearch('');
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

/**
 * 📅 DATE PICKER - Sélecteur de date premium
 */
export const DatePicker = ({ 
  label, 
  error, 
  required = false,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
        <input
          type="date"
          className={`
            w-full pl-12 pr-4 py-3.5 rounded-xl font-medium
            border-2 transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10' 
              : focused
              ? 'border-indigo-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-gray-900'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900'
            }
            text-gray-900 dark:text-gray-100
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};

/**
 * 💰 CURRENCY INPUT - Champ de saisie de montant
 */
export const CurrencyInput = ({ 
  label, 
  error, 
  currency = 'XOF',
  required = false,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          className={`
            w-full pl-4 pr-16 py-3.5 rounded-xl font-medium
            border-2 transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10' 
              : focused
              ? 'border-indigo-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-gray-900'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900'
            }
            text-gray-900 dark:text-gray-100
            placeholder-gray-400
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 dark:text-gray-400">
          {currency}
        </div>
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};
