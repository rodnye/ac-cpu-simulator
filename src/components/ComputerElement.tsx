import { Handle, Position } from "@xyflow/react";

interface ComputerElementProps {
  data: {
    tw_bg: string;
    label: string;
  };
}
export const ComputerElement = ({ data }: ComputerElementProps) => {
  return (
    <div
      className={
        "px-6 py-3 text-white font-bold text-center rounded-xl " + (data.tw_bg || 'bg-red-500')
      }
    >
      {data.label}
      <Handle type="source" position={Position.Top} id="top"/>
      <Handle type="source" position={Position.Right} id="right"/>
      <Handle type="source" position={Position.Left} id="left"/>
      <Handle type="target" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} id="left"/>
    </div>
  );
};
