// components/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 
        bg-black text-white 
        rounded-lg
        hover:bg-gray-800 
        active:scale-95
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:transform-none
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;