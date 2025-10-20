interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const baseClasses = `
    inline-flex items-center
    rounded-lg
    font-medium
    transition-all
    duration-200
    disabled:opacity-50
    disabled:cursor-not-allowed
    focus:outline-none
    focus:ring-2
    focus:ring-offset-1
    border
  `;

  const variantClasses = {
    primary:
      "bg-slate-700 text-white hover:bg-slate-800 focus:ring-slate-500 border-slate-600 active:bg-slate-900",
    secondary:
      "bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300 border-slate-300 active:bg-slate-100",
    danger:
      "bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-500 border-rose-600 active:bg-rose-900",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
