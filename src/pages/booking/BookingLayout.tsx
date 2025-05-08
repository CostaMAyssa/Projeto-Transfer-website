
import { useBooking } from "@/contexts/BookingContext";
import BookingStepIndicator from "@/components/BookingStepIndicator";
import VehicleSelection from "./VehicleSelection";
import ExtrasSelection from "./ExtrasSelection";
import PassengerDetails from "./PassengerDetails";
import Payment from "./Payment";
import Confirmation from "./Confirmation";
import Navbar from "@/components/Navbar";

const BookingLayout = () => {
  const { currentStep, goToStep, bookingComplete } = useBooking();

  const steps = [
    { component: <VehicleSelection /> },
    { component: <ExtrasSelection /> },
    { component: <PassengerDetails /> },
    { component: <Payment /> },
    { component: <Confirmation /> }
  ];

  const handleStepClick = (step: number) => {
    goToStep(step);
  };

  // If booking is complete, show the confirmation step
  if (bookingComplete) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen pt-20">
          <Confirmation />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pt-20">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {currentStep < 4 && (
            <div className="px-4 md:px-8 lg:px-16 mb-6">
              <BookingStepIndicator 
                currentStep={currentStep} 
                onStepClick={handleStepClick}
              />
            </div>
          )}
          
          {steps[currentStep]?.component}
        </div>
      </div>
    </>
  );
}

export default BookingLayout;
