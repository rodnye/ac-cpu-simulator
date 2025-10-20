import { useState, useEffect } from "react";
import { ReactFlow, Background, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { UserActions } from "./components/controls/UserActions.tsx";
import { Cpu, type CpuStep } from "./services/Cpu.ts";
import {
  ComputerNode,
  type IComputerNodeData,
} from "./components/nodes/ComputerNode.tsx";

import cpuImg from "./assets/cpu_pc_components.png";
import cacheImg from "./assets/cache_pc_components.png";
import memoryImg from "./assets/ram_pc_components.png";
import { ControlPanel } from "./components/controls/ControlPanel.tsx";
import { CacheTable } from "./components/tables/CacheTable.tsx";
import type { MemoryStep } from "./services/Memory.ts";
import type { SetAssociativeCacheStep } from "./services/cache/SetAssociativeCache.ts";
import type { DirectCacheStep } from "./services/cache/DirectCache.ts";
import type { CacheEntry, CacheType } from "./services/cache/Cache.ts";
import type { AssociativeCacheStep } from "./services/cache/AssociativeCache.ts";

const initialNodes: IComputerNodeData[] = [
  {
    id: "cpu",
    position: { x: 100, y: 7 },
    data: {
      Component: () => <img src={cpuImg} className="w-24" />,
      status: "idle",
      statusText: "",
      statusPosition: "right",
    },
    type: "component",
  },
  {
    id: "cache",
    position: { x: 0, y: 0 },
    data: {
      Component: () => <img src={cacheImg} className="h-12" />,
      status: "idle",
      statusText: "",
      statusPosition: "left",
    },
    type: "component",
  },
  {
    id: "memory",
    position: { x: 100, y: 250 },
    type: "component",
    data: {
      Component: () => <img src={memoryImg} className="w-24 h-16" />,
      status: "idle",
      statusText: "",
      statusPosition: "right",
    },
  },
] as const;

const cacheOptions = [
  { value: "direct", label: "Caché Directa" },
  { value: "associative", label: "Caché Asociativa" },
  { value: "set-associative", label: "Caché Asociativa por Conjuntos" },
];

const initialEdges: Edge[] = [
  {
    id: "cpu-cache",
    source: "cpu",
    sourceHandle: "left",
    target: "cache",
    labelShowBg: false,
    type: "step",
    style: { stroke: "#666", strokeWidth: "3px" },
  },
  {
    id: "cpu-memory",
    source: "cpu",
    sourceHandle: "right",
    target: "memory",
    targetHandle: "left",
    type: "step",
    labelShowBg: false,
    style: { stroke: "#666", strokeWidth: "3px" },
  },
] as const;

const cpuManager = new Cpu();

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [totalSteps, setTotalSteps] = useState(0);
  const [cacheType, setCacheType] = useState<
    "direct" | "associative" | "set-associative"
  >("direct");
  const [{ cpu }, setCpuWrapper] = useState({ cpu: cpuManager });

  const renderCpu = () => setCpuWrapper({ cpu });
  const renderNodes = () => setNodes([...nodes]);
  const renderEdges = () =>
    setEdges(
      edges.map((e) => {
        e.id = [
          e.id.split(":")[0],
          e.animated,
          e.style!.animationDirection,
        ].join(":");

        // FIXME: esto oculta temporalmente los label, estan feos
        e.label = "";
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

  const getCacheLines = () => {
    if (cacheType === "direct") {
      return cpu.directCache.lines;
    } else if (cacheType === "associative") {
      return cpu.associativeCache.lines;
    } else {
      // For set-associative cache, flatten the sets
      const setCache = cpu.setAssociativeCache;
      const allLines: (CacheEntry | null)[] = [];
      Object.values(setCache.sets || {}).forEach((set) => {
        if (Array.isArray(set)) {
          allLines.push(...set);
        }
      });
      return allLines;
    }
  };

  useEffect(() => {
    const { memory, directCache, associativeCache, setAssociativeCache } =
      cpuManager;
    const [cpuNode, cacheNode, memoryNode] = nodes;
    const [cpuCacheEdge, cpuMemoryEdge] = edges;

    const handleCpuStep = (step: CpuStep) => {
      cpuNode.data.status = "active";
      cpuNode.data.statusText = step.info;

      if (step.id.startsWith("cache:") || step.id.startsWith("set-cache:")) {
        cpuCacheEdge.animated = true;
        cpuCacheEdge.style = {
          ...cpuCacheEdge.style,
          animationDirection:
            step.value.length > 1 || step.id.includes("set-line")
              ? "normal"
              : "reverse",
        };
      }

      renderEdges();
      renderNodes();
      renderCpu();
    };

    const handleMemoryStep = (step: MemoryStep) => {
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
    };

    const handleDirectCacheStep = (step: DirectCacheStep) => {
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
    };

    const handleAssociativeCacheStep = (step: AssociativeCacheStep) => {
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
    };

    const handleSetAssociativeCacheStep = (step: SetAssociativeCacheStep) => {
      switch (step.id) {
        case "cache-hit":
          cacheNode.data.status = "success";
          //cpuCacheEdge.label = step.value;
          renderEdges();
          break;
        case "load-memory": {
          cacheNode.data.status = "success";
          const setInfo =
            step.value.set !== undefined ? `Set ${step.value.set}, ` : "";
          const wayInfo =
            step.value.way !== undefined ? `Way ${step.value.way}` : "";
          cpuCacheEdge.label = setInfo + wayInfo + ":" + step.value.entry.tag;
          renderEdges();
          break;
        }
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
    };

    // for CPU
    cpuManager.on("step", handleCpuStep);
    cpuManager.on("execute", () => {
      setTotalSteps(cpuManager.getSteps().length);
      renderCpu();
    });
    cpuManager.on("timer-start", renderCpu);
    cpuManager.on("timer-stop", renderCpu);

    // for Memory
    memory.on("step", handleMemoryStep);
    memory.on("execute", renderCpu);

    // cache
    directCache.on("step", handleDirectCacheStep);
    directCache.on("execute", renderCpu);
    setAssociativeCache.on("step", handleSetAssociativeCacheStep);
    setAssociativeCache.on("execute", renderCpu);
    //associativeCache.on("step", handleAssociativeCacheStep);
    associativeCache.on("execute", renderCpu);

    // Cleanup function
    return () => {
      cpuManager.off("step", handleCpuStep);
      cpuManager.off("execute");
      cpuManager.off("timer-start");
      cpuManager.off("timer-stop");

      memory.off("step", handleMemoryStep);
      memory.off("execute");

      directCache.off("step", handleDirectCacheStep);
      directCache.off("execute");

      associativeCache.off("step", handleAssociativeCacheStep);
      associativeCache.off("execute");
      setAssociativeCache.off("step", handleSetAssociativeCacheStep);
      setAssociativeCache.off("execute");
    };
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

        <div className="absolute top-0 left-0 h-full flex flex-col">
          <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Caché:
            </label>

            <div className="space-y-2">
              {cacheOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    value={option.value}
                    checked={cacheType === option.value}
                    onChange={(e) => setCacheType(e.target.value as CacheType)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <UserActions
            cpu={cpu}
            cacheType={cacheType}
            onCacheTypeChange={setCacheType}
          />
        </div>
        <div className="absolute bottom-0 right-0 flex flex-row h-1/2">
          <CacheTable lines={getCacheLines()} cacheType={cacheType} />
        </div>
        <div className="absolute top-0 right-0">
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
