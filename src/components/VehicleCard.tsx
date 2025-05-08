
import { useBooking } from "@/contexts/BookingContext";
import { VehicleType } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Users, Briefcase } from "lucide-react";

interface VehicleCardProps {
  vehicle: VehicleType;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const { selectVehicle, bookingData } = useBooking();
  const isSelected = bookingData.vehicle?.id === vehicle.id;

  const getLuggageText = (vehicleId: string) => {
    switch(vehicleId) {
      case "suv":
        return "6 of 23kg (checked baggage) and 5 of 10kg (carry-on baggage)";
      case "sedan":
        return "3 of 23kg (checked baggage) and 2 of 10kg (carry-on baggage)";
      case "minivan":
        return "4 of 23kg (checked baggage) and 4 of 10kg (carry-on baggage)";
      default:
        return `${vehicle.luggage} pieces`;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden mb-6 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Image */}
        <div className="p-4 flex items-center justify-center bg-gray-50">
          <img 
            src={vehicle.image} 
            alt={vehicle.name} 
            className="w-full max-w-sm object-contain h-48"
          />
        </div>
        
        {/* Details */}
        <div className="lg:col-span-2 p-4 lg:p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1">{vehicle.category}</h3>
            <p className="text-sm text-gray-600">{vehicle.models}</p>
          </div>

          <div className="flex flex-col mb-4 space-y-2">
            <div className="flex items-center">
              <Users size={18} className="mr-1" />
              <span className="text-sm">Passengers: {vehicle.capacity}</span>
            </div>
            <div className="flex items-start">
              <Briefcase size={18} className="mr-1 mt-0.5" />
              <div className="text-sm">
                <span>Luggage: </span>
                <span className="text-gray-600 text-xs">{getLuggageText(vehicle.id)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="mb-2">
              <span className="text-2xl font-bold">${vehicle.price.toFixed(0)}</span>
              <p className="text-sm text-gray-600">All prices include VAT, fees & tip.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {vehicle.features.map((feature, index) => (
                <div key={index} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                  <Check size={12} className="mr-1 text-brand" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="link" 
                className="text-brand hover:text-brand-700 p-0"
              >
                Show more information
              </Button>
              
              <Button 
                onClick={() => selectVehicle(vehicle)} 
                variant={isSelected ? "outline" : "default"}
                className={isSelected ? "border-brand text-brand hover:text-brand-700" : "bg-black hover:bg-gray-800 text-white"}
              >
                {isSelected ? "Selected" : "Select"} <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
