
import { useBooking } from "@/contexts/BookingContext";
import VehicleCard from "@/components/VehicleCard";
import RideSummary from "@/components/RideSummary";
import { vehicles } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const VehicleSelection = () => {
  const { nextStep, bookingData } = useBooking();

  const handleContinue = () => {
    if (bookingData.vehicle) {
      nextStep();
    } else {
      alert("Please select a vehicle to continue");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-normal mb-6">Select Your Car</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
        
        <div>
          <RideSummary />
        </div>
      </div>

      {bookingData.vehicle && (
        <div className="mt-6">
          <Button 
            onClick={handleContinue} 
            className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto font-normal"
            style={{ backgroundColor: '#111111' }}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;
