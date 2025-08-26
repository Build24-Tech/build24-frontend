import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface NavigationStep {
  id: string;
  title: string;
  href: string;
}

interface StepNavigationProps {
  steps: NavigationStep[];
  currentStepId: string;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
  disableNext?: boolean;
  disablePrevious?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
}

export function StepNavigation({
  steps,
  currentStepId,
  onNext,
  onPrevious,
  className,
  disableNext = false,
  disablePrevious = false,
  nextButtonText = "Next",
  previousButtonText = "Back"
}: StepNavigationProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  
  const previousStep = !isFirst ? steps[currentIndex - 1] : null;
  const nextStep = !isLast ? steps[currentIndex + 1] : null;

  return (
    <div className={cn("flex justify-between items-center w-full mt-8", className)}>
      <div>
        {previousStep && !disablePrevious ? (
          <Button
            variant="outline"
            onClick={onPrevious}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{previousButtonText}</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            className="flex items-center space-x-2 opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{previousButtonText}</span>
          </Button>
        )}
      </div>
      
      <div className="hidden md:flex space-x-1">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStepId;
          const isCompleted = idx < currentIndex;
          
          return (
            <Link
              key={step.id}
              href={step.href}
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isActive ? "bg-primary" : 
                  isCompleted ? "bg-primary opacity-70" : 
                  "bg-gray-300"
                )}
                title={step.title}
              />
            </Link>
          );
        })}
      </div>
      
      <div>
        {nextStep && !disableNext ? (
          <Button
            onClick={onNext}
            className="flex items-center space-x-2"
          >
            <span>{nextButtonText}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            disabled
            className="flex items-center space-x-2 opacity-50"
          >
            <span>{nextButtonText}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
