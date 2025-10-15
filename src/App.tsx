import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { ComputerElement } from "./components/ComputerElement.tsx";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "cpu",
    position: { x: 250, y: 200 },
    data: { label: "CPU" },
    type: "component",
  },
  {
    id: "cache",
    position: { x: 0, y: 0 },
    data: { label: "Cache Directa" },
    type: "component",
  },
  {
    id: "memoria",
    position: { x: 450, y: 200 },
    type: "component",
    data: { label: "Memoria" },
  },
];

const initialEdges = [
  {
    id: "cpu-cache",
    source: "cpu",
    target: "cache",
    style: { stroke: "#666" },
    animated: true,
  },
  {
    id: "cpu-memoria",
    source: "cpu",
    target: "memoria",
    style: { stroke: "#666" },
    animated: true,
  },
];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
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
          <Background/>
        </ReactFlow>
      </div>
    </>
  );
}
