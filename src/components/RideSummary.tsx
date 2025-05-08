import { useBooking } from "@/contexts/BookingContext";
import { format } from "date-fns";
import { Calendar, Clock, Map, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RideSummaryProps {
  onEdit?: () => void;
  showDetails?: boolean;
}

const RideSummary = ({ onEdit, showDetails = true }: RideSummaryProps) => {
  const { bookingData, calculateTotal } = useBooking();
  const { vehiclePrice, extrasPrice, total } = calculateTotal();
  
  const formatDate = (date: Date) => {
    return format(date, "EEE, MMM dd, yyyy");
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Ride Summary</h3>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onEdit}
              className="text-brand-500 hover:text-brand-700 hover:bg-brand-50"
            >
              Edit
            </Button>
          )}
        </div>
        
        {/* Pickup and Dropoff */}
        <div className="space-y-4 mb-4">
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white">
                A
              </div>
              <div className="w-px h-full bg-gray-300 my-1 flex-grow"></div>
              <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-white">
                A
              </div>
            </div>
            <div className="flex-1 space-y-5">
              <div>
                <p className="text-black font-medium">
                  {bookingData.pickupLocation.address || "Pickup Location"}
                </p>
              </div>
              <div>
                <p className="text-black font-medium">
                  {bookingData.dropoffLocation.address || "Dropoff Location"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center space-x-2 mb-2">
          <Calendar size={18} className="text-brand" />
          <span className="text-sm">
            {formatDate(bookingData.pickupDate)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={18} className="text-brand" />
          <span className="text-sm">{bookingData.pickupTime}</span>
        </div>
      </div>

      {/* Map */}
      <div className="h-40 bg-gray-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Map size={30} className="text-gray-400" />
        </div>
        <img
          src="https://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=12&size=600x300&key=YOUR_API_KEY"
          alt="Map"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Distance & Time */}
      <div className="grid grid-cols-2 border-t">
        <div className="p-3 border-r">
          <p className="text-xs text-gray-500">Total Distance</p>
          <p className="font-semibold">311 km/ 194 miles</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-500">Total Time</p>
          <p className="font-semibold">3h 43m</p>
        </div>
      </div>

      {showDetails && bookingData.vehicle && (
        <>
          {/* Vehicle */}
          <div className="p-4 border-t">
            <p className="text-xs text-gray-500">Vehicle</p>
            <p className="font-semibold">{bookingData.vehicle.name}</p>
          </div>

          {/* Extras */}
          {bookingData.extras.length > 0 && (
            <div className="p-4 border-t">
              <p className="text-xs text-gray-500 mb-2">Extra Options</p>
              {bookingData.extras.map((extra) => (
                <div key={extra.id} className="flex justify-between text-sm">
                  <span>{extra.quantity} x {extra.name}</span>
                  <span>${(extra.price * extra.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pricing */}
          <div className="p-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Selected vehicle</span>
              <span className="font-semibold">${vehiclePrice.toFixed(2)}</span>
            </div>
            {extrasPrice > 0 && (
              <div className="flex justify-between mb-2">
                <span className="font-medium">Extra options</span>
                <span className="font-semibold">${extrasPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Booking assurances */}
          {vehiclePrice > 0 && (
            <div className="p-4 border-t space-y-2">
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">+100,000 passengers transported</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">Instant confirmation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">All-inclusive pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">Secure Payment by credit card, debit card or Paypal</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RideSummary;
