interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "password" | "email" | "number";
  disabled?: boolean;
  error?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

const TextField = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  error,
  className = "",
  multiline = false,
  rows = 3,
}: TextFieldProps) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange?.(e.target.value);
  };

  // For multiline inputs, preserve line breaks in display
  const displayValue = multiline && value ? value.replace(/\n/g, "\n") : value;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {multiline ? (
        <textarea
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent
            whitespace-pre-wrap resize-y
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : "bg-white"}
          `}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : "bg-white"}
          `}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 whitespace-pre-wrap">{error}</p>
      )}
    </div>
  );
};

export default TextField;
