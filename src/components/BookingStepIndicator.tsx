
import React from "react";
import { cn } from "@/lib/utils";
import { Car, CreditCard, User, Package, Check } from "lucide-react";

interface BookingStepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const BookingStepIndicator = ({ currentStep, onStepClick }: BookingStepIndicatorProps) => {
  const steps = [
    { number: 1, label: "Vehicle", icon: Car },
    { number: 2, label: "Extras", icon: Package },
    { number: 3, label: "Details", icon: User },
    { number: 4, label: "Payment", icon: CreditCard },
  ];

  const isCompleted = (stepNumber: number) => currentStep > stepNumber;
  const isActive = (stepNumber: number) => currentStep === stepNumber;

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber < currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div 
            className={cn(
              "flex flex-col items-center",
              (onStepClick && step.number < currentStep) ? "cursor-pointer" : ""
            )}
            onClick={() => handleStepClick(step.number - 1)}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white mb-2",
                isCompleted(step.number - 1) ? "bg-brand" : 
                isActive(step.number - 1) ? "bg-black" : 
                "bg-gray-200"
              )}
            >
              <step.icon size={22} />
            </div>
            <span className="text-sm font-medium">
              {(isCompleted(step.number - 1) || isActive(step.number - 1)) ? (
                <span className="font-semibold">{step.label}</span>
              ) : (
                step.label
              )}
            </span>
            <span className={cn(
              "text-xl font-bold",
              (isCompleted(step.number - 1) || isActive(step.number - 1)) ? "text-black" : "text-gray-400"
            )}>
              {step.number.toString().padStart(2, '0')}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div className={cn(
              "h-px flex-1 mx-4", 
              isCompleted(step.number - 1) ? "bg-brand" : "bg-gray-200"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BookingStepIndicator;
