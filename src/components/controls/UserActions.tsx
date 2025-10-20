import { useState } from "react";
import Button from "../atoms/Button";
import TextField from "../atoms/TextField";
import type { Cpu } from "../../services/Cpu";

export const UserActions = ({ cpu }: { cpu: Cpu }) => {
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col bg-green-400 p-10">
      <TextField
        value={text}
        disabled={cpu.hasNext()}
        onChange={(e) => setText(e)}
      />
      <Button
        disabled={cpu.hasNext()}
        onClick={() => {
          cpu.executeGetWord(text);
          cpu.next();
        }}
      >
        Caché Directa
      </Button>
      <Button
        disabled={cpu.hasNext()}
        onClick={() => {
          cpu.executeGetWord(text);
          cpu.next();
        }}
      >
        Caché Asociativa
      </Button>
    </div>
  );
};
