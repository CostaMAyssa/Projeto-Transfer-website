import { useBooking } from "@/contexts/BookingContext";
import ZonePricingVehicleCard from "@/components/ZonePricingVehicleCard";
import RideSummary from "@/components/RideSummary";
import { useVehicleCategories } from "@/hooks/useZonePricing";
import { VehicleCategory } from "@/lib/zone-pricing";
import { VehicleType } from "@/types/booking";
import { useTranslation } from "react-i18next";

const VehicleSelection = () => {
  const { bookingData, selectVehicle } = useBooking();
  const { data: vehicleCategories, isLoading } = useVehicleCategories();
  const { t } = useTranslation();

  // Convert VehicleCategory to VehicleType for compatibility
  const convertToVehicleType = (category: VehicleCategory): VehicleType => {
    // Usar o mesmo mapeamento de imagens do ZonePricingVehicleCard
    const getVehicleImage = (vehicleId: string) => {
      const normalizedId = vehicleId.toLowerCase();
      const images = {
        sedan: "/lovable-uploads/c2fc4186-469d-4557-a80b-4a3e32dbc017.png",  // Sedan - Toyota Camry
        suv: "/lovable-uploads/d7859a6e-d290-4f3f-a494-2dd91f50c9cd.png",    // SUV - Chevrolet Suburban
        van: "/lovable-uploads/76414054-57cd-4796-9734-f706281297f6.png",     // Van - Chrysler Pacifica
        minivan: "/lovable-uploads/76414054-57cd-4796-9734-f706281297f6.png"  // Minivan - mesma do Van
      };
      return images[normalizedId as keyof typeof images] || images.sedan;
    };

    return {
      id: category.id,
      name: category.name,
      category: category.name,
      description: category.description || '',
      capacity: category.capacity,
      price: category.base_price,
      image: getVehicleImage(category.id),
      features: category.features || [],
      models: category.description || category.name // Usar description como models ou fallback para name
    };
  };

  const handleVehicleSelect = (category: VehicleCategory) => {
    const vehicleType = convertToVehicleType(category);
    selectVehicle(vehicleType);
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-normal mb-6">{t('booking.selectVehicle')}</h2>
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
      <h2 className="text-2xl font-normal mb-6">{t('booking.selectVehicle')}</h2>
      
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
