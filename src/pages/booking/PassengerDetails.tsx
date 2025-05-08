
import { useBooking } from "@/contexts/BookingContext";
import RideSummary from "@/components/RideSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const PassengerDetails = () => {
  const { nextStep, bookingData, setPassengerDetails } = useBooking();
  const [formData, setFormData] = useState({
    firstName: bookingData.passengerDetails.firstName,
    lastName: bookingData.passengerDetails.lastName,
    email: bookingData.passengerDetails.email,
    phone: bookingData.passengerDetails.phone,
    notes: bookingData.passengerDetails.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = () => {
    setPassengerDetails(formData);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-normal mb-6">Passenger Details</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="firstName"
                placeholder="Name"
                value={formData.firstName}
                onChange={handleChange}
                className="p-3 bg-gray-50"
              />
              <Input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="p-3 bg-gray-50"
              />
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="p-3"
                />
              </div>
              <div>
                <Input
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="p-3"
                />
              </div>
            </div>

            {/* Options */}
            <h3 className="text-xl font-normal pt-4">Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select defaultValue="2">
                <SelectTrigger className="p-3 bg-gray-50">
                  <SelectValue placeholder="Passengers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Passenger</SelectItem>
                  <SelectItem value="2">2 Passengers</SelectItem>
                  <SelectItem value="3">3 Passengers</SelectItem>
                  <SelectItem value="4">4 Passengers</SelectItem>
                  <SelectItem value="5">5 Passengers</SelectItem>
                  <SelectItem value="6">6 Passengers</SelectItem>
                  <SelectItem value="7">7 Passengers</SelectItem>
                  <SelectItem value="8">8 Passengers</SelectItem>
                  <SelectItem value="9">9 Passengers</SelectItem>
                  <SelectItem value="10">10 Passengers</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="2">
                <SelectTrigger className="p-3 bg-gray-50">
                  <SelectValue placeholder="Luggage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Luggage</SelectItem>
                  <SelectItem value="1">1 Luggage</SelectItem>
                  <SelectItem value="2">2 Luggage</SelectItem>
                  <SelectItem value="3">3 Luggage</SelectItem>
                  <SelectItem value="4">4 Luggage</SelectItem>
                  <SelectItem value="5">5 Luggage</SelectItem>
                  <SelectItem value="6">6 Luggage</SelectItem>
                  <SelectItem value="7">7 Luggage</SelectItem>
                  <SelectItem value="8">8 Luggage</SelectItem>
                  <SelectItem value="9">9 Luggage</SelectItem>
                  <SelectItem value="10">10 Luggage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes to driver */}
            <div>
              <Textarea
                name="notes"
                placeholder="Notes to driver"
                value={formData.notes}
                onChange={handleChange}
                className="w-full h-28 p-3"
              />
            </div>

            {/* Continue Button */}
            <div className="mt-6">
              <Button 
                onClick={handleContinue} 
                className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto"
              >
                Continue <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <RideSummary />
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
