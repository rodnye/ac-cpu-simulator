import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { ComputerElement } from "./components/ComputerElement.tsx";
import "@xyflow/react/dist/style.css";
import { UserActions } from "./components/UserActions.tsx";
import { CacheCard } from "./components/CacheView.tsx";
import { CPUManager } from "./services/cpu.service.ts";

const initialNodes = [
  {
    id: "cpu",
    position: { x: 7, y: 100 },
    data: { label: "CPU" },
    type: "component",
  },
  {
    id: "cache",
    position: { x: 0, y: 0 },
    data: { label: "Cache", tw_bg: "bg-blue-600" },
    type: "component",
  },
  {
    id: "memoria",
    position: { x: 450, y: 100 },
    type: "component",
    data: { label: "Memoria" },
  },
];

const initialEdges = [
  {
    id: "cpu-cache",
    source: "cpu",
    sourceHandle: "top",
    target: "cache",
    style: { stroke: "#666" },
  },
  {
    id: "cpu-memoria",
    source: "cpu",
    sourceHandle: "right",
    target: "memoria",
    targetHandle: "left",
    style: { stroke: "#666" },
  },
];

const cpuManager = new CPUManager();

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (
      changes: NodeChange<{
        id: string;
        position: { x: number; y: number };
        data: { label: string };
        type: string;
      }>[],
    ) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (
      changes: EdgeChange<{
        id: string;
        source: string;
        target: string;
        style: { stroke: string };
        animated: boolean;
      }>[],
    ) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  return (
    <>
      <div className="relative" style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{
            component: ComputerElement,
          }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
        </ReactFlow>
        <div className="absolute top-0 right-0">
          <UserActions cpu={cpuManager} />
          <CacheCard data={cpuManager.cacheManager.data} />
        </div>
      </div>
    </>
  );
}
