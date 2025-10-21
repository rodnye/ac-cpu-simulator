import { useState } from "react";
import Button from "../atoms/Button";
import type { Cpu } from "../../services/Cpu";
import { motion, AnimatePresence } from "framer-motion";

interface UserActionsProps {
  cpu: Cpu;
  cacheType?: "direct" | "associative" | "set-associative";
  onCacheTypeChange?: (
    type: "direct" | "associative" | "set-associative",
  ) => void;
}

export const UserActions = ({
  cpu,
  cacheType = "direct",
  onCacheTypeChange,
}: UserActionsProps) => {
  const [text, setText] = useState(cpu.memory.directCalls[0]);
  const [associativeText, setTexte] = useState(cpu.memory.associativeCalls[0]);
  const [isLoading, setIsLoading] = useState(false);
  const isDisabled = cpu.hasNext();

  const handleExecute = async () => {
    if (onCacheTypeChange) onCacheTypeChange(cacheType);

    setIsLoading(true);

    // Simular un pequeño delay para la animación
    await new Promise((resolve) => setTimeout(resolve, 300));

    switch (cacheType) {
      case "direct":
        cpu.executeGetWordDirect(text);
        break;
      case "associative":
        cpu.executeGetWordAssociative(associativeText);
        break;
      case "set-associative":
        cpu.executeGetWordSetAssociative(text);
        break;
    }
    cpu.next(); // first step

    setIsLoading(false);
  };

  const options =
    cacheType !== "associative"
      ? cpu.memory.directCalls
      : cpu.memory.associativeCalls;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-8 border border-gray-700/60 shadow-2xl backdrop-blur-sm"
    >
      {/* Cache Type Badge */}
      <motion.div
        className="mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 rounded-full border border-cyan-500/30">
          <motion.div
            className="w-2 h-2 bg-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-sm font-medium text-cyan-200 capitalize">
            {cacheType.replace("-", " ")} Cache
          </span>
        </div>
      </motion.div>

      {/* Select Input */}
      <motion.div
        className="w-full max-w-xs"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <select
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-800 text-white cursor-pointer transition-all duration-300 hover:border-cyan-400/50 hover:bg-gray-750 focus:bg-gray-750 font-medium"
        >
          <AnimatePresence>
            {options.map((tag, index) => (
              <motion.option
                key={index}
                value={tag}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 text-white py-2 checked:bg-cyan-600"
              >
                {tag}
              </motion.option>
            ))}
          </AnimatePresence>
        </select>
      </motion.div>

      {/* Action Button */}
      <motion.div
        className="flex flex-col gap-2 mt-6 w-full max-w-xs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: isDisabled || isLoading ? 1 : 1.03 }}
          whileTap={{ scale: isDisabled || isLoading ? 1 : 0.97 }}
        >
          <Button
            disabled={isDisabled || isLoading}
            onClick={handleExecute}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:shadow-none disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {/* Loading Animation */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center"
                >
                  <motion.div
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button Content */}
            <motion.span
              animate={{
                opacity: isLoading ? 0 : 1,
                scale: isLoading ? 0.8 : 1,
              }}
              className="flex items-center gap-2"
            >
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </motion.svg>
              Ejecutar Caché
            </motion.span>
          </Button>
        </motion.div>

        {/* Status Indicator */}
      </motion.div>

      {/* Background Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
    </motion.div>
  );
};
