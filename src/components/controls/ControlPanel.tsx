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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-900/95 group"
    >
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

      {/* Subtle background animation */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
