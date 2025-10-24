import { useState, useEffect, type ReactNode } from "react";
import { ReactFlow, Background, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { UserActions } from "./components/controls/UserActions.tsx";
import { CpuController } from "./engine/controllers/CpuController.ts";
import {
  ComputerNode,
  type IComputerNodeData,
} from "./components/nodes/ComputerNode.tsx";

import cpuImg from "./assets/cpu_pc_components.png";
import cacheImg from "./assets/cache_pc_components.png";
import memoryImg from "./assets/ram_pc_components.png";
import { CollapsibleTab } from "./components/atoms/CollapsiblePanel.tsx";
import { RawTable } from "./components/atoms/RawTable.tsx";
import { ControlPanel } from "./components/controls/ControlPanel.tsx";
import {
  type HistoryData,
  HistoryTable,
} from "./components/tables/HistoryTable.tsx";
import { MemoryTable } from "./components/tables/MemoryTable.tsx";
import type { CacheType } from "./engine/controllers/CacheController.ts";
import type { DirectCacheStep } from "./engine/controllers/DirectCacheController.ts";
import type { MemoryStep } from "./engine/controllers/MemoryController.ts";
import { getStepActions, type Step } from "./engine/controllers/StepController.ts";
import { binToHex } from "./utils/convert.ts";

const cpuImgReactNode = <img src={cpuImg} className="h-8" />;
const memoryImgReactNode = <img src={memoryImg} className="h-8" />;
const cacheImgReactNode = <img src={cacheImg} className="h-8" />;

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
      statusPosition: "top",
    },
    type: "component",
  },
  {
    id: "memory",
    position: { x: 500, y: 23 },
    type: "component",
    data: {
      Component: () => (
        <img src={memoryImg} className="h-16 filter brightness-110" />
      ),
      status: "idle",
      statusText: "",
      statusPosition: "bottom",
    },
  },
  {
    id: "cache",
    position: { x: 260, y: -70 },
    data: {
      Component: () => (
        <img src={cacheImg} className="h-12 filter brightness-110" />
      ),
      status: "idle",
      statusText: "",
      statusPosition: "right",
    },
    type: "component",
  },
] as const;

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
] as const;

const cpuManager = new CpuController();

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [totalSteps, setTotalSteps] = useState(0);
  const [cacheType, setCacheType] = useState<CacheType>("direct");
  const [{ cpu }, setCpuWrapper] = useState({ cpu: cpuManager });
  const [stepHistory, setStepHistory] = useState<HistoryData[]>([]);

  const updateNodeFromStep = (node: IComputerNodeData, step: Step) => {
    const data = node.data;
    data.status = "active";
    data.statusText = "";
    data.extraStatusText = "";

    // sanitizar actions a un arreglo, ya que puede venir vacio o con un solo elemento
    const actions = getStepActions(step);

    // iterar y ejecutar acciones del paso
    for (const action of actions) {
      switch (action.type) {
        case "text": {
          if (action.target === "extra") {
            data.extraStatusText = (
              <>
                {data.extraStatusText}
                {action.text}
              </>
            );
          } else {
            data.statusText = (
              <>
                {data.statusText}
                {action.text}
              </>
            );
          }
          break;
        }
        case "table": {
          if (action.target === "extra") {
            data.extraStatusText = (
              <>
                {data.extraStatusText}
                <RawTable data={action.table} />
              </>
            );
          } else {
            data.statusText = (
              <>
                {data.statusText}
                <RawTable data={action.table} />
              </>
            );
          }
          break;
        }
        case "status": {
          data.status = action.status;
          break;
        }
      }
    }
    addHistoryStep(
      node.id === "cpu"
        ? cpuImgReactNode
        : node.id === "memory"
          ? memoryImgReactNode
          : cacheImgReactNode,
      {
        id: step.id,
        info: data.statusText,
        extraInfo: data.extraStatusText,
      },
    );

    renderNodes();
    renderCpu();
  };
  const addHistoryStep = (
    responsible: ReactNode,
    step: Omit<HistoryData, "component">,
  ) => {
    if (stepHistory.find((data) => data.id === step.id)) return;
    setStepHistory([
      ...stepHistory,
      {
        component: responsible,
        id: step.id,
        info: step.info,
        extraInfo: step.extraInfo,
      },
    ]);
  };
  const renderCpu = () => setCpuWrapper({ cpu });
  const renderNodes = () => setNodes([...nodes]);
  /*const renderEdges = () =>
    setEdges(
      edges.map((e) => {
        e.id = [
          e.id.split(":")[0],
          e.animated,
          e.style!.animationDirection,
        ].join(":");
        return e;
      }),
    );*/
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
    const { memory, directCache } =
      cpuManager;
    const [cpuNode, cacheNode, memoryNode] = ["cpu", "cache", "memory"].map(
      (targetId) => nodes.find(({ id }) => id === targetId)!,
    );
    //const [cpuCacheEdge, cpuMemoryEdge] = edges;

    const handleCpuStep = (step: Step) => {
      updateNodeFromStep(cpuNode, step);
    };

    const handleMemoryStep = (step: MemoryStep) => {
      updateNodeFromStep(memoryNode, step);
    };

    const handleDirectCacheStep = (step: DirectCacheStep) => {
      updateNodeFromStep(cacheNode, step);
    };

    // for CPU
    cpuManager.on("step", handleCpuStep);
    cpuManager.on("execute", () => {
      stepHistory.length = 0;
      setTotalSteps(cpuManager.countAllSteps());
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
    };
  });

  return (
    <div className="relative" style={{ width: "100vw", height: "100vh" }}>
      <div className="flex w-full h-full flex-row items-stretch">
        <div className="flex-grow">
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
        </div>

        <div className="h-full flex flex-col overflow-y-auto">
          <UserActions
            cpu={cpu}
            cacheType={cacheType}
            onCacheTypeChange={setCacheType}
          />
          <div className="flex flex-row flex-grow-1 h-full">
            <MemoryTable
              memoryData={Array.from(
                cpu.memory.memory.createIterator(0, 200),
              ).map(({ tag, blockHex }) => [
                binToHex(tag),
                blockHex,
              ])}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0">
        <CollapsibleTab
          contentClassName="w-full"
          label="Historial de Operaciones"
          position="bottom"
        >
          <HistoryTable data={stepHistory} />
        </CollapsibleTab>
      </div>
      <div className="absolute bottom-0 left-0">
        <ControlPanel
          onNext={() => {
            clearStatus();
            cpu.next();
          }}
          onReset={() => cpu.startTimer(1000)}
          onStop={() => cpu.stopTimer()}
          isRunning={cpu.timerRunning}
          hasNext={cpu.hasNext()}
          totalSteps={totalSteps}
          currentStep={totalSteps - cpuManager.countAllSteps()}
        />
      </div>
    </div>
  );
}
