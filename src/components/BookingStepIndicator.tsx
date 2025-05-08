
import { useBooking } from "@/contexts/BookingContext";

interface BookingStepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const BookingStepIndicator = ({ currentStep, onStepClick }: BookingStepIndicatorProps) => {
  const steps = [
    { name: 'Select Car' },
    { name: 'Extras' },
    { name: 'Details' },
    { name: 'Payment' }
  ];

  const isStepClickable = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between relative">
        {/* Connection line that runs through all steps */}
        <div className="absolute top-7 left-0 right-0 h-[2px] bg-gray-200 z-0"></div>
        
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
                <button
                  onClick={() => canClick && onStepClick(index)}
                  disabled={!canClick}
                  className={`flex items-center justify-center h-14 w-14 rounded-full border-2 mb-2 transition-colors ${
                    isActive
                      ? 'bg-[#ED1B24] text-white border-[#ED1B24]'
                      : isCompleted
                      ? 'bg-[#ED1B24] text-white border-[#ED1B24]'
                      : 'bg-white text-gray-400 border-gray-300'
                  } ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {isCompleted ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-lg font-normal">0{index + 1}</span>
                  )}
                </button>
                <span 
                  className={`text-sm ${
                    isActive ? 'text-black' : isCompleted ? 'text-black' : 'text-gray-400'
                  } font-normal`}
                >
                  {step.name}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Progress line that fills based on current step */}
        <div 
          className="absolute top-7 left-0 h-[2px] bg-[#ED1B24] z-0 transition-all duration-300"
          style={{ 
            width: `${currentStep === 0 ? 0 : ((currentStep / (steps.length - 1)) * 100)}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default BookingStepIndicator;
