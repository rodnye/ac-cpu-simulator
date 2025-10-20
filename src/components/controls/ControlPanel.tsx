import Button from "../atoms/Button";
import { NextIcon } from "../atoms/Icon";

interface ControlPanelProps {
  onNext: () => void;
  onStop: () => void;
  onReset: () => void;
  isRunning?: boolean;
  hasNext?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export function ControlPanel({
  onNext,
  //onStop,
  //onReset,
  isRunning,
  hasNext,
  currentStep = 0,
  totalSteps = 0,
}: ControlPanelProps) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      {/* Progress Bar */}
      {totalSteps > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progreso</span>
            <span>
              {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-row items-center justify-between gap-4">
        {/* FIXME: se rompe el flujo
        <Button
          variant={isRunning ? "danger" : "secondary"}
          disabled={!hasNext && !isRunning}
          onClick={() => {
            if (isRunning) onStop();
            else onReset();
          }}
          className="flex items-center gap-2 min-w-[120px] justify-center"
        >
          {isRunning ? (
            <>
              <StopIcon />
              Detener
            </>
          ) : (
            <>
              <ResetIcon />
              Reanudar
            </>
          )}
        </Button>*/}

        <Button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-2 min-w-[120px] justify-center"
        >
          <NextIcon />
          Siguiente
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4 text-sm">
        <div
          className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
        />
        <span className="text-gray-600">
          {isRunning ? "Ejecutando..." : hasNext ? "Listo" : "Completado"}
        </span>
      </div>
    </div>
  );
}
