import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, onClick, type = 'button', ...props }) => {
  const { primaryColor } = useTheme();

  const getButtonStyles = () => {
    const baseStyles = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantStyles = {
      primary: {
        backgroundColor: primaryColor,
        color: 'white',
        border: `1px solid ${primaryColor}`,
      },
      secondary: {
        backgroundColor: 'white',
        color: primaryColor,
        border: `1px solid ${primaryColor}`,
      },
      outline: {
        backgroundColor: 'transparent',
        color: primaryColor,
        border: `1px solid ${primaryColor}`,
      },
      danger: {
        backgroundColor: '#ef4444',
        color: 'white',
        border: '1px solid #ef4444',
      },
      success: {
        backgroundColor: '#22c55e',
        color: 'white',
        border: '1px solid #22c55e',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: primaryColor,
        border: 'none',
      }
    };

    return {
      className: `${baseStyles} ${sizeStyles[size]} ${className}`,
      style: variantStyles[variant] || variantStyles.primary
    };
  };

  const handleMouseOver = (e) => {
    if (disabled) return;
    
    const originalBg = e.target.style.backgroundColor;
    const originalColor = e.target.style.color;
    
    switch (variant) {
      case 'primary':
        e.target.style.backgroundColor = darkenColor(primaryColor, 0.1);
        break;
      case 'secondary':
      case 'outline':
        e.target.style.backgroundColor = `${primaryColor}15`;
        break;
      case 'ghost':
        e.target.style.backgroundColor = `${primaryColor}10`;
        break;
    }
  };

  const handleMouseOut = (e) => {
    if (disabled) return;
    
    const styles = getButtonStyles();
    e.target.style.backgroundColor = styles.style.backgroundColor;
    e.target.style.color = styles.style.color;
  };

  const darkenColor = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const buttonStyles = getButtonStyles();

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonStyles.className}
      style={buttonStyles.style}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;