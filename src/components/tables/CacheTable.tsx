import type { DirectCache } from "../../services/cache/DirectCache";

interface CacheTableProps {
  lines: DirectCache["lines"];
}

export const CacheTable = ({ lines }: CacheTableProps) => {
  return (
    <div className="h-1/2 flex flex-col select-none bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Tabla de Caché</h2>
      </div>

      <div className="overflow-x-auto flex-grow-1">
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
            {lines.map((line, index) => (line &&
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
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(lines).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos de caché disponibles
        </div>
      )}

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Total de líneas: {Object.keys(lines).length}
        </p>
      </div>
    </div>
  );
};
