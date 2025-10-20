import { useState } from "react";
import Button from "../atoms/Button";
import type { Cpu } from "../../services/Cpu";

interface UserActionsProps {
  cpu: Cpu;
  cacheType?: "direct" | "associative" | "set-associative";
  onCacheTypeChange?: (
    type: "direct" | "associative" | "set-associative",
  ) => void;
}

export const UserActions = ({
  cpu,
  cacheType = "direct",
  onCacheTypeChange,
}: UserActionsProps) => {
  const [text, setText] = useState(cpu.memory.directCalls[0]);
  const isDisabled = cpu.hasNext();

  return (
    <div className="flex flex-row bg-orange-400 p-10">
      <select
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 cursor-pointer transition duration-200 ease-in-out hover:border-gray-400"
      >
        {(cacheType !== 'associative' ? cpu.memory.directCalls : cpu.memory.associativeCalls).map((tag, index) => (
          <option key={index} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-2 mt-4">
        <Button
          disabled={isDisabled}
          onClick={() => {
            if (onCacheTypeChange) onCacheTypeChange(cacheType);
            switch(cacheType) {
              case "direct": cpu.executeGetWordDirect(text); break;
              case "associative": cpu.executeGetWordAssociative(text); break;
              case "set-associative": cpu.executeGetWordSetAssociative(text); break;
            }
            cpu.next(); // first step
          }}
        >
          Ejecutar Caché
        </Button>
        
      </div>
    </div>
  );
};
