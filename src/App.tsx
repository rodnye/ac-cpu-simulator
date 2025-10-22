// App.tsx - Versión corregida
import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  type Edge,
  type Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { UserActions } from "./components/controls/UserActions";
import { Cpu, type CpuStep } from "./services/Cpu";
import {
  ComputerNode,
  type IComputerNodeData,
} from "./components/nodes/ComputerNode";
import cpuImg from "./assets/cpu_pc_components.png";
import cacheImg from "./assets/cache_pc_components.png";
import memoryImg from "./assets/ram_pc_components.png";
import { ControlPanel } from "./components/controls/ControlPanel";
import type { MemoryStep } from "./services/Memory";
import type { SetAssociativeCacheStep } from "./services/cache/SetAssociativeCache";
import type { DirectCacheStep } from "./services/cache/DirectCache";
import type { CacheType } from "./services/cache/Cache";
import type { AssociativeCacheStep } from "./services/cache/AssociativeCache";
import { motion, AnimatePresence } from "framer-motion";

// Definir el tipo de nodo correctamente
type CustomNode = Node<IComputerNodeData["data"]> & {
  id: string;
  position: { x: number; y: number };
  type: string;
};

const initialNodes: CustomNode[] = [
  {
    id: "cpu",
    position: { x: 100, y: 7 },
    data: {
      Component: () => (
        <img src={cpuImg} alt="CPU" className="w-24 filter brightness-110" />
      ),
      status: "idle",
      statusText: "",
      statusPosition: "top",
    },
    type: "component",
  },
  {
    id: "cache",
    position: { x: 260, y: -70 },
    data: {
      Component: () => (
        <img
          src={cacheImg}
          alt="Cache"
          className="h-12 filter brightness-110"
        />
      ),
      status: "idle",
      statusText: "",
      statusPosition: "right",
    },
    type: "component",
  },
  {
    id: "memory",
    position: { x: 500, y: 23 },
    type: "component",
    data: {
      Component: () => (
        <img
          src={memoryImg}
          alt="Memory"
          className="w-24 h-16 filter brightness-110"
        />
      ),
      status: "idle",
      statusText: "",
      statusPosition: "bottom",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "cpu-cache",
    source: "cpu",
    sourceHandle: "right",
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
];

const cpuManager = new Cpu();

export default function App() {
  const [nodes, setNodes] = useState<CustomNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [cacheType, setCacheType] = useState<CacheType>("direct");
  const [executionHistory, setExecutionHistory] = useState<string[]>([]);

  // Función para actualizar estados de pasos
  const updateStepState = useCallback(() => {
    try {
      const steps = cpuManager.getSteps();
      setTotalSteps(steps.length);
      const completedSteps = steps.filter(
        (step) => !cpuManager.getSteps().includes(step as any),
      ).length;
      setCurrentStep(Math.max(0, completedSteps));
    } catch (error) {
      console.error("Error updating step state:", error);
    }
  }, []);

  const clearStatus = useCallback(() => {
    const updatedEdges = edges.map((e) => ({
      ...e,
      animated: false,
      label: "",
    }));

    const updatedNodes = nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        status: "idle" as const,
        statusText: "",
      },
    }));

    setEdges(updatedEdges);
    setNodes(updatedNodes);
  }, [edges, nodes]);

  const handleNextStep = useCallback(() => {
    if (cpuManager.hasNext()) {
      cpuManager.next();
      updateStepState();
    }
  }, [updateStepState]);

  const handleReset = useCallback(() => {
    cpuManager.stopTimer();
    cpuManager.setSteps([]);
    clearStatus();
    updateStepState();
    setExecutionHistory([]);
  }, [clearStatus, updateStepState]);

  useEffect(() => {
    const { memory, directCache, associativeCache, setAssociativeCache } =
      cpuManager;

    const handleCpuStep = (step: CpuStep) => {
      clearStatus();

      // Agregar al historial
      setExecutionHistory((prev) => [...prev, `CPU: ${step.info}`]);

      // Actualizar nodo CPU
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === "cpu") {
            return {
              ...node,
              data: {
                ...node.data,
                status: "active" as const,
                statusText: step.info,
              },
            };
          }
          return node;
        }),
      );

      // Actualizar edges según el tipo de paso
      const updatedEdges = edges.map((edge) => {
        if (step.id.startsWith("cache:") || step.id.startsWith("set-cache:")) {
          if (edge.id === "cpu-cache") {
            return {
              ...edge,
              animated: true,
              style: {
                ...edge.style,
                stroke: "#06b6d4",
              },
            };
          }
        } else if (step.id.startsWith("memory:")) {
          if (edge.id === "cpu-memory") {
            return {
              ...edge,
              animated: true,
              style: {
                ...edge.style,
                stroke: "#ef4444",
              },
            };
          }
        }
        return edge;
      });

      setEdges(updatedEdges);
      updateStepState();
    };

    const handleMemoryStep = (step: MemoryStep) => {
      setExecutionHistory((prev) => [...prev, `Memoria: ${step.info}`]);

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === "memory") {
            return {
              ...node,
              data: {
                ...node.data,
                status: "active" as const,
                statusText: step.info,
              },
            };
          }
          return node;
        }),
      );
    };

    const handleCacheStep = (
      step: DirectCacheStep | SetAssociativeCacheStep | AssociativeCacheStep,
    ) => {
      setExecutionHistory((prev) => [...prev, `Cache: ${step.info}`]);

      let status: IComputerNodeData["data"]["status"] = "active";
      let statusText = step.info;

      switch (step.id) {
        case "cache-hit":
          status = "success";
          break;
        case "load-memory":
          status = "success";
          break;
        case "cache-miss":
          status = "error";
          break;
      }

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === "cache") {
            return {
              ...node,
              data: {
                ...node.data,
                status,
                statusText,
              },
            };
          }
          return node;
        }),
      );
    };

    // Event listeners
    cpuManager.on("step", handleCpuStep);
    cpuManager.on("execute", updateStepState);
    cpuManager.on("timer-start", updateStepState);
    cpuManager.on("timer-stop", updateStepState);

    memory.on("step", handleMemoryStep);
    directCache.on("step", handleCacheStep);
    associativeCache.on("step", handleCacheStep);
    setAssociativeCache.on("step", handleCacheStep);

    // Cleanup
    return () => {
      cpuManager.off("step", handleCpuStep);
      cpuManager.off("execute", updateStepState);
      cpuManager.off("timer-start", updateStepState);
      cpuManager.off("timer-stop", updateStepState);

      memory.off("step", handleMemoryStep);
      directCache.off("step", handleCacheStep);
      associativeCache.off("step", handleCacheStep);
      setAssociativeCache.off("step", handleCacheStep);
    };
  }, [clearStatus, edges, updateStepState]);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex w-full h-full">
        {/* Main Simulation Area */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={{
              component: ComputerNode,
            }}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background
              color="#4B5563"
              gap={20}
              size={1}
              variant={BackgroundVariant.Dots}
            />
          </ReactFlow>
        </div>

        {/* Control Panel */}
        <div className="w-80 bg-gray-800/50 backdrop-blur-sm border-l border-gray-700 flex flex-col">
          <div className="p-6">
            <UserActions
              cpu={cpuManager}
              cacheType={cacheType}
              onCacheTypeChange={setCacheType}
            />
          </div>

          {/* Execution History */}
          <div className="flex-1 flex flex-col min-h-0 p-6 pt-0">
            <div className="h-full bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-300">
                  Historial de Ejecución
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {executionHistory.length} eventos registrados
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
                  <div className="p-4 space-y-3">
                    <AnimatePresence initial={false}>
                      {executionHistory
                        .slice(-50)
                        .map((entry, index, array) => (
                          <motion.div
                            key={`${index}-${entry}-${Date.now()}`}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{
                              duration: 0.3,
                              ease: "easeOut",
                            }}
                            className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-cyan-500 text-sm text-gray-300 hover:bg-gray-800/70 transition-colors duration-200"
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-400 text-xs mt-0.5 flex-shrink-0">
                                {array.length - index}.
                              </span>
                              <span className="flex-1 whitespace-pre-wrap break-words">
                                {entry}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>

                    {executionHistory.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-500 py-12"
                      >
                        <div className="text-3xl mb-3">📋</div>
                        <p className="text-gray-400">
                          El historial aparecerá aquí
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Ejecuta operaciones para ver el registro
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {executionHistory.length > 0 && (
                <div className="p-3 border-t border-gray-700 bg-gray-800/30 flex-shrink-0">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>
                      Mostrando {Math.min(executionHistory.length, 50)} de{" "}
                      {executionHistory.length}
                    </span>
                    <button
                      onClick={() => setExecutionHistory([])}
                      className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 rounded hover:bg-rose-400/10"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-4 left-4">
        <ControlPanel totalSteps={totalSteps} currentStep={currentStep} />
      </div>
    </div>
  );
}
