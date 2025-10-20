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
    <div className="flex flex-col bg-orange-400 p-10">
      {/** FIXME: data para listar */}
      <select value={text} onChange={(e) => setText(e.target.value)}>
        {Object.entries(cpu.memory.directCacheArray).map(([tag, t], index) => (
          <option key={index} value={tag + t}>
            {tag + t}
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
