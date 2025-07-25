import { useBooking } from "@/contexts/BookingContext";
import { VehicleType } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Users, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VehicleCardProps {
  vehicle: VehicleType;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const { t } = useTranslation();
  const { selectVehicle, bookingData, nextStep } = useBooking();
  const isSelected = bookingData.vehicle?.id === vehicle.id;

  const handleVehicleSelect = () => {
    selectVehicle(vehicle);
    // Immediately advance to next step when selecting a vehicle
    nextStep();
  };

  const getLuggageText = (vehicleId: string) => {
    switch(vehicleId) {
      case "suv":
        return `6 ${t('fleet.checkedBaggage')} ${t('booking.and')} 5 ${t('fleet.carryOnBaggage')}`;
      case "sedan":
        return `3 ${t('fleet.checkedBaggage')} ${t('booking.and')} 2 ${t('fleet.carryOnBaggage')}`;
      case "minivan":
        return `4 ${t('fleet.checkedBaggage')} ${t('booking.and')} 4 ${t('fleet.carryOnBaggage')}`;
      default:
        return `${vehicle.luggage} pieces`;
    }
  };

  // Map vehicle features to translations
  const getTranslatedFeature = (feature: string) => {
    const featureMap: Record<string, string> = {
      "Meet & Greet included": t('vehicles.features.meetGreet'),
      "Free cancellation": t('vehicles.features.freeCancellation'),
      "Free Waiting time": t('vehicles.features.freeWaiting'),
      "Safe and secure travel": t('vehicles.features.safeTravel')
    };
    return featureMap[feature] || feature;
  };

  return (
    <div className="border rounded-lg overflow-hidden mb-6 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Image with zoom effect */}
        <div className="p-4 flex items-center justify-center bg-gray-50 overflow-hidden">
          <img 
            src={vehicle.image} 
            alt={vehicle.name} 
            className="w-full max-w-sm object-contain h-48"
            style={{ transform: "scale(1.1)" }} // Reduced to 10% zoom from 30%
          />
        </div>
        
        {/* Details */}
        <div className="lg:col-span-2 p-4 lg:p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-normal mb-1">{vehicle.category}</h3>
            <p className="text-sm text-gray-600">{vehicle.models}</p>
          </div>

          <div className="flex flex-col mb-4 space-y-2">
            <div className="flex items-center">
              <Users size={18} className="mr-1" />
              <span className="text-sm font-medium">{t('fleet.passengers')}: {vehicle.capacity}</span>
            </div>
            <div className="flex items-start">
              <Briefcase size={18} className="mr-1 mt-0.5" />
              <div className="text-sm">
                <span className="font-medium">{t('fleet.luggage')}: </span>
                <span className="text-gray-600 text-xs">{getLuggageText(vehicle.id)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="mb-2">
              <span className="text-2xl font-normal">${vehicle.price.toFixed(0)}</span>
              <p className="text-sm text-gray-600">{t('booking.allPricesInclude')}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {vehicle.features.map((feature, index) => (
                <div key={index} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                  <Check size={12} className="mr-1 text-brand" />
                  {getTranslatedFeature(feature)}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="link" 
                className="text-brand hover:text-brand-700 p-0 font-medium"
              >
                {t('booking.showMoreInfo')}
              </Button>
              
              <Button 
                onClick={isSelected ? undefined : handleVehicleSelect} 
                variant={isSelected ? "outline" : "default"}
                className={isSelected ? "border-brand text-brand hover:text-brand-700 font-medium" : "bg-black hover:bg-gray-800 text-white font-medium"}
              >
                {isSelected ? t('booking.selected') : t('booking.select')} <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
