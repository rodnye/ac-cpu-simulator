import Button from "../atoms/Button";
import { NextIcon } from "../atoms/Icon";
import { motion, AnimatePresence } from "framer-motion";

interface ControlPanelProps {
  onNext: () => void;
  onStop: () => void;
  onReset: () => void;
  isRunning?: boolean;
  hasNext?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export function ControlPanel({
  onNext,
  //onStop,
  //onReset,
  isRunning,
  hasNext,
  currentStep = 0,
  totalSteps = 0,
}: ControlPanelProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-900/95 group"
    >
      {/* Progress Bar */}
      <AnimatePresence>
        {totalSteps > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 font-medium">Progreso</span>
              <span className="text-cyan-400 font-semibold">
                {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-2 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: 0.1,
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-row items-center justify-between gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onNext}
            disabled={!hasNext}
            className="flex items-center gap-3 min-w-[140px] justify-center bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <motion.div
              animate={{
                x: hasNext ? [0, 4, 0] : 0,
                scale: hasNext ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: hasNext ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <NextIcon />
            </motion.div>
            <span>Siguiente</span>
            <motion.span
              animate={{ x: [0, 2, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              →
            </motion.span>
          </Button>
        </motion.div>
      </div>

      {/* Status Indicator */}
      <motion.div
        className="flex items-center justify-center gap-3 mt-4 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className={`w-3 h-3 rounded-full ${
            isRunning
              ? "bg-gradient-to-r from-green-400 to-cyan-400 shadow-lg shadow-green-500/25"
              : hasNext
                ? "bg-gradient-to-r from-blue-400 to-purple-400"
                : "bg-gradient-to-r from-gray-400 to-gray-600"
          }`}
          animate={{
            scale: isRunning ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: isRunning ? 1.5 : 0.5,
            repeat: isRunning ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
        <span
          className={`font-medium ${
            isRunning
              ? "text-green-400"
              : hasNext
                ? "text-blue-400"
                : "text-gray-400"
          }`}
        >
          {isRunning ? "Ejecutando..." : hasNext ? "Listo" : "Completado"}
        </span>
      </motion.div>

      {/* Subtle background animation */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
