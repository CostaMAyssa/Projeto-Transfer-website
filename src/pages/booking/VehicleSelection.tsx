import { useBooking } from "@/contexts/BookingContext";
import ZonePricingVehicleCard from "@/components/ZonePricingVehicleCard";
import RideSummary from "@/components/RideSummary";
import { useVehicleCategories } from "@/hooks/useZonePricing";
import { VehicleCategory } from "@/lib/zone-pricing";
import { VehicleType } from "@/types/booking";

const VehicleSelection = () => {
  const { bookingData, selectVehicle } = useBooking();
  const { data: vehicleCategories, isLoading } = useVehicleCategories();

  // Convert VehicleCategory to VehicleType for compatibility
  const convertToVehicleType = (category: VehicleCategory): VehicleType => ({
    id: category.id,
    name: category.name,
    category: category.name,
    description: category.description || '',
    capacity: category.capacity,
    price: category.base_price,
    image: `/lovable-uploads/${category.id === 'sedan' ? '8cd7b8ce-deda-49ae-bd1a-e6b2b07a6d82' : 
                                category.id === 'suv' ? '4e7b6c9a-3c84-4593-a7c6-07c21b6e7b22' : 
                                '6d1f4c84-2e3a-4f95-8b5d-9c8e7f1a6d92'}.png`,
    features: category.features || []
  });

  const handleVehicleSelect = (category: VehicleCategory) => {
    const vehicleType = convertToVehicleType(category);
    selectVehicle(vehicleType);
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-normal mb-6">Select Your Car</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div>
            <RideSummary />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-normal mb-6">Select Your Car</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {vehicleCategories?.map((vehicle) => (
            <ZonePricingVehicleCard 
              key={vehicle.id} 
              vehicle={vehicle}
              pickupLocation={bookingData.pickupLocation}
              dropoffLocation={bookingData.dropoffLocation}
              selected={bookingData.vehicle?.id === vehicle.id}
              onSelect={handleVehicleSelect}
            />
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
