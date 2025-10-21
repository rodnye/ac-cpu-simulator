// UserActions.tsx - Versión actualizada
import { useState } from "react";
import Button from "../atoms/Button";
import type { Cpu } from "../../services/Cpu";
import { motion, AnimatePresence } from "framer-motion";
import type { CacheType } from "../../services/cache/Cache";

interface UserActionsProps {
  cpu: Cpu;
  cacheType: CacheType;
  onCacheTypeChange?: (type: CacheType) => void;
}

export const UserActions = ({
  cpu,
  cacheType = "direct",
  onCacheTypeChange,
}: UserActionsProps) => {
  const [address, setAddress] = useState("000000");
  const [isLoading, setIsLoading] = useState(false);

  // Direcciones de ejemplo para diferentes tipos de caché
  const addressExamples = {
    direct: ["000000", "000010", "000020", "000030", "000040"],
    associative: ["000000", "100000", "200000", "300000", "400000"],
    "set-associative": ["000000", "000001", "000002", "000003", "000004"],
  };

  const handleExecute = async () => {
    if (!address) return;

    setIsLoading(true);

    try {
      // Simular un pequeño delay para la animación
      await new Promise((resolve) => setTimeout(resolve, 300));

      switch (cacheType) {
        case "direct":
          cpu.executeGetWordDirect(address);
          break;
        case "associative":
          cpu.executeGetWordAssociative(address);
          break;
        case "set-associative":
          cpu.executeGetWordSetAssociative(address);
          break;
      }

      // Ejecutar primer paso
      if (cpu.hasNext()) {
        cpu.next();
      }
    } catch (error) {
      console.error("Error executing cache operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCacheTypeChange = (newType: CacheType) => {
    onCacheTypeChange?.(newType);
    // Resetear dirección cuando cambia el tipo
    setAddress(addressExamples[newType][0]);
  };

  const currentAddresses = addressExamples[cacheType];
  const isDisabled = cpu.hasNext() || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center bg-gray-800/80 backdrop-blur-sm text-white rounded-xl p-6 border border-gray-700/60 shadow-xl"
    >
      {/* Cache Type Selector */}
      <motion.div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tipo de Caché
        </label>
        <div className="flex gap-2">
          {(["direct", "set-associative", "associative"] as CacheType[]).map(
            (type) => (
              <motion.button
                key={type}
                onClick={() => handleCacheTypeChange(type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  cacheType === type
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {type === "set-associative"
                  ? "Por Conjuntos"
                  : type === "associative"
                    ? "Totalmente Asoc."
                    : "Directa"}
              </motion.button>
            ),
          )}
        </div>
      </motion.div>

      {/* Address Input */}
      <motion.div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Dirección Hexadecimal
        </label>
        <select
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isDisabled}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
        >
          {currentAddresses.map((addr) => (
            <option key={addr} value={addr} className="bg-gray-800">
              {addr}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Execute Button */}
      <motion.div className="w-full">
        <Button
          onClick={handleExecute}
          disabled={isDisabled}
          loading={isLoading}
          className="w-full"
          variant="primary"
        >
          {isLoading ? "Ejecutando..." : "Ejecutar Operación"}
        </Button>
      </motion.div>
    </motion.div>
  );
};
