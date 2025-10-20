import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    rounded-xl
    font-semibold
    transition-all
    duration-300
    disabled:opacity-50
    disabled:cursor-not-allowed
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    border
    relative
    overflow-hidden
    group
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-cyan-600 to-purple-600 
      hover:from-cyan-500 hover:to-purple-500 
      focus:ring-cyan-500/50 
      border-cyan-500/30 
      active:from-cyan-700 active:to-purple-700
      text-white
      shadow-lg
      hover:shadow-cyan-500/25
    `,
    secondary: `
      bg-gray-800 
      text-gray-200 
      hover:bg-gray-750 
      focus:ring-gray-500/50 
      border-gray-600 
      active:bg-gray-900
      hover:text-white
      shadow-lg
      hover:shadow-gray-500/10
    `,
    danger: `
      bg-gradient-to-r from-rose-600 to-pink-600 
      hover:from-rose-500 hover:to-pink-500 
      focus:ring-rose-500/50 
      border-rose-500/30 
      active:from-rose-700 active:to-pink-700
      text-white
      shadow-lg
      hover:shadow-rose-500/25
    `,
    ghost: `
      bg-transparent 
      text-gray-400 
      hover:text-white 
      hover:bg-gray-800/50 
      focus:ring-gray-500/50 
      border-gray-700 
      active:bg-gray-800
      shadow-none
      hover:shadow-none
    `,
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.98, y: 0 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        ${loading ? "cursor-wait" : ""}
      `}
    >
      {/* Animated Background Shine */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"
        initial={{ x: "-100%" }}
        whileHover={!isDisabled ? { x: "100%" } : {}}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
      />

      {/* Loading Spinner */}
      {loading && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
        >
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      )}

      {/* Button Content */}
      <motion.span
        className="flex items-center gap-2 relative z-10"
        animate={{
          opacity: loading ? 0 : 1,
          scale: loading ? 0.8 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}

        {/* Subtle arrow animation on hover */}
        <motion.span
          initial={{ x: 0, opacity: 0 }}
          whileHover={{ x: 2, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          {variant === "primary" && "→"}
        </motion.span>
      </motion.span>

      {/* Ripple Effect Container */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <motion.span
          className="absolute bg-white/20 rounded-full transform scale-0"
          whileTap={{ scale: 2 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        />
      </div>

      {/* Pulse animation for active states */}
      <motion.div
        className={`absolute inset-0 rounded-xl border-2 ${
          variant === "primary"
            ? "border-cyan-400/30"
            : variant === "secondary"
              ? "border-gray-500/30"
              : variant === "danger"
                ? "border-rose-400/30"
                : "border-gray-600/30"
        }`}
        animate={{
          opacity: [0, 0.5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
};

export default Button;
