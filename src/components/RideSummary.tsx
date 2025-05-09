
import { useBooking } from "@/contexts/BookingContext";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Users, Briefcase } from "lucide-react";
import RideMap from "./RideMap";

const RideSummary = () => {
  const { bookingData, calculateTotal } = useBooking();
  const { pickupLocation, dropoffLocation, pickupDate, pickupTime, passengers, luggage, vehicle, extras } = bookingData;
  
  const formattedDate = format(pickupDate, "EEE, MMM d, yyyy");
  const { vehiclePrice, extrasPrice, total } = calculateTotal();
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-xl font-normal mb-6">Your Ride</h3>
        
        {/* Map View */}
        <RideMap className="mb-6" />

        {/* Pickup & Dropoff */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <MapPin size={16} className="text-brand mr-1" />
              <span>Pickup</span>
            </div>
            <div className="font-normal">
              {pickupLocation.address || "Not specified yet"}
            </div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <MapPin size={16} className="text-brand mr-1" />
              <span>Dropoff</span>
            </div>
            <div className="font-normal">
              {dropoffLocation.address || "Not specified yet"}
            </div>
          </div>
        </div>

        {/* Date, Time, Passengers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Calendar size={16} className="text-brand mr-1" />
              <span>Date</span>
            </div>
            <div className="font-normal">{formattedDate}</div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Clock size={16} className="text-brand mr-1" />
              <span>Time</span>
            </div>
            <div className="font-normal">
              {pickupTime ? 
                new Date(`2000-01-01T${pickupTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : "Not specified yet"}
            </div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Users size={16} className="text-brand mr-1" />
              <span>Passengers</span>
            </div>
            <div className="font-normal">{passengers}</div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Briefcase size={16} className="text-brand mr-1" />
              <span>Luggage</span>
            </div>
            <div className="font-normal">
              {luggage.small} small, {luggage.large} large
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicle */}
      {vehicle && (
        <div className="p-6 border-b">
          <h4 className="text-md font-medium mb-4">Selected Vehicle</h4>
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
              <img src={vehicle.image} alt={vehicle.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h5 className="font-medium">{vehicle.name}</h5>
              <p className="text-sm text-gray-500">{vehicle.category}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Extras */}
      {extras.length > 0 && (
        <div className="p-6 border-b">
          <h4 className="text-md font-medium mb-4">Selected Extras</h4>
          <ul className="space-y-2">
            {extras.map(extra => (
              <li key={extra.id} className="flex justify-between">
                <span>{extra.name} (x{extra.quantity})</span>
                <span>${(extra.price * extra.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Total */}
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between mb-2">
          <span>Vehicle Price</span>
          <span>${vehiclePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Extras</span>
          <span>${extrasPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-medium">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default RideSummary;
