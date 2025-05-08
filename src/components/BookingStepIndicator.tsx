
import { useBooking } from "@/contexts/BookingContext";
import { Car, Package, UserRound, CreditCard } from "lucide-react";

interface BookingStepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const BookingStepIndicator = ({ currentStep, onStepClick }: BookingStepIndicatorProps) => {
  const steps = [
    { name: 'Vehicle', icon: <Car size={20} /> },
    { name: 'Extras', icon: <Package size={20} /> },
    { name: 'Details', icon: <UserRound size={20} /> },
    { name: 'Payment', icon: <CreditCard size={20} /> }
  ];

  const isStepClickable = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between relative">
        {/* Connection line that runs through all steps */}
        <div className="absolute top-10 left-0 right-0 h-[1px] bg-gray-200 z-0"></div>
        
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = index < currentStep;
          const canClick = isStepClickable(index);
          
          return (
            <div 
              key={index}
              className="flex-1 relative z-10"
            >
              <div className="flex flex-col items-center">
                {/* Step number */}
                <div className="flex items-center justify-between w-full mb-2">
                  {index === 0 ? (
                    <div className="bg-black text-white rounded-full p-3 w-14 h-14 flex items-center justify-center">
                      {step.icon}
                    </div>
                  ) : (
                    <div className="invisible">Spacer</div>
                  )}
                  
                  <div className={`text-2xl font-bold ${isActive || isCompleted ? 'text-black' : 'text-gray-400'}`}>
                    {`0${index + 1}`}
                  </div>
                </div>
                
                {/* Step circle */}
                <button
                  onClick={() => canClick && onStepClick(index)}
                  disabled={!canClick}
                  className={`flex items-center justify-center h-14 w-14 rounded-full mb-2 transition-colors ${
                    isActive
                      ? 'bg-black text-white border-2 border-black'
                      : isCompleted
                      ? 'bg-black text-white border-2 border-black'
                      : 'bg-gray-100 text-gray-400 border-0'
                  } ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {index > 0 && step.icon}
                </button>
                
                {/* Step name */}
                <span 
                  className={`text-sm font-medium ${
                    isActive || isCompleted ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Progress line that fills based on current step */}
        <div 
          className="absolute top-10 left-0 h-[1px] bg-black z-0 transition-all duration-300"
          style={{ 
            width: `${currentStep === 0 ? 0 : ((currentStep / (steps.length - 1)) * 100)}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default BookingStepIndicator;
