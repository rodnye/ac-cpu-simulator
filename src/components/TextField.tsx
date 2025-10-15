// components/TextField.tsx
import React from 'react';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  disabled?: boolean;
  error?: string;
  className?: string;
}

const TextField= ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  className = '',
}: TextFieldProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TextField;