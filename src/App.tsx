import { useState, useEffect } from "react";
import { ReactFlow, Background, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { UserActions } from "./components/controls/UserActions.tsx";
import { Cpu, type CpuStep } from "./services/Cpu.ts";
import {
  ComputerNode,
  type IComputerNodeData,
} from "./components/nodes/ComputerNode.tsx";
import { motion } from "framer-motion";

import cpuImg from "./assets/cpu_pc_components.png";
import cacheImg from "./assets/cache_pc_components.png";
import memoryImg from "./assets/ram_pc_components.png";
import { ControlPanel } from "./components/controls/ControlPanel.tsx";
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
      Component: () => (
        <img src={cpuImg} className="w-24 filter brightness-110" />
      ),
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
      Component: () => (
        <img src={cacheImg} className="h-12 filter brightness-110" />
      ),
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
      Component: () => (
        <img src={memoryImg} className="w-24 h-16 filter brightness-110" />
      ),
      status: "idle",
      statusText: "",
      statusPosition: "right",
    },
  },
] as const;

const cacheOptions = [
  {
    value: "direct",
    label: "Caché Directa",
    color: "from-cyan-500 to-blue-500",
  },
  {
    value: "associative",
    label: "Caché Asociativa",
    color: "from-purple-500 to-pink-500",
  },
  {
    value: "set-associative",
    label: "Caché Asociativa por Conjuntos",
    color: "from-orange-500 to-red-500",
  },
];

const initialEdges: Edge[] = [
  {
    id: "cpu-cache",
    source: "cpu",
    sourceHandle: "left",
    target: "cache",
    labelShowBg: false,
    type: "step",
    style: { stroke: "#4B5563", strokeWidth: "3px" },
  },
  {
    id: "cpu-memory",
    source: "cpu",
    sourceHandle: "right",
    target: "memory",
    targetHandle: "left",
    type: "step",
    labelShowBg: false,
    style: { stroke: "#4B5563", strokeWidth: "3px" },
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
  const [, setIsInitialized] = useState(false);

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
    setIsInitialized(true);
  }, []);

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
          stroke: "#06B6D4",
          strokeWidth: "4px",
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
          stroke: "#8B5CF6",
          strokeWidth: "4px",
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
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#10B981",
            strokeWidth: "4px",
          };
          renderEdges();
          break;
        case "load-memory":
          cacheNode.data.status = "success";
          cpuCacheEdge.label = step.value.line + ":" + step.value.entry.tag;
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#06B6D4",
            strokeWidth: "4px",
          };
          renderEdges();
          break;
        case "cache-miss":
          cacheNode.data.status = "error";
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#EF4444",
            strokeWidth: "4px",
          };
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
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#10B981",
            strokeWidth: "4px",
          };
          renderEdges();
          break;
        case "load-memory":
          cacheNode.data.status = "success";
          cpuCacheEdge.label = step.value.line + ":" + step.value.entry.tag;
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#06B6D4",
            strokeWidth: "4px",
          };
          renderEdges();
          break;
        case "cache-miss":
          cacheNode.data.status = "error";
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#EF4444",
            strokeWidth: "4px",
          };
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
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#10B981",
            strokeWidth: "4px",
          };
          renderEdges();
          break;
        case "load-memory": {
          cacheNode.data.status = "success";
          const setInfo =
            step.value.set !== undefined ? `Set ${step.value.set}, ` : "";
          const wayInfo =
            step.value.way !== undefined ? `Way ${step.value.way}` : "";
          cpuCacheEdge.label = setInfo + wayInfo + ":" + step.value.entry.tag;
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#06B6D4",
            strokeWidth: "4px",
          };
          renderEdges();
          break;
        }
        case "cache-miss":
          cacheNode.data.status = "error";
          cpuCacheEdge.style = {
            ...cpuCacheEdge.style,
            stroke: "#EF4444",
            strokeWidth: "4px",
          };
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
      <div
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        style={{ width: "100vw", height: "100vh" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{
            component: ComputerNode,
          }}
          fitView
        >
          <Background color="#4B5563" gap={32} />
        </ReactFlow>

        {/* Cache Type Selector */}
        <motion.div
          className="absolute top-4 left-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        ></motion.div>

        {/* User Actions */}
        <motion.div
          className="absolute top-0 left-0 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl p-6">
            <label className="block text-sm font-semibold text-cyan-200 mb-4">
              Tipo de Caché:
            </label>

            <div className="space-y-3">
              {cacheOptions.map((option) => (
                <motion.label
                  key={option.value}
                  className="flex items-center cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={cacheType === option.value}
                    onChange={(e) => setCacheType(e.target.value as CacheType)}
                    className="mr-3 text-cyan-500 focus:ring-cyan-500 border-gray-600 bg-gray-700"
                  />
                  <span
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      cacheType === option.value
                        ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                        : "text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </motion.label>
              ))}
            </div>
          </div>
          <UserActions
            cpu={cpu}
            cacheType={cacheType}
            onCacheTypeChange={setCacheType}
          />
        </motion.div>

        {/* Cache Table */}
        <motion.div
          className="absolute bottom-4 right-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        ></motion.div>

        {/* Control Panel */}
        <motion.div
          className="absolute top-4 right-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
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
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </>
  );
}
