import { useState } from "react";
import Button from "../atoms/Button";
import type { Cpu } from "../../services/Cpu";
import type { CacheType } from "../../services/cache/Cache";

interface UserActionsProps {
  cpu: Cpu;
  cacheType: CacheType;
  onCacheTypeChange: (type: CacheType) => void;
}

export const UserActions = ({
  cpu,
  cacheType = "direct",
  onCacheTypeChange,
}: UserActionsProps) => {
  const [directText, setDirectText] = useState(cpu.memory.directCalls[0]);
  const [associativeText, setAssociativeText] = useState(
    cpu.memory.associativeCalls[0],
  );

  const isDisabled = cpu.hasNext();
  const memoryOptions =
    cacheType === "associative"
      ? cpu.memory.associativeCalls
      : cpu.memory.directCalls;

  const handleExecute = () => {
    onCacheTypeChange?.(cacheType);

    switch (cacheType) {
      case "direct":
        cpu.executeGetWordDirect(directText);
        break;
      case "associative":
        cpu.executeGetWordAssociative(associativeText);
        break;
      case "set-associative":
        cpu.executeGetWordSetAssociative(directText);
        break;
    }

    cpu.next(); // Primer paso
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (cacheType === "associative") {
      setAssociativeText(e.target.value);
    } else {
      setDirectText(e.target.value);
    }
  };

  const currentText =
    cacheType === "associative" ? associativeText : directText;

  return (
    <div className="flex flex-row items-center justify-center p-6 bg-gray-300 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Caché:
        </label>
        <select
          value={cacheType}
          onChange={(e) => onCacheTypeChange(e.target.value as CacheType)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="direct">Caché Directa</option>
          <option value="associative">Caché Asociativa</option>
          <option value="set-associative">
            Caché Asociativa por Conjuntos
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <select
          value={currentText}
          onChange={handleSelectChange}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 cursor-pointer transition duration-200 ease-in-out hover:border-gray-400"
        >
          {memoryOptions.map((tag, index) => (
            <option key={index} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-2">
          <Button disabled={isDisabled} onClick={handleExecute}>
            Ejecutar Caché
          </Button>
        </div>
      </div>
    </div>
  );
};
