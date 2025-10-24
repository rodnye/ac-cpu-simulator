interface TableProps {
  data: (string | number)[][];
  headers?: string[];
}

export const RawTable: React.FC<TableProps> = ({ data, headers }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">No hay datos para mostrar</div>
    );
  }

  return (
    <div className="flex justify-center">
      <table className="border-collapse border border-gray-300">
        {headers && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-center"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-gray-300 px-4 py-2 text-center"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
