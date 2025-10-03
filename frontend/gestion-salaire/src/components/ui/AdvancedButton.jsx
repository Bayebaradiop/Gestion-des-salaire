import React, { forwardRef } from 'react';
import { useTheme } from '../../context/AdvancedThemeContext';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white shadow hover:bg-primary-700 focus-visible:ring-primary-500",
        destructive: "bg-red-600 text-white shadow hover:bg-red-700 focus-visible:ring-red-500",
        outline: "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-primary-500",
        secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-500",
        ghost: "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
        link: "text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500",
        gradient: "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:from-primary-700 hover:to-primary-800 transform hover:scale-105",
        glass: "backdrop-blur-md bg-white/20 border border-white/30 text-gray-800 shadow-xl hover:bg-white/30",
        neon: "bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:shadow-xl border border-primary-500/20"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12"
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "hover:animate-bounce",
        spin: "hover:animate-spin",
        scale: "hover:scale-105 active:scale-95",
        slide: "hover:translate-x-1",
        glow: "hover:shadow-lg hover:shadow-primary-500/25"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "scale"
    }
  }
);

const Button = forwardRef(({
  className,
  variant,
  size,
  animation,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}, ref) => {
  const { animations } = useTheme();

  return (
    <button
      className={cn(
        buttonVariants({ 
          variant, 
          size, 
          animation: animations ? animation : "none" 
        }),
        loading && "cursor-not-allowed",
        className
      )}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {/* Effet de brillance pour les boutons gradient */}
      {variant === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}
      
      {/* Icône de gauche */}
      {leftIcon && !loading && (
        <span className="mr-2 flex-shrink-0">
          {leftIcon}
        </span>
      )}
      
      {/* Spinner de chargement */}
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      
      {/* Contenu du bouton */}
      <span className="flex items-center">
        {children}
      </span>
      
      {/* Icône de droite */}
      {rightIcon && !loading && (
        <span className="ml-2 flex-shrink-0">
          {rightIcon}
        </span>
      )}
      
      {/* Effet de ripple au clic */}
      <span className="absolute inset-0 rounded-md bg-white/20 opacity-0 group-active:opacity-100 group-active:animate-ping pointer-events-none" />
    </button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };