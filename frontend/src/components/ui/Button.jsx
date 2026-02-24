import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = "", 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-brand-primary hover:bg-brand-secondary text-white shadow-lg shadow-orange-100",
    secondary: "bg-orange-50 text-brand-primary hover:bg-orange-100",
    outline: "border-2 border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-hb"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};