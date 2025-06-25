import { Car, Package, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BookingStepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const BookingStepIndicator = ({ currentStep, onStepClick }: BookingStepIndicatorProps) => {
  const { t } = useTranslation();
  
  const steps = [
    { name: t('booking.steps.vehicle'), icon: <Car size={20} /> },
    { name: t('booking.steps.extras'), icon: <Package size={20} /> },
    { name: t('booking.steps.payment'), icon: <CreditCard size={20} /> }
  ];

  const isStepClickable = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between relative">
        {/* Connection line that runs through all steps - made darker and thicker */}
        <div className="absolute top-7 left-0 right-0 h-0.5 bg-gray-300 z-0"></div>
        
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
                {/* Step circle */}
                <button
                  onClick={() => canClick && onStepClick(index)}
                  disabled={!canClick}
                  className={`flex items-center justify-center h-14 w-14 rounded-full mb-2 transition-colors ${
                    isActive || isCompleted
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  } ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {step.icon}
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
        
        {/* Progress line that fills based on current step - made darker and thicker */}
        <div 
          className="absolute top-7 left-0 h-0.5 bg-black z-0 transition-all duration-300"
          style={{ 
            width: `${currentStep === 0 ? 0 : ((currentStep / (steps.length - 1)) * 100)}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default BookingStepIndicator;
