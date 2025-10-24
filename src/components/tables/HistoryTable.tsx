import type { ReactNode } from "react";

export interface HistoryData {
  component: ReactNode;
  id: string;
  info: ReactNode;
  extraInfo?: ReactNode;
}
export interface HistoryTableProps {
  data: HistoryData[];
  className?: string;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  data,
  className = "",
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Componente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
              Información
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                <div className="flex items-center justify-center">
                  {item.component}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    {item.info}
                  </div>
                  <div className="text-sm text-gray-600">{item.extraInfo}</div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos para mostrar
        </div>
      )}
    </div>
  );
}
