import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ProgressStep {
  id: string;
  label: string;
  status: "completed" | "in-progress" | "not-started";
  description?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStepId?: string;
  percentage?: number;
  className?: string;
  variant?: "linear" | "steps" | "compact";
  onStepClick?: (stepId: string) => void;
}

export function ProgressIndicator({
  steps,
  currentStepId,
  percentage = 0,
  className,
  variant = "linear",
  onStepClick
}: ProgressIndicatorProps) {
  // If no current step is provided, find the first in-progress step
  const currentStep = currentStepId
    ? steps.find(step => step.id === currentStepId)
    : steps.find(step => step.status === "in-progress");

  const currentStepIndex = currentStep
    ? steps.findIndex(step => step.id === currentStep.id)
    : -1;

  const renderLinearProgress = () => (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center text-sm">
        <div>
          {currentStep && (
            <span className="font-medium">{currentStep.label}</span>
          )}
        </div>
        <div className="text-gray-500">{Math.round(percentage)}% complete</div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );

  const renderStepsProgress = () => (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Progress bar connecting steps */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isCurrent = step.id === currentStep?.id;

            return (
              <TooltipProvider key={step.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onStepClick && onStepClick(step.id)}
                      className={cn(
                        "flex flex-col items-center space-y-2 relative",
                        onStepClick && "cursor-pointer",
                        !onStepClick && "cursor-default"
                      )}
                      disabled={!onStepClick}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors",
                          isCompleted ? "bg-primary text-primary-foreground" :
                            isCurrent ? "bg-primary/10 border-2 border-primary text-primary" :
                              "bg-white border-2 border-gray-300 text-gray-400"
                        )}
                      >
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium text-center",
                          isCompleted ? "text-primary" :
                            isCurrent ? "text-gray-900" :
                              "text-gray-500"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.description || step.label}</p>
                    <p className="text-xs">
                      {step.status === "completed" ? "Completed" :
                        step.status === "in-progress" ? "In Progress" : "Not Started"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCompactProgress = () => (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress value={percentage} className="h-2 flex-grow" />
      <span className="text-xs font-medium text-gray-500">
        {Math.round(percentage)}%
      </span>
    </div>
  );

  switch (variant) {
    case "steps":
      return renderStepsProgress();
    case "compact":
      return renderCompactProgress();
    case "linear":
    default:
      return renderLinearProgress();
  }
}
