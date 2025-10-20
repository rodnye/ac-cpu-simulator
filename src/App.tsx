import { useState, useEffect } from "react";
import { ReactFlow, Background, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { UserActions } from "./components/controls/UserActions.tsx";
import { Cpu } from "./services/Cpu.ts";
import {
  ComputerNode,
  type IComputerNodeData,
} from "./components/nodes/ComputerNode.tsx";

import cpuImg from "./assets/cpu_pc_components.png";
import cacheImg from "./assets/cache_pc_components.png";
import memoryImg from "./assets/ram_pc_components.png";
import { ControlPanel } from "./components/controls/ControlPanel.tsx";
import { CacheTable } from "./components/tables/CacheTable.tsx";
import { MemoryTable } from "./components/tables/MemoryTable.tsx";
import { Memory } from "./services/Memory.ts";

const initialNodes: IComputerNodeData[] = [
  {
    id: "cpu",
    position: { x: 7, y: 100 },
    data: {
      Component: () => <img src={cpuImg} className="w-16" />,
      status: "idle",
      statusText: "",
      statusPosition: "left"
    },
    type: "component",
  },
  {
    id: "cache",
    position: { x: 0, y: 0 },
    data: {
      Component: () => <img src={cacheImg} className="w-16" />,
      status: "idle",
      statusText: "",
      statusPosition: "left"
    },
    type: "component",
  },
  {
    id: "memory",
    position: { x: 250, y: 100 },
    type: "component",
    data: {
      Component: () => <img src={memoryImg} className="w-24" />,
      status: "idle",
      statusText: "",
      statusPosition: "top"
    },
  },
] as const;

const initialEdges: Edge[] = [
  {
    id: "cpu-cache",
    source: "cpu",
    sourceHandle: "top",
    target: "cache",
    labelShowBg: false,
    style: { stroke: "#666", strokeWidth: "3px"},
  },
  {
    id: "cpu-memory",
    source: "cpu",
    sourceHandle: "right",
    target: "memory",
    targetHandle: "left",
    labelShowBg: false,
    style: { stroke: "#666", strokeWidth: "3px" },
  },
] as const;

const cpuManager = new Cpu();

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [totalSteps, setTotalSteps] = useState(0);
  const [{ cpu }, setCpuWrapper] = useState({ cpu: cpuManager });

  const renderCpu = () => setCpuWrapper({ cpu });
  const renderNodes = () => setNodes([...nodes]);
  const renderEdges = () =>
    setEdges(
      edges.map((e) => {
        // es necesario un id unico para asignar
        e.id = [
          e.id.split(":")[0],
          e.animated,
          e.style!.animationDirection,
        ].join(":");
        return e;
      }),
    );
  const clearStatus = () => {
    edges.forEach((e) => {
      e.animated = false;
      delete e.label;
    });
    nodes.forEach((n) => {
      n.data.status = "idle";
    });
  };

  useEffect(() => {
    const { memory, cache } = cpuManager;
    const [cpuNode, cacheNode, memoryNode] = nodes;
    const [cpuCacheEdge, cpuMemoryEdge] = edges;

    cpuManager.on("step", (step) => {
      cpuNode.data.status = "active";
      cpuNode.data.statusText = step.info;

      if (step.id.startsWith("cache:")) {
        cpuCacheEdge.animated = true;
        cpuCacheEdge.style = {
          ...cpuCacheEdge.style,
          animationDirection:
            step.value.length > 1 || step.id === "cache:set-line"
              ? "normal"
              : "reverse",
        };
      }
      
      renderEdges();
      renderNodes();
      renderCpu();
    });

    memory.on("step", (step) => {
      memoryNode.data.status = "active";
      memoryNode.data.statusText = step.info;

      if (step.id === "get-block") {
        cpuMemoryEdge.label = step.value + "";
        cpuMemoryEdge.animated = true;
        cpuMemoryEdge.style = {
          ...cpuMemoryEdge.style,
          animationDirection: "reverse",
        };
        renderEdges();
      }

      renderNodes();
      renderCpu();
    });

    cache.on("step", (step) => {
      switch (step.id) {
        case "cache-hit":
          cacheNode.data.status = "success";
          cpuCacheEdge.label = step.value;
          renderEdges();
          break;
        case "load-memory":
          cacheNode.data.status = "success";
          cpuCacheEdge.label = step.value.line + ":" + step.value.entry.tag;
          renderEdges();
          break;
        case "cache-miss":
          cacheNode.data.status = "error";
          break;
        default:
          cacheNode.data.status = "active";
          break;
      }
      cacheNode.data.statusText = step.info;

      renderNodes();
      renderCpu();
    });

    memory.on("execute", renderCpu);
    cache.on("execute", renderCpu);
    cpuManager.on("execute", () => {
      setTotalSteps(cpuManager.getSteps().length);
      renderCpu();
    });
    cpuManager.on("timer-start", renderCpu);
    cpuManager.on("timer-stop", renderCpu);
  });

  return (
    <>
      <div className="relative" style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{
            component: ComputerNode,
          }}
          fitView
        >
          <Background />
        </ReactFlow>
        <div className="absolute top-0 right-0">
          <UserActions cpu={cpu} />
          <MemoryTable memoryData={Memory.directCacheStrings} />
          <CacheTable lines={cpu.cache.lines} />
        </div>
        <div className="absolute bottom-0 left-0">
          <ControlPanel
            onNext={() => {
              clearStatus();
              cpu.next();
            }}
            onReset={() => cpu.startTimer(3000)}
            onStop={() => cpu.stopTimer()}
            isRunning={cpu.timerRunning}
            hasNext={cpu.hasNext()}
            totalSteps={totalSteps}
            currentStep={totalSteps - cpuManager.getSteps().length}
          />
        </div>
      </div>
    </>
  );
}
