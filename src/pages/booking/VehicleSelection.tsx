
import { useBooking } from "@/contexts/BookingContext";
import VehicleCard from "@/components/VehicleCard";
import RideSummary from "@/components/RideSummary";
import { vehicles } from "@/data/mockData";

const VehicleSelection = () => {
  const { bookingData } = useBooking();

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
    </div>
  );
};

export default VehicleSelection;
