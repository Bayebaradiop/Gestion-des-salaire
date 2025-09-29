import React from 'react';

/**
 * Composant Button ultra-simple pour éviter tout problème d'événements
 */
const SimpleButton = ({ 
  children, 
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props 
}) => {
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && onClick) {
      console.log('SimpleButton clicked');
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      disabled={disabled}
      className={`
        px-4 py-2 rounded font-medium cursor-pointer transition-colors
        ${variantStyles[variant] || variantStyles.primary}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default SimpleButton;