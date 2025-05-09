import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, MapPin, Search, Users, Briefcase, ChevronRight } from "lucide-react";
import { BookingType } from "@/types/booking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddressAutocomplete from "./AddressAutocomplete";

interface BookingWidgetProps {
  vertical?: boolean;
}

const BookingWidget = ({ vertical = false }: BookingWidgetProps) => {
  const navigate = useNavigate();
  const {
    bookingData,
    setBookingType,
    setPickupLocation,
    setDropoffLocation,
    setPickupDate,
    setPickupTime,
    setPassengers,
    setLuggage
  } = useBooking();
  const [bookingType, setWidgetBookingType] = useState<BookingType>("one-way");
  
  // Separate state for the entered and selected values
  const [pickupAddress, setPickupAddress] = useState("");
  const [selectedPickupAddress, setSelectedPickupAddress] = useState("");
  
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [selectedDropoffAddress, setSelectedDropoffAddress] = useState("");
  
  const [pickupCoordinates, setPickupCoordinates] = useState<[number, number] | undefined>(
    bookingData.pickupLocation.coordinates
  );
  const [dropoffCoordinates, setDropoffCoordinates] = useState<[number, number] | undefined>(
    bookingData.dropoffLocation.coordinates
  );
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("12:00");
  const [passengers, setPassengerCount] = useState(1);
  const [smallLuggage, setSmallLuggage] = useState(0);
  const [largeLuggage, setLargeLuggage] = useState(0);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use the selected addresses from state for consistency
    const finalPickupAddress = selectedPickupAddress || pickupAddress;
    const finalDropoffAddress = selectedDropoffAddress || dropoffAddress;
    
    console.log("Form submitted with pickup:", finalPickupAddress, pickupCoordinates);
    console.log("Form submitted with dropoff:", finalDropoffAddress, dropoffCoordinates);

    // Update booking data in context
    setBookingType(bookingType);
    setPickupLocation({
      address: finalPickupAddress,
      coordinates: pickupCoordinates
    });
    setDropoffLocation({
      address: finalDropoffAddress,
      coordinates: dropoffCoordinates
    });
    setPickupDate(date);
    setPickupTime(time);
    setPassengers(passengers);
    setLuggage(smallLuggage, largeLuggage);

    // Navigate to booking page
    navigate("/booking");
  };

  const handlePickupAddressSelect = (location: { address: string; coordinates?: [number, number] }) => {
    console.log("Pickup location selected:", location);
    // Store both the input value and selected address
    setPickupAddress(location.address);
    setSelectedPickupAddress(location.address);
    setPickupCoordinates(location.coordinates);
    
    // Also update the booking context immediately for consistency
    setPickupLocation({
      address: location.address,
      coordinates: location.coordinates
    });
  };

  const handleDropoffAddressSelect = (location: { address: string; coordinates?: [number, number] }) => {
    console.log("Dropoff location selected:", location);
    // Store both the input value and selected address
    setDropoffAddress(location.address);
    setSelectedDropoffAddress(location.address);
    setDropoffCoordinates(location.coordinates);
    
    // Also update the booking context immediately for consistency
    setDropoffLocation({
      address: location.address,
      coordinates: location.coordinates
    });
  };

  // Handler for pickup address input changes
  const handlePickupAddressChange = (value: string) => {
    setPickupAddress(value);
    // Keep track of whether this is user input or a selection
    if (value !== selectedPickupAddress) {
      setSelectedPickupAddress("");
    }
  };

  // Handler for dropoff address input changes
  const handleDropoffAddressChange = (value: string) => {
    setDropoffAddress(value);
    // Keep track of whether this is user input or a selection
    if (value !== selectedDropoffAddress) {
      setSelectedDropoffAddress("");
    }
  };
  
  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200",
      vertical 
        ? "p-4 w-full h-auto" // Removed max-height and overflow to prevent scrolling
        : "max-w-5xl mx-auto p-6 -mt-36 relative z-10"
    )}>
      <Tabs defaultValue="one-way" className={cn("mb-4", vertical && "flex flex-col")}>
        <TabsList className={cn(
          vertical ? "grid grid-cols-2 mb-4" : "grid grid-cols-4 mb-8"
        )}>
          <TabsTrigger value="one-way" onClick={() => setWidgetBookingType("one-way")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
            One-way
          </TabsTrigger>
          <TabsTrigger value="round-trip" onClick={() => setWidgetBookingType("round-trip")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
            Round-trip
          </TabsTrigger>
          {!vertical && (
            <>
              <TabsTrigger value="hourly" onClick={() => setWidgetBookingType("hourly")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
                Hourly
              </TabsTrigger>
              <TabsTrigger value="city-tour" onClick={() => setWidgetBookingType("city-tour")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
                City Tour
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="one-way" className="mt-0">
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col space-y-3" : ""}>
            <div className={cn(
              vertical 
                ? "flex flex-col gap-3" 
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            )}>
              {/* Pick-up Location */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <MapPin size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Pick-up Location</span>
                </div>
                <AddressAutocomplete
                  placeholder="Enter pick-up location"
                  value={pickupAddress}
                  onChange={handlePickupAddressChange}
                  onAddressSelect={handlePickupAddressSelect}
                  required
                />
              </div>
              
              {/* Drop-off Location */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <MapPin size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Drop-off Location</span>
                </div>
                <AddressAutocomplete
                  placeholder="Enter drop-off location"
                  value={dropoffAddress}
                  onChange={handleDropoffAddressChange}
                  onAddressSelect={handleDropoffAddressSelect}
                  required
                />
              </div>
              
              {/* Date Picker */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <CalendarIcon size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Pick-up Date</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={date => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Time Picker */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <Clock size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Pick-up Time</span>
                </div>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00:00">12:00 AM</SelectItem>
                    <SelectItem value="01:00">01:00 AM</SelectItem>
                    <SelectItem value="02:00">02:00 AM</SelectItem>
                    <SelectItem value="03:00">03:00 AM</SelectItem>
                    <SelectItem value="04:00">04:00 AM</SelectItem>
                    <SelectItem value="05:00">05:00 AM</SelectItem>
                    <SelectItem value="06:00">06:00 AM</SelectItem>
                    <SelectItem value="07:00">07:00 AM</SelectItem>
                    <SelectItem value="08:00">08:00 AM</SelectItem>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">01:00 PM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                    <SelectItem value="17:00">05:00 PM</SelectItem>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                    <SelectItem value="19:00">07:00 PM</SelectItem>
                    <SelectItem value="20:00">08:00 PM</SelectItem>
                    <SelectItem value="21:00">09:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Second Row - Passengers, Luggage, Search Button */}
            <div className={cn(
              vertical 
                ? "flex flex-col space-y-3 mt-3" 
                : "grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
            )}>
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <Users size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Passengers</span>
                </div>
                <Select value={passengers.toString()} onValueChange={value => setPassengerCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select passengers" />
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
              </div>
              
              <div className={vertical ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2"}>
                <div className="space-y-2">
                  <div className="flex items-center mb-1">
                    <Briefcase size={16} className="text-brand mr-1" />
                    <span className="text-sm font-medium">10kg Luggage</span>
                  </div>
                  <Select value={smallLuggage.toString()} onValueChange={value => setSmallLuggage(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Small luggage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center mb-1">
                    <Briefcase size={16} className="text-brand mr-1" />
                    <span className="text-sm font-medium">23kg Luggage</span>
                  </div>
                  <Select value={largeLuggage.toString()} onValueChange={value => setLargeLuggage(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Large luggage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className={cn(vertical ? "mt-auto pt-2" : "flex justify-center")}>
                <Button type="submit" size="lg" className="bg-brand hover:bg-brand-600 text-white w-full self-end">
                  <Search size={18} className="mr-2" />
                  Find My Transfer
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="round-trip">
          <div className="text-center p-4">
            <p>Round-trip booking form will be available soon.</p>
          </div>
        </TabsContent>

        <TabsContent value="hourly">
          <div className="text-center p-4">
            <p>Hourly booking form will be available soon.</p>
          </div>
        </TabsContent>

        <TabsContent value="city-tour">
          <div className="text-center p-4">
            <p>City tour booking form will be available soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default BookingWidget;
