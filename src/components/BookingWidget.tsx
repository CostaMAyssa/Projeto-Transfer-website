import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBooking } from "@/contexts/BookingContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, MapPin, Search, Users, Briefcase } from "lucide-react";
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
  const { t } = useTranslation();
  const {
    setBookingType,
    setPickupLocation,
    setDropoffLocation,
    setPickupDate,
    setPickupTime,
    setPassengers,
    setLuggage
  } = useBooking();
  
  const [bookingType, setWidgetBookingType] = useState<BookingType>("one-way");
  
  // One-way state
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState<[number, number] | undefined>();
  const [dropoffCoordinates, setDropoffCoordinates] = useState<[number, number] | undefined>();
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("12:00");
  const [passengers, setPassengerCount] = useState(1);
  const [smallLuggage, setSmallLuggage] = useState(0);
  const [largeLuggage, setLargeLuggage] = useState(0);

  // Round-trip state
  const [outboundDate, setOutboundDate] = useState<Date>(new Date());
  const [outboundTime, setOutboundTime] = useState("12:00");
  const [outboundPickupAddress, setOutboundPickupAddress] = useState("");
  const [outboundDropAddress, setOutboundDropAddress] = useState("");
  const [outboundPassengers, setOutboundPassengers] = useState(1);
  
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [returnTime, setReturnTime] = useState("12:00");
  const [returnPickupAddress, setReturnPickupAddress] = useState("");
  const [returnDropAddress, setReturnDropAddress] = useState("");
  const [returnPassengers, setReturnPassengers] = useState(1);
  const [durationDays, setDurationDays] = useState(0);

  // Hourly state
  const [durationHours, setDurationHours] = useState(1);
  const [hourlyPickupAddress, setHourlyPickupAddress] = useState("");
  const [hourlyDropAddress, setHourlyDropAddress] = useState("");
  const [hourlyDate, setHourlyDate] = useState<Date>(new Date());
  const [hourlyTime, setHourlyTime] = useState("12:00");
  const [hourlyPassengers, setHourlyPassengers] = useState(1);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update booking data in context based on booking type
    setBookingType(bookingType);
    
    if (bookingType === "one-way") {
      setPickupLocation({ address: pickupAddress, coordinates: pickupCoordinates });
      setDropoffLocation({ address: dropoffAddress, coordinates: dropoffCoordinates });
      setPickupDate(date);
      setPickupTime(time);
      setPassengers(passengers);
      setLuggage(smallLuggage, largeLuggage);
    } else if (bookingType === "round-trip") {
      setPickupLocation({ address: outboundPickupAddress });
      setDropoffLocation({ address: outboundDropAddress });
      setPickupDate(outboundDate);
      setPickupTime(outboundTime);
      setPassengers(outboundPassengers);
    } else if (bookingType === "hourly") {
      setPickupLocation({ address: hourlyPickupAddress });
      setDropoffLocation({ address: hourlyDropAddress });
      setPickupDate(hourlyDate);
      setPickupTime(hourlyTime);
      setPassengers(hourlyPassengers);
    }

    // Navigate to booking page
    navigate("/booking");
  };

  // Generate time options (24 hour format)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  // Generate duration hours options (1-12)
  const durationHoursOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'hora' : 'horas'}`
  }));
  
  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200",
      vertical 
        ? "p-4 w-full max-h-[500px] flex flex-col"
        : "max-w-5xl mx-auto p-6 -mt-36 relative z-10"
    )}>
      <Tabs defaultValue="one-way" className={cn("mb-4", vertical && "flex flex-col h-full min-h-0")}>
        <TabsList className={cn(
          vertical ? "grid grid-cols-2 mb-3 flex-shrink-0" : "grid grid-cols-4 mb-8"
        )}>
          <TabsTrigger value="one-way" onClick={() => setWidgetBookingType("one-way")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
            {t('booking.oneWay')}
          </TabsTrigger>
          <TabsTrigger value="round-trip" onClick={() => setWidgetBookingType("round-trip")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
            {t('booking.roundTrip')}
          </TabsTrigger>
          {!vertical && (
            <>
              <TabsTrigger value="hourly" onClick={() => setWidgetBookingType("hourly")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
                {t('booking.hourly')}
              </TabsTrigger>
              <TabsTrigger value="city-tour" onClick={() => setWidgetBookingType("city-tour")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
                {t('booking.cityTour')}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* ONE-WAY TAB */}
        <TabsContent value="one-way" className={cn("mt-0", vertical && "flex flex-col flex-1 min-h-0")}>
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col flex-1 min-h-0" : ""}>
            {vertical ? (
              <>
                {/* Scrollable content area */}
                <div className="flex-1 overflow-auto pr-2 -mr-2 pb-2">
                  <div className="flex flex-col space-y-3">
                    {/* Pick-up Location */}
                    <div className="space-y-2">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.pickupLocation')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterPickupLocation')}
                        value={pickupAddress}
                        onChange={setPickupAddress}
                        onAddressSelect={(location) => {
                          setPickupAddress(location.address);
                          setPickupCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>
                    
                    {/* Drop-off Location */}
                    <div className="space-y-2">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.dropoffLocation')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterDropoffLocation')}
                        value={dropoffAddress}
                        onChange={setDropoffAddress}
                        onAddressSelect={(location) => {
                          setDropoffAddress(location.address);
                          setDropoffCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>
                    
                    {/* Date & Time */}
                    <div className="space-y-2">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">Data & Hora</span>
                      </div>
                      <div className="space-y-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full h-8 justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {date ? format(date, "dd/MM/yyyy") : "Data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Select value={time} onValueChange={setTime}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="12:00" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {timeOptions.map((timeOption) => (
                              <SelectItem key={timeOption} value={timeOption}>
                                {timeOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Passengers */}
                    <div className="space-y-2">
                      <div className="flex items-center mb-1">
                        <Users size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.passengers')}</span>
                      </div>
                      <Select value={passengers.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="1 Passenger" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Passenger{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* 10kg Luggage */}
                    <div className="space-y-2">
                      <div className="flex items-center mb-1">
                        <Briefcase size={14} className="text-red-600 mr-1" />
                        <span className="text-xs font-medium text-red-600">{t('booking.luggage10kg')}</span>
                      </div>
                      <Select value={smallLuggage.toString()} onValueChange={(value) => setSmallLuggage(parseInt(value))}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* 23kg Luggage */}
                    <div className="space-y-2">
                      <div className="flex items-center mb-1">
                        <Briefcase size={14} className="text-red-600 mr-1" />
                        <span className="text-xs font-medium text-red-600">{t('booking.luggage23kg')}</span>
                      </div>
                      <Select value={largeLuggage.toString()} onValueChange={(value) => setLargeLuggage(parseInt(value))}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Fixed Submit Button */}
                <div className="flex-shrink-0 pt-3 border-t border-gray-100">
                  <Button 
                    type="submit"
                    className="bg-brand hover:bg-brand-600 text-white w-full h-8 rounded-lg font-medium text-sm"
                  >
                    <Search className="mr-2 h-3 w-3" />
                    {t('booking.findMyTransfer')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Pick-up Location */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <MapPin size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.pickupLocation')}</span>
                    </div>
                    <AddressAutocomplete
                      placeholder={t('booking.enterPickupLocation')}
                      value={pickupAddress}
                      onChange={setPickupAddress}
                      onAddressSelect={(location) => {
                        setPickupAddress(location.address);
                        setPickupCoordinates(location.coordinates);
                      }}
                      required
                    />
                  </div>
                  
                  {/* Drop-off Location */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <MapPin size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.dropoffLocation')}</span>
                    </div>
                    <AddressAutocomplete
                      placeholder={t('booking.enterDropoffLocation')}
                      value={dropoffAddress}
                      onChange={setDropoffAddress}
                      onAddressSelect={(location) => {
                        setDropoffAddress(location.address);
                        setDropoffCoordinates(location.coordinates);
                      }}
                      required
                    />
                  </div>
                  
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <CalendarIcon size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.pickupDate')}</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Time Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <Clock size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.pickupTime')}</span>
                    </div>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="12:00" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {timeOptions.map((timeOption) => (
                          <SelectItem key={timeOption} value={timeOption}>
                            {timeOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Second Row - Passengers and Luggage */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Passengers */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <Users size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.passengers')}</span>
                    </div>
                    <Select value={passengers.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="1 Passenger" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} Passenger{i > 0 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 10kg Luggage */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <Briefcase size={16} className="text-red-600 mr-1" />
                      <span className="text-sm font-medium text-red-600">{t('booking.luggage10kg')}</span>
                    </div>
                    <Select value={smallLuggage.toString()} onValueChange={(value) => setSmallLuggage(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="0" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 11 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 23kg Luggage */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <Briefcase size={16} className="text-red-600 mr-1" />
                      <span className="text-sm font-medium text-red-600">{t('booking.luggage23kg')}</span>
                    </div>
                    <Select value={largeLuggage.toString()} onValueChange={(value) => setLargeLuggage(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="0" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 11 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="bg-brand hover:bg-brand-600 text-white mt-6 w-full py-3 rounded-lg font-medium"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('booking.findMyTransfer')}
                </Button>
              </>
            )}
          </form>
        </TabsContent>

        {/* ROUND-TRIP TAB */}
        <TabsContent value="round-trip" className={cn("mt-0", vertical && "flex flex-col flex-1 min-h-0")}>
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col flex-1 min-h-0" : "space-y-6"}>
            {vertical ? (
              <>
                {/* Scrollable content area */}
                <div className="flex-1 overflow-auto pr-2 -mr-2 pb-2">
                  <div className="flex flex-col space-y-2">
                    {/* Pick-Up (Outbound) Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-brand mb-1">Pick-Up (Outbound)</div>
                      
                      {/* Outbound Date & Time */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <CalendarIcon size={14} className="text-brand mr-1" />
                          <span className="text-xs font-medium">Data & Hora</span>
                        </div>
                        <div className="space-y-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "w-full h-8 justify-start text-left font-normal",
                                  !outboundDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {outboundDate ? format(outboundDate, "dd/MM") : "Data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={outboundDate}
                                onSelect={(selectedDate) => selectedDate && setOutboundDate(selectedDate)}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Select value={outboundTime} onValueChange={setOutboundTime}>
                            <SelectTrigger className="w-full h-8">
                              <SelectValue placeholder="12:00" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                              {timeOptions.map((timeOption) => (
                                <SelectItem key={timeOption} value={timeOption}>
                                  {timeOption}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Outbound Pickup Address */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="text-brand mr-1" />
                          <span className="text-xs font-medium">Local de Embarque</span>
                        </div>
                        <AddressAutocomplete
                          placeholder="Digite o local de embarque"
                          value={outboundPickupAddress}
                          onChange={setOutboundPickupAddress}
                          onAddressSelect={(location) => setOutboundPickupAddress(location.address)}
                          required
                        />
                      </div>

                      {/* Outbound Drop Address */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="text-gray-500 mr-1" />
                          <span className="text-xs font-medium">Local de Destino</span>
                        </div>
                        <AddressAutocomplete
                          placeholder="Digite o local de destino"
                          value={outboundDropAddress}
                          onChange={setOutboundDropAddress}
                          onAddressSelect={(location) => setOutboundDropAddress(location.address)}
                          required
                        />
                      </div>

                      {/* Outbound Passengers */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <Users size={14} className="text-brand mr-1" />
                          <span className="text-xs font-medium">Passageiros</span>
                        </div>
                        <Select value={outboundPassengers.toString()} onValueChange={(value) => setOutboundPassengers(parseInt(value))}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="1 Passageiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} Passageiro{i > 0 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Return Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-green-600 mb-1">Return</div>
                      
                      {/* Return Date & Time */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <CalendarIcon size={14} className="text-green-600 mr-1" />
                          <span className="text-xs font-medium">Data & Hora</span>
                        </div>
                        <div className="space-y-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "w-full h-8 justify-start text-left font-normal",
                                  !returnDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {returnDate ? format(returnDate, "dd/MM") : "Data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={returnDate}
                                onSelect={(selectedDate) => selectedDate && setReturnDate(selectedDate)}
                                disabled={(date) => date < outboundDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Select value={returnTime} onValueChange={setReturnTime}>
                            <SelectTrigger className="w-full h-8">
                              <SelectValue placeholder="12:00" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                              {timeOptions.map((timeOption) => (
                                <SelectItem key={timeOption} value={timeOption}>
                                  {timeOption}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Return Pickup Address */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="text-green-600 mr-1" />
                          <span className="text-xs font-medium">Local de Embarque</span>
                        </div>
                        <AddressAutocomplete
                          placeholder="Digite o local de embarque"
                          value={returnPickupAddress}
                          onChange={setReturnPickupAddress}
                          onAddressSelect={(location) => setReturnPickupAddress(location.address)}
                          required
                        />
                      </div>

                      {/* Return Drop Address */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="text-gray-500 mr-1" />
                          <span className="text-xs font-medium">Local de Destino</span>
                        </div>
                        <AddressAutocomplete
                          placeholder="Digite o local de destino"
                          value={returnDropAddress}
                          onChange={setReturnDropAddress}
                          onAddressSelect={(location) => setReturnDropAddress(location.address)}
                          required
                        />
                      </div>

                      {/* Return Passengers */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <Users size={14} className="text-green-600 mr-1" />
                          <span className="text-xs font-medium">Passageiros</span>
                        </div>
                        <Select value={returnPassengers.toString()} onValueChange={(value) => setReturnPassengers(parseInt(value))}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="1 Passageiro" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} Passageiro{i > 0 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Duration Days */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Clock size={14} className="text-blue-600 mr-1" />
                        <span className="text-xs font-medium">Duração (dias)</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={durationDays}
                        onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                        placeholder="0 = bate-volta"
                        className="w-full h-8"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Fixed Submit Button */}
                <div className="flex-shrink-0 pt-3 border-t border-gray-100">
                  <Button 
                    type="submit"
                    className="bg-brand hover:bg-brand-600 text-white w-full h-8 rounded-lg font-medium text-sm"
                  >
                    <Search className="mr-2 h-3 w-3" />
                    {t('booking.findMyTransfer')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Pick-Up (Outbound) Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MapPin size={18} className="text-brand mr-2" />
                    Pick-Up (Outbound)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Outbound Date & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={14} className="text-brand mr-1" />
                        <span className="text-sm font-medium">Data & Hora</span>
                      </div>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !outboundDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              {outboundDate ? format(outboundDate, "dd/MM") : "Data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={outboundDate}
                              onSelect={(selectedDate) => selectedDate && setOutboundDate(selectedDate)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Select value={outboundTime} onValueChange={setOutboundTime}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="12:00" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {timeOptions.map((timeOption) => (
                              <SelectItem key={timeOption} value={timeOption}>
                                {timeOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Outbound Pickup Address */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-brand mr-1" />
                        <span className="text-sm font-medium">Local de Embarque</span>
                      </div>
                      <AddressAutocomplete
                        placeholder="Digite o local de embarque"
                        value={outboundPickupAddress}
                        onChange={setOutboundPickupAddress}
                        onAddressSelect={(location) => setOutboundPickupAddress(location.address)}
                        required
                      />
                    </div>

                    {/* Outbound Drop Address */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-gray-500 mr-1" />
                        <span className="text-sm font-medium">Local de Destino</span>
                      </div>
                      <AddressAutocomplete
                        placeholder="Digite o local de destino"
                        value={outboundDropAddress}
                        onChange={setOutboundDropAddress}
                        onAddressSelect={(location) => setOutboundDropAddress(location.address)}
                        required
                      />
                    </div>

                    {/* Outbound Passengers */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Users size={14} className="text-brand mr-1" />
                        <span className="text-sm font-medium">Passageiros</span>
                      </div>
                      <Select value={outboundPassengers.toString()} onValueChange={(value) => setOutboundPassengers(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="1 Passageiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Passageiro{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Return Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MapPin size={18} className="text-green-600 mr-2" />
                    Return
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Return Date & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={14} className="text-green-600 mr-1" />
                        <span className="text-sm font-medium">Data & Hora</span>
                      </div>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !returnDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              {returnDate ? format(returnDate, "dd/MM") : "Data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={returnDate}
                              onSelect={(selectedDate) => selectedDate && setReturnDate(selectedDate)}
                              disabled={(date) => date < outboundDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Select value={returnTime} onValueChange={setReturnTime}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="12:00" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            {timeOptions.map((timeOption) => (
                              <SelectItem key={timeOption} value={timeOption}>
                                {timeOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Return Pickup Address */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-green-600 mr-1" />
                        <span className="text-sm font-medium">Local de Embarque</span>
                      </div>
                      <AddressAutocomplete
                        placeholder="Digite o local de embarque"
                        value={returnPickupAddress}
                        onChange={setReturnPickupAddress}
                        onAddressSelect={(location) => setReturnPickupAddress(location.address)}
                        required
                      />
                    </div>

                    {/* Return Drop Address */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-gray-500 mr-1" />
                        <span className="text-sm font-medium">Local de Destino</span>
                      </div>
                      <AddressAutocomplete
                        placeholder="Digite o local de destino"
                        value={returnDropAddress}
                        onChange={setReturnDropAddress}
                        onAddressSelect={(location) => setReturnDropAddress(location.address)}
                        required
                      />
                    </div>

                    {/* Return Passengers */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Users size={14} className="text-green-600 mr-1" />
                        <span className="text-sm font-medium">Passageiros</span>
                      </div>
                      <Select value={returnPassengers.toString()} onValueChange={(value) => setReturnPassengers(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="1 Passageiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} Passageiro{i > 0 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Duration Days */}
                <div className="space-y-1">
                  <div className="flex items-center mb-1">
                    <Clock size={14} className="text-blue-600 mr-1" />
                    <span className="text-sm font-medium">Duração (dias)</span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                    placeholder="0 = bate-volta"
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="bg-brand hover:bg-brand-600 text-white w-full py-3 rounded-lg font-medium"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('booking.findMyTransfer')}
                </Button>
              </>
            )}
          </form>
        </TabsContent>

        {/* HOURLY TAB */}
        <TabsContent value="hourly" className="mt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={cn(
              vertical 
                ? "flex flex-col gap-3" 
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            )}>
              {/* Duration Hours */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <Clock size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Duração (horas)</span>
                </div>
                <Select value={durationHours.toString()} onValueChange={(value) => setDurationHours(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="1 hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationHoursOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pickup Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <CalendarIcon size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Data & Hora</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !hourlyDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        {hourlyDate ? format(hourlyDate, "dd/MM") : "Data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={hourlyDate}
                        onSelect={(selectedDate) => selectedDate && setHourlyDate(selectedDate)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Select value={hourlyTime} onValueChange={setHourlyTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="12:00" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {timeOptions.map((timeOption) => (
                        <SelectItem key={timeOption} value={timeOption}>
                          {timeOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <MapPin size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Local de Embarque</span>
                </div>
                <AddressAutocomplete
                  placeholder="Digite o local de embarque"
                  value={hourlyPickupAddress}
                  onChange={setHourlyPickupAddress}
                  onAddressSelect={(location) => setHourlyPickupAddress(location.address)}
                  required
                />
              </div>

              {/* Drop Address (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <MapPin size={16} className="text-gray-500 mr-1" />
                  <span className="text-sm font-medium">Local de Destino (opcional)</span>
                </div>
                <AddressAutocomplete
                  placeholder="Digite o local de destino (opcional)"
                  value={hourlyDropAddress}
                  onChange={setHourlyDropAddress}
                  onAddressSelect={(location) => setHourlyDropAddress(location.address)}
                />
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <div className="flex items-center mb-1">
                  <Users size={16} className="text-brand mr-1" />
                  <span className="text-sm font-medium">Passageiros</span>
                </div>
                <Select value={hourlyPassengers.toString()} onValueChange={(value) => setHourlyPassengers(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="1 Passageiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} Passageiro{i > 0 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              className="bg-brand hover:bg-brand-600 text-white mt-6 w-full py-3 rounded-lg font-medium"
            >
              <Search className="mr-2 h-4 w-4" />
              {t('booking.findMyTransfer')}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="city-tour" className="mt-0">
          <div className="text-center p-8">
            <p className="text-gray-600">City tour booking form will be available soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingWidget;
