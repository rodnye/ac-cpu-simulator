// App.tsx - Versión modificada
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
import { motion } from "framer-motion";

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
  const [currentStepDetail, setCurrentStepDetail] = useState<any>(null);

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
    setCurrentStepDetail(null);
  }, [clearStatus, updateStepState]);

  // Efecto para manejar los pasos de ejecución
  useEffect(() => {
    const { memory, directCache, associativeCache, setAssociativeCache } =
      cpuManager;

    const handleCpuStep = (step: CpuStep) => {
      clearStatus();

      // Mostrar paso actual
      setCurrentStepDetail({
        type: "cpu",
        data: step,
        title: "Paso de CPU",
        icon: "⚡",
      });

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
      setCurrentStepDetail({
        type: "memory",
        data: step,
        title: "Paso de Memoria",
        icon: "💾",
      });
    };

    const handleCacheStep = (
      step: DirectCacheStep | SetAssociativeCacheStep | AssociativeCacheStep,
    ) => {
      setCurrentStepDetail({
        type: "cache",
        data: step,
        title: "Paso de Caché",
        icon: "🚀",
      });
    };

    // Event listeners
    cpuManager.on("step", handleCpuStep);
    cpuManager.on("execute", updateStepState);
    cpuManager.on("timer-start", updateStepState);
    cpuManager.on("timer-stop", updateStepState);
    cpuManager.on("reset", () => {
      setCurrentStepDetail(null);
    });

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
      cpuManager.off("reset", () => {
        setCurrentStepDetail(null);
      });

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

        {/* Sidebar con UserActions y StepVisualizer */}
        <div className="w-96 flex flex-col">
          {/* Panel de control del usuario */}
          <div className="bg-gray-800/50 backdrop-blur-sm border-l border-gray-700 flex-shrink-0">
            <div className="p-6">
              <UserActions
                cpu={cpuManager}
                cacheType={cacheType}
                onCacheTypeChange={(newType) => {
                  setCacheType(newType);
                }}
              />
            </div>
          </div>

          {/* Paso Actual - Colocado justo después del panel del usuario */}
          <div className="flex-1 p-4 overflow-hidden">
            <StepVisualizer
              currentStep={currentStepDetail}
              totalSteps={totalSteps}
              currentStepNumber={currentStep}
              onNextStep={handleNextStep}
              hasNextStep={cpuManager.hasNext()}
            />
          </div>
        </div>
      </div>

      {/* Bottom Control Panel - Eliminado */}
    </div>
  );
}

// Componente StepVisualizer ajustado
interface StepVisualizerProps {
  currentStep: any;
  totalSteps: number;
  currentStepNumber: number;
  onNextStep: () => void;
  hasNextStep: boolean;
}

const StepVisualizer = ({
  currentStep,
  totalSteps,
  currentStepNumber,
}: StepVisualizerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {currentStep?.icon || "📋"} Paso Actual
        </h3>
        <div className="text-sm text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
          {currentStepNumber}/{totalSteps}
        </div>
      </div>

      {currentStep ? (
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {currentStep.title}
            </span>
            <div className="text-sm font-mono text-cyan-300 bg-gray-800 px-2 py-1 rounded mt-1 break-all">
              {currentStep.data.id}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-gray-300 text-sm leading-relaxed break-words whitespace-pre-wrap h-full overflow-y-auto">
              {currentStep.data.info}
            </div>
          </div>
          {currentStep.data.value && (
            <div className="p-2 bg-gray-700 rounded border-l-4 border-green-500 flex-shrink-0">
              <span className="text-gray-400 text-xs">Valor: </span>
              <span className="text-green-400 font-mono text-sm break-all">
                {typeof currentStep.data.value === "string"
                  ? currentStep.data.value
                  : JSON.stringify(currentStep.data.value, null, 2)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 flex-1 flex flex-col justify-center">
          <div className="text-3xl mb-2">🔄</div>
          <p className="text-sm">Esperando ejecución...</p>
          <p className="text-xs mt-1">Ejecuta una operación para comenzar</p>
        </div>
      )}
    </motion.div>
  );
};
