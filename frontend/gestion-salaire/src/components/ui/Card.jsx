import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title,
  actions,
  padding = true,
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200
        ${className}
      `} 
      {...props}
    >
      {title && (
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;