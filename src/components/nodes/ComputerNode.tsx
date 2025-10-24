import { Handle, Position, type HandleProps, type Node } from "@xyflow/react";
import type { ReactNode } from "react";
import { CollapsibleTab } from "../atoms/CollapsiblePanel";
import type { ActionStatus } from "../../engine/controllers/StepController";

export interface IComputerNodeData extends Node {
  data: {
    status: ActionStatus;
    statusText: ReactNode;
    extraStatusText?: ReactNode;
    Component: () => ReactNode;
    statusPosition?: "top" | "right" | "bottom" | "left";
  };
}

const TransparentHandler = (props: HandleProps) => {
  return <Handle {...props} className="!bg-transparent !border-0" />;
};

export const ComputerNode = ({
  data: {
    Component,
    status,
    statusText = "Default",
    extraStatusText,
    statusPosition = "bottom",
  },
}: {
  data: IComputerNodeData["data"];
}) => {
  const getPositionClasses = () => {
    const baseClasses =
      "absolute px-2 py-1 rounded-lg text-xs font-bold text-white ";
    const animationClass = status !== "idle" ? "animate-pulse" : "";

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
        return "bg-orange-500";
      case "error":
        return "bg-red-700";
      case "idle":
        return "bg-transparent";
      case "success":
        return "bg-green-700";
      default:
        return "bg-transparent";
    }
  };

  return (
    <div className="relative p-2 rounded-lg bg-transparent">
      <Component />

      {/* Texto de estado flotante en la posición especificada */}
      {statusText && status !== "idle" && (
        <div className={`${getPositionClasses()} ${getStatusColor()}`}>
          {extraStatusText ? <CollapsibleTab position="bottom" contentClassName={getStatusColor()} label={statusText}>
            {extraStatusText}
          </CollapsibleTab>: statusText }
          
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
