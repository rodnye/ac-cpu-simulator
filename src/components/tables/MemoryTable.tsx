import type { Memory } from "../../services/Memory";

interface MemoryTableProps {
  memoryData: Memory['directCacheArray'];
}

export const MemoryTable = ({ memoryData }: MemoryTableProps) => {
  return (
    <div className="h-full flex flex-col select-none bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Tabla de Memoria
        </h2>
      </div>

      <div className="overflow-x-auto flex-grow-1">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Block
              </th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto divide-y divide-gray-200">
            {Object.entries(memoryData).map(([tag, block]) => (
              <tr
                key={tag}
                className="hover:bg-blue-50 transition-colors duration-150 ease-in-out"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    {tag}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1 rounded border border-gray-200">
                    {block}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(memoryData).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos de memoria disponibles
        </div>
      )}

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Total de bloques: {Object.keys(memoryData).length}
        </p>
      </div>
    </div>
  );
};
