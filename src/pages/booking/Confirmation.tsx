
import { useBooking } from "@/contexts/BookingContext";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const Confirmation = () => {
  const { bookingData, reservationId } = useBooking();
  
  const formatDate = (date: Date) => {
    return format(date, "EEE, MMM dd, yyyy");
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Success Message */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-brand flex items-center justify-center">
            <Check size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-normal mb-2">System, your order was submitted successfully!</h1>
        <p className="text-gray-600">
          Booking details has been sent to: booking@luxride.com
        </p>
      </div>

      {/* Order Summary */}
      <div className="border rounded-lg overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 p-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Order Number</p>
            <p className="font-normal">{reservationId}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Date</p>
            <p className="font-normal">{formatDate(bookingData.pickupDate)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Total</p>
            <p className="font-normal">
              ${bookingData.vehicle ? bookingData.vehicle.price.toFixed(2) : "0.00"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Payment Method</p>
            <p className="font-normal">Direct Bank Transfer</p>
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="border rounded-lg overflow-hidden mb-8">
        <h2 className="bg-gray-50 p-4 font-normal border-b">Reservation Information</h2>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">Pick Up Address</p>
              <p className="font-normal">{bookingData.pickupLocation.address || "London City Airport (LCY)"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Drop Off Address</p>
              <p className="font-normal">{bookingData.dropoffLocation.address || "London City Airport (LCY)"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Pick Up Date</p>
              <p className="font-normal">{formatDate(bookingData.pickupDate)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Pick Up Time</p>
              <p className="font-normal">{bookingData.pickupTime}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Distance</p>
              <p className="font-normal">311 km/ 194 miles</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Time</p>
              <p className="font-normal">3h 43m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Vehicle */}
      {bookingData.vehicle && (
        <div className="border rounded-lg overflow-hidden mb-8">
          <h2 className="bg-gray-50 p-4 font-normal border-b">Selected Car</h2>
          
          <div className="p-6">
            <img 
              src={bookingData.vehicle.image} 
              alt={bookingData.vehicle.name} 
              className="w-full max-h-56 object-contain mb-6" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Class</p>
                <p className="font-normal">{bookingData.vehicle.category}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Cars</p>
                <p className="font-normal">{bookingData.vehicle.models.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return to Home Button */}
      <div className="text-center mt-8">
        <Button asChild className="bg-brand hover:bg-brand-600 text-white px-8 py-6 text-lg">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
