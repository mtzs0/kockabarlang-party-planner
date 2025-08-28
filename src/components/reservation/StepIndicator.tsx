import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export const StepIndicator = ({ steps, currentStep, completedSteps, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="flex justify-between items-center max-w-lg mx-auto">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable = isCompleted || isCurrent;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                  "shadow-[var(--shadow-step)]",
                  {
                    "bg-step-completed text-secondary-foreground": isCompleted,
                    "bg-step-active text-primary-foreground": isCurrent && !isCompleted,
                    "bg-step-inactive text-muted-foreground": !isCurrent && !isCompleted,
                    "cursor-pointer hover:scale-105": isClickable,
                    "cursor-not-allowed": !isClickable,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </button>
              
              {/* Step Title */}
              <span className={cn(
                "text-xs font-medium mt-2 text-center",
                {
                  "text-step-completed": isCompleted,
                  "text-step-active": isCurrent && !isCompleted,
                  "text-muted-foreground": !isCurrent && !isCompleted,
                }
              )}>
                {step.title}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-3 mb-6 transition-colors duration-200",
                {
                  "bg-step-completed": completedSteps.includes(step.id + 1),
                  "bg-step-inactive": !completedSteps.includes(step.id + 1),
                }
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};