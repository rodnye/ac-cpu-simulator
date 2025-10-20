import { Handle, Position, type HandleProps, type Node } from "@xyflow/react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface IComputerNodeData extends Node {
  data: {
    status: "active" | "idle" | "error" | "success";
    statusText: string;
    Component: () => ReactNode;
    statusPosition?: "top" | "right" | "bottom" | "left";
  };
}

const TransparentHandler = (props: HandleProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.2 }}
      transition={{ duration: 0.2 }}
    >
      <Handle 
        {...props} 
        className="!bg-transparent !border-0 hover:!border-cyan-400/50 hover:!border-2 transition-all duration-200" 
      />
    </motion.div>
  );
};

export const ComputerNode = ({
  data: {
    Component,
    status,
    statusText = "Default",
    statusPosition = "bottom",
  },
}: {
  data: IComputerNodeData["data"];
}) => {
  const getPositionClasses = () => {
    const baseClasses =
      "absolute px-3 py-2 rounded-xl text-xs font-bold text-white backdrop-blur-sm border shadow-lg z-10 ";
    const animationClass = ""; // Removemos animate-pulse para usar Framer Motion

    switch (statusPosition) {
      case "top":
        return `${baseClasses} top-0 left-1/2 transform -translate-x-1/2 -translate-y-full ${animationClass}`;
      case "right":
        return `${baseClasses} right-0 top-1/2 transform translate-x-full -translate-y-1/2 ${animationClass}`;
      case "bottom":
        return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full ${animationClass}`;
      case "left":
        return `${baseClasses} left-0 top-1/2 transform -translate-x-full -translate-y-1/2 ${animationClass}`;
      default:
        return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full ${animationClass}`;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-orange-500 to-amber-500 border-orange-400/30 shadow-orange-500/20";
      case "error":
        return "bg-gradient-to-r from-red-600 to-pink-600 border-red-400/30 shadow-red-500/20";
      case "idle":
        return "bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500/30 shadow-gray-500/20";
      case "success":
        return "bg-gradient-to-r from-green-600 to-emerald-500 border-green-400/30 shadow-green-500/20";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500/30";
    }
  };

  const getStatusGlow = () => {
    switch (status) {
      case "active":
        return "shadow-[0_0_20px_rgba(255,140,0,0.3)]";
      case "error":
        return "shadow-[0_0_20px_rgba(239,68,68,0.3)]";
      case "success":
        return "shadow-[0_0_20px_rgba(34,197,94,0.3)]";
      default:
        return "shadow-[0_0_15px_rgba(156,163,175,0.2)]";
    }
  };

  const getPulseAnimation = () => {
    if (status === "active") {
      return {
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0 0 rgba(255, 140, 0, 0.7)",
          "0 0 0 10px rgba(255, 140, 0, 0)",
          "0 0 0 0 rgba(255, 140, 0, 0)"
        ]
      };
    }
    return {};
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="relative p-4 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-400/30 transition-all duration-300 group"
    >
      {/* Glow effect based on status */}
      <motion.div
        className={`absolute inset-0 rounded-2xl ${getStatusGlow()} opacity-70`}
        animate={getPulseAnimation()}
        transition={{
          duration: status === "active" ? 2 : 0,
          repeat: status === "active" ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Main content container */}
      <div className="relative z-0">
        <Component />
      </div>

      {/* Animated status indicator */}
      <AnimatePresence>
        {statusText && status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${getPositionClasses()} ${getStatusColor()}`}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  status === "active" ? "bg-white animate-pulse" : "bg-white"
                }`}
                animate={{
                  scale: status === "active" ? [1, 1.5, 1] : 1,
                }}
                transition={{
                  duration: status === "active" ? 1 : 0,
                  repeat: status === "active" ? Infinity : 0,
                }}
              />
              <span className="text-white font-semibold drop-shadow-sm">
                {statusText}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Handles with better visibility */}
      <TransparentHandler type="source" position={Position.Top} id="top" />
      <TransparentHandler type="source" position={Position.Right} id="right" />
      <TransparentHandler type="source" position={Position.Left} id="left" />
      <TransparentHandler type="target" position={Position.Bottom} id="bottom" />
      <TransparentHandler type="target" position={Position.Left} id="left" />

      {/* Subtle background pattern */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Status border animation */}
      <motion.div
        className={`absolute inset-0 rounded-2xl border-2 pointer-events-none ${
          status === "active" ? "border-orange-400/40" :
          status === "success" ? "border-green-400/40" :
          status === "error" ? "border-red-400/40" :
          "border-transparent"
        }`}
        animate={{
          opacity: status !== "idle" ? [0.3, 0.7, 0.3] : 0.3,
        }}
        transition={{
          duration: status !== "idle" ? 2 : 0,
          repeat: status !== "idle" ? Infinity : 0,
        }}
      />
    </motion.div>
  );
};