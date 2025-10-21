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
  const getPositionClasses = () => {
    const baseClasses =
      "absolute px-3 py-2 rounded-xl text-xs font-semibold text-white backdrop-blur-sm border transition-all duration-300 ease-out max-w-sm min-w-[120px]";
    const animationClass = status !== "idle" ? "animate-pulse-short" : "";

    switch (statusPosition) {
      case "top":
        return `${baseClasses} top-0 left-1/2 transform -translate-x-1/2 -translate-y-full ${animationClass}`;
      case "right":
        return `${baseClasses} right-0 top-1/2 transform translate-x-full -translate-y-1/2 ${animationClass}`;
      case "bottom":
        return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full ${animationClass}`;
      case "left":
        return `${baseClasses} left-0 top-1/2 transform -translate-x-full -translate-y-1/2 ${animationClass}`;
      default:
        return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full ${animationClass}`;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-cyan-500/20 border-cyan-400/40 shadow-lg shadow-cyan-500/10";
      case "error":
        return "bg-rose-600/20 border-rose-500/40 shadow-lg shadow-rose-500/10";
      case "idle":
        return "bg-slate-700/20 border-slate-600/40";
      case "success":
        return "bg-emerald-500/20 border-emerald-400/40 shadow-lg shadow-emerald-500/10";
      default:
        return "bg-slate-700/20 border-slate-600/40";
    }
  };

  // Componente para formatear el texto con saltos de línea
  const StatusText = ({ text }: { text: string }) => {
    return (
      <div className="whitespace-pre-wrap text-center leading-tight">
        {text}
      </div>
    );
  };

  return (
    <div className="relative p-2 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-600/60 hover:shadow-xl hover:shadow-slate-900/20">
      <div className="transition-transform duration-300 hover:scale-[1.02]">
        <Component />
      </div>

      {/* Texto de estado flotante en la posición especificada */}
      {statusText && status !== "idle" && (
        <div className={`${getPositionClasses()} ${getStatusColor()}`}>
          <StatusText text={statusText} />
        </div>
      )}

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
