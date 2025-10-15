import { useState } from "react";
import type { CPUManager } from "../services/cpu.service";
import Button from "./Button";
import TextField from "./TextField";

export const UserActions = ({ cpu }: { cpu: CPUManager }) => {
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col bg-green-400 p-10">
      <TextField value={text} onChange={(e) => setText(e)} />
      <Button
        onClick={() => {
          cpu.executeSearch(text);
          console.log(cpu);
        }}
      >
        Enviar
      </Button>
    </div>
  );
};
