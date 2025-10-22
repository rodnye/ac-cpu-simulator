// UserActions.tsx - Versión corregida
import { useState, useEffect } from "react";
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
  const [error, setError] = useState("");
  const [hasPendingSteps, setHasPendingSteps] = useState(false);

  // Efecto para escuchar cambios en el estado de pasos
  // En UserActions.tsx - Actualizar el useEffect
  useEffect(() => {
    const updateStepState = () => {
      const hasSteps = cpu.getSteps().length > 0;
      setHasPendingSteps(hasSteps);
    };

    cpu.on("step", updateStepState);
    cpu.on("execute", updateStepState);
    cpu.on("reset", updateStepState);

    return () => {
      cpu.off("step", updateStepState);
      cpu.off("execute", updateStepState);
      cpu.off("reset", updateStepState);
    };
  }, [cpu]);

  // Validar dirección hexadecimal
  const validateHexAddress = (value: string): boolean => {
    if (value.length !== 6) return false;
    const hexRegex = /^[0-9A-Fa-f]{6}$/;
    return hexRegex.test(value);
  };

  const handleAddressChange = (value: string) => {
    // Convertir a mayúsculas y filtrar caracteres no hexadecimales
    const filteredValue = value.toUpperCase().replace(/[^0-9A-F]/g, "");

    // Limitar a 6 caracteres
    const truncatedValue = filteredValue.slice(0, 6);

    setAddress(truncatedValue);

    // Validar en tiempo real
    if (truncatedValue.length === 6 && !validateHexAddress(truncatedValue)) {
      setError("Dirección hexadecimal inválida");
    } else {
      setError("");
    }
  };

  const handleExecuteOrNext = async () => {
    // Si hay pasos pendientes, ejecutar siguiente paso
    if (cpu.hasNext()) {
      try {
        cpu.next();
      } catch (error) {
        console.error("Error executing next step:", error);
        setError("Error al ejecutar siguiente paso");
      }
      return;
    }

    // Si no hay pasos pendientes, ejecutar nueva operación
    if (!validateHexAddress(address)) {
      setError(
        "La dirección debe tener exactamente 6 caracteres hexadecimales (0-9, A-F)",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Resetear estado visual antes de nueva operación
      cpu.resetVisualState();

      // Pequeño delay para la animación
      await new Promise((resolve) => setTimeout(resolve, 300));

      let result;
      switch (cacheType) {
        case "direct":
          result = cpu.executeGetWordDirect(address);
          break;
        case "associative":
          result = cpu.executeGetWordAssociative(address);
          break;
        case "set-associative":
          result = cpu.executeGetWordSetAssociative(address);
          break;
        default:
          throw new Error(`Tipo de caché no soportado: ${cacheType}`);
      }

      console.log(`Operación ${cacheType} completada. Resultado:`, result);

      // Ejecutar primer paso automáticamente si hay pasos
      if (cpu.hasNext()) {
        setTimeout(() => {
          cpu.next();
        }, 500);
      }
    } catch (error) {
      console.error("Error executing cache operation:", error);
      setError(
        `Error al ejecutar operación de caché ${cacheType}: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCacheTypeChange = (newType: CacheType) => {
    // Cancelar operación actual si hay una en curso
    if (cpu.hasNext() || isLoading) {
      setIsLoading(false);
    }

    onCacheTypeChange?.(newType);
    // Resetear dirección cuando cambia el tipo
    setAddress("000000");
    setError("");
  };

  const getButtonText = () => {
    if (isLoading) return "Ejecutando...";
    return cpu.hasNext() ? "Siguiente Paso" : "Ejecutar Operación";
  };

  const isExecuteDisabled =
    isLoading || (!cpu.hasNext() && !validateHexAddress(address));

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
                disabled={isLoading || cpu.hasNext()}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  cacheType === type
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } ${isLoading || cpu.hasNext() ? "opacity-50 cursor-not-allowed" : ""}`}
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
          Dirección Hexadecimal (6 caracteres)
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          disabled={cpu.hasNext() || isLoading}
          placeholder="000000"
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 uppercase"
          maxLength={6}
        />
        <div className="flex justify-between mt-1 text-xs">
          <span
            className={`${address.length === 6 ? "text-green-400" : "text-yellow-400"}`}
          >
            {address.length}/6 caracteres
          </span>
          <span className="text-gray-400">Caracteres válidos: 0-9, A-F</span>
        </div>

        {/* Mensaje de error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-2 bg-rose-600/20 border border-rose-500/40 rounded-lg text-rose-300 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Execute/Next Button */}
      <motion.div className="w-full">
        <Button
          onClick={handleExecuteOrNext}
          disabled={isExecuteDisabled}
          loading={isLoading}
          className="w-full"
          variant={cpu.hasNext() ? "secondary" : "primary"}
        >
          {getButtonText()}
        </Button>

        {/* Indicador de estado */}
        <div className="mt-2 text-center">
          <AnimatePresence>
            {cpu.hasNext() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-cyan-400 text-sm flex items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                />
                {cpu.getSteps().length} pasos pendientes
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Botón de reset */}
      {(cpu.hasNext() || isLoading) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-3"
        >
          <Button
            onClick={() => {
              setIsLoading(false);
              setError("");
            }}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Cancelar Operación
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
