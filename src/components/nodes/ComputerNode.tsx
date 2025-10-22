import { Handle, Position, type HandleProps, type Node } from "@xyflow/react";
import type { ReactNode } from "react";

export interface IComputerNodeData extends Node {
  data: {
    status: "active" | "idle" | "error" | "success";
    statusText: string;
    Component: () => ReactNode;
    statusPosition?: "top" | "right" | "bottom" | "left";
  };
}

const TransparentHandler = (props: HandleProps) => {
  return (
    <Handle
      {...props}
      className="!bg-transparent !border-0 transition-all duration-200 hover:scale-110"
    />
  );
};

export const ComputerNode = ({
  data: {
    Component,
    status,
    statusText = "Default",
    statusPosition = "bottom",
  },
}: {
  data: IComputerNodeData["data"];
}) => {
  return (
    <div className="relative p-2 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/60 hover:shadow-xl hover:shadow-slate-900/20">
      <div className="transition-transform duration-300 hover:scale-[1.02]">
        <Component />
      </div>

      <TransparentHandler type="source" position={Position.Top} id="top" />
      <TransparentHandler type="source" position={Position.Right} id="right" />
      <TransparentHandler type="source" position={Position.Left} id="left" />
      <TransparentHandler
        type="target"
        position={Position.Bottom}
        id="bottom"
      />
      <TransparentHandler type="target" position={Position.Left} id="left" />
    </div>
  );
};
