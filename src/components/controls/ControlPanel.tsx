// ControlPanel.tsx - Versión simplificada
import { motion } from "framer-motion";

interface ControlPanelProps {
  currentStep?: number;
  totalSteps?: number;
}

export function ControlPanel({
  currentStep = 0,
  totalSteps = 0,
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-900/95 group"
    >
      {/* Progress Indicator */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-center">
          <motion.div
            key={`${currentStep}-${totalSteps}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-cyan-400"
          >
            {currentStep} / {totalSteps}
          </motion.div>
          <div className="text-sm text-gray-400 mt-1">Progreso de pasos</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width:
                totalSteps > 0 ? `${(currentStep / totalSteps) * 100}%` : "0%",
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Subtle background animation */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
