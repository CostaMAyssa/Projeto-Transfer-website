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
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = index < currentStep;
          const canClick = isStepClickable(index);
          
          return (
            <div 
              key={index}
              className={`flex-1 relative ${index < steps.length - 1 ? 'after:content-[""] after:absolute after:top-1/2 after:w-full after:h-[2px] after:bg-gray-200 after:transform after:-translate-y-1/2 after:z-0' : ''}`}
            >
              <div className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => canClick && onStepClick(index)}
                  disabled={!canClick}
                  className={`flex items-center justify-center h-14 w-14 rounded-full border-2 mb-2 transition-colors ${
                    isActive
                      ? 'bg-brand text-white border-brand'
                      : isCompleted
                      ? 'bg-brand text-white border-brand'
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
                  }`}
                >
                  {step.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepIndicator;
