// CacheTable.tsx
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
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Línea
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Tag
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Datos
            </th>
          </tr>
        </thead>
        <tbody className="overflow-y-auto divide-y divide-gray-200">
          {directLines.map(
            (line, index) =>
              line && (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      {index}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                      {line.tag}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1 rounded border border-gray-200">
                      {line.block}
                    </span>
                  </td>
                </tr>
              ),
          )}
        </tbody>
      </table>
    );
  };

  const renderSetAssociativeCacheTable = () => {
    const setLines = lines as CacheEntry[];

    return (
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Conjunto
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Vía
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Tag
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Datos
            </th>
          </tr>
        </thead>
        <tbody className="overflow-y-auto divide-y divide-gray-200">
          {setLines.map(
            (line, index) =>
              line && (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                      {Math.floor(index / 4)} {/* Calculate set number */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                      {index % 4} {/* Calculate way number */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                      {line.tag}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1 rounded border border-gray-200">
                      {line.block}
                    </span>
                  </td>
                </tr>
              ),
          )}
        </tbody>
      </table>
    );
  };

  const hasData = lines.some((line) => line !== null);

  return (
    <div className="h-full w-80 flex flex-col select-none bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Caché
          {cacheType === "set-associative"
            ? " - Asociativa por Conjuntos"
            : cacheType === "associative"
              ? " - Asociativa"
              : " - Directa"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {cacheType === "set-associative"
            ? "5 conjuntos × 4 vías = 20 líneas totales"
            : "16,384 líneas directas"}
        </p>
      </div>

      <div className="overflow-x-auto h-full flex-grow-1">
        {cacheType === "direct"
          ? renderDirectCacheTable()
          : renderSetAssociativeCacheTable()}
      </div>

      {!hasData && (
        <div className="text-center py-8 text-gray-500">
          No hay datos de caché disponibles
        </div>
      )}

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {cacheType === "direct"
            ? `Líneas ocupadas: ${lines.filter((line) => line !== null).length}`
            : `Total de entradas: ${lines.filter((line) => line !== null).length}`}
        </p>
      </div>
    </div>
  );
};
