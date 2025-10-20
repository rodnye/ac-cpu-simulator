import { useState } from "react";
import Button from "../atoms/Button";
import type { Cpu } from "../../services/Cpu";

interface UserActionsProps {
  cpu: Cpu;
  cacheType?: "direct" | "set-associative";
  onCacheTypeChange?: (type: "direct" | "set-associative") => void;
}

export const UserActions = ({
  cpu,
  cacheType = "direct",
  onCacheTypeChange,
}: UserActionsProps) => {
  const [text, setText] = useState("");

  const handleDirectCache = () => {
    if (onCacheTypeChange) onCacheTypeChange("direct");
    cpu.executeGetWordDirect(text);
    cpu.next();
  };

  const handleSetAssociativeCache = () => {
    if (onCacheTypeChange) onCacheTypeChange("set-associative");
    cpu.executeGetWordSetAssociative(text);
    cpu.next();
  };

  const isDisabled = cpu.hasNext();

  return (
    <div className="flex flex-row bg-orange-400 p-10">
      {/** FIXME: data para listar */}
      <select
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 cursor-pointer transition duration-200 ease-in-out hover:border-gray-400"
      >
        {Object.entries(cpu.memory.directCalls).map((tag, index) => (
          <option key={index} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-2 mt-4">
        <Button
          disabled={isDisabled}
          onClick={handleDirectCache}
          variant={cacheType === "direct" ? "primary" : "secondary"}
        >
          Caché Directa
        </Button>
        <Button
          disabled={isDisabled}
          onClick={handleSetAssociativeCache}
          variant={cacheType === "set-associative" ? "primary" : "secondary"}
        >
          Caché Asociativa por Conjuntos
        </Button>
      </div>
    </div>
  );
};
