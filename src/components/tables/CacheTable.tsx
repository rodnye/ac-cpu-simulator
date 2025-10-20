import { motion, AnimatePresence } from "framer-motion";
import type { CacheEntry, CacheType } from "../../services/cache/Cache";
import type { DirectCache } from "../../services/cache/DirectCache";

interface CacheTableProps {
  lines: DirectCache["lines"];
  cacheType?: CacheType;
}

export const CacheTable = ({
  lines,
  cacheType = "direct",
}: CacheTableProps) => {
  const renderDirectCacheTable = () => {
    const directLines = lines as DirectCache["lines"];

    return (
      <motion.table
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <thead>
          <tr className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
            <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-300 uppercase tracking-wider">
              Línea
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-300 uppercase tracking-wider">
              Tag
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-300 uppercase tracking-wider">
              Datos
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          <AnimatePresence>
            {directLines.map(
              (line, index) =>
                line && (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(56, 189, 248, 0.05)",
                      transition: { duration: 0.2 },
                    }}
                    className="border-l-4 border-l-transparent hover:border-l-cyan-400/50 transition-all duration-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        className="text-sm font-mono text-cyan-400 bg-cyan-400/10 px-3 py-2 rounded-lg border border-cyan-400/20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {index}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg border border-emerald-400/20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {line.tag}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.span
                        className="text-sm font-mono text-gray-200 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {line.block}
                      </motion.span>
                    </td>
                  </motion.tr>
                ),
            )}
          </AnimatePresence>
        </tbody>
      </motion.table>
    );
  };

  const renderSetAssociativeCacheTable = () => {
    const setLines = lines as CacheEntry[];

    return (
      <motion.table
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <thead>
          <tr className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
            <th className="px-6 py-4 text-left text-sm font-semibold text-purple-300 uppercase tracking-wider">
              Conjunto
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
              Vía
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-300 uppercase tracking-wider">
              Tag
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Datos
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          <AnimatePresence>
            {setLines.map(
              (line, index) =>
                line && (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.015 }}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(139, 92, 246, 0.05)",
                      transition: { duration: 0.2 },
                    }}
                    className="border-l-4 border-l-transparent hover:border-l-purple-400/50 transition-all duration-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        className="text-sm font-mono text-purple-400 bg-purple-400/10 px-3 py-2 rounded-lg border border-purple-400/20"
                        whileHover={{ scale: 1.05 }}
                      >
                        {Math.floor(index / 4)}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        className="text-sm font-mono text-orange-400 bg-orange-400/10 px-3 py-2 rounded-lg border border-orange-400/20"
                        whileHover={{ scale: 1.05 }}
                      >
                        {index % 4}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.span
                        className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg border border-emerald-400/20"
                        whileHover={{ scale: 1.05 }}
                      >
                        {line.tag}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <motion.span
                        className="text-sm font-mono text-gray-200 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600"
                        whileHover={{ scale: 1.02 }}
                      >
                        {line.block}
                      </motion.span>
                    </td>
                  </motion.tr>
                ),
            )}
          </AnimatePresence>
        </tbody>
      </motion.table>
    );
  };

  const hasData = lines.some((line) => line !== null);
  const occupiedLines = lines.filter((line) => line !== null).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-1/2 flex flex-col select-none bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 px-6 py-5 border-b border-gray-700/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💾
            </motion.span>
            Tabla de Caché
            <span className="text-cyan-300 ml-2">
              {cacheType === "set-associative"
                ? "- Asociativa por Conjuntos"
                : "- Directa"}
            </span>
          </h2>
          <p className="text-sm text-gray-300 mt-2 flex items-center gap-2">
            <motion.span
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {cacheType === "set-associative"
              ? "5 conjuntos × 4 vías = 20 líneas totales"
              : "16,384 líneas directas"}
          </p>
        </motion.div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-grow relative">
        <AnimatePresence mode="wait">
          {hasData ? (
            <motion.div
              key="table-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {cacheType === "direct"
                ? renderDirectCacheTable()
                : renderSetAssociativeCacheTable()}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-64 text-gray-400"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl mb-4"
              >
                🗃️
              </motion.div>
              <p className="text-lg font-medium">Caché vacía</p>
              <p className="text-sm mt-1">
                Ejecuta una operación para ver los datos
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        className="bg-gray-800/50 px-6 py-4 border-t border-gray-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${
                hasData ? "bg-green-400" : "bg-yellow-400"
              }`}
              animate={{
                scale: hasData ? [1, 1.3, 1] : 1,
                opacity: hasData ? [1, 0.7, 1] : 1,
              }}
              transition={{
                duration: hasData ? 1.5 : 0,
                repeat: hasData ? Infinity : 0,
              }}
            />
            <p className="text-xs text-gray-400">
              {hasData ? "Caché activa" : "Caché inactiva"}
            </p>
          </div>
          <p className="text-xs text-cyan-300 font-mono">
            {cacheType === "direct"
              ? `Líneas: ${occupiedLines}/16,384`
              : `Entradas: ${occupiedLines}/20`}
          </p>
        </div>
      </motion.div>

      {/* Background Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
    </motion.div>
  );
};
