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
    setLuggage,
    setRoundTripData,
    setHourlyData
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
  const [outboundPickupCoordinates, setOutboundPickupCoordinates] = useState<[number, number] | undefined>();
  const [outboundDropCoordinates, setOutboundDropCoordinates] = useState<[number, number] | undefined>();
  const [outboundPassengers, setOutboundPassengers] = useState(1);
  
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [returnTime, setReturnTime] = useState("12:00");
  const [returnPickupAddress, setReturnPickupAddress] = useState("");
  const [returnDropAddress, setReturnDropAddress] = useState("");
  const [returnPickupCoordinates, setReturnPickupCoordinates] = useState<[number, number] | undefined>();
  const [returnDropCoordinates, setReturnDropCoordinates] = useState<[number, number] | undefined>();
  const [returnPassengers, setReturnPassengers] = useState(1);
  const [durationDays, setDurationDays] = useState(0);

  // Hourly state
  const [durationHours, setDurationHours] = useState(1);
  const [hourlyPickupAddress, setHourlyPickupAddress] = useState("");
  const [hourlyDropAddress, setHourlyDropAddress] = useState("");
  const [hourlyPickupCoordinates, setHourlyPickupCoordinates] = useState<[number, number] | undefined>();
  const [hourlyDropCoordinates, setHourlyDropCoordinates] = useState<[number, number] | undefined>();
  const [hourlyDate, setHourlyDate] = useState<Date>(new Date());
  const [hourlyTime, setHourlyTime] = useState("12:00");
  const [hourlyPassengers, setHourlyPassengers] = useState(1);
  
  // Hourly specific fields
  const [orderType, setOrderType] = useState<"airport-dropoff" | "pickup">("airport-dropoff"); // airport-dropoff or pickup
  const [departureAirport, setDepartureAirport] = useState("");
  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [noFlightInfo, setNoFlightInfo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 BookingWidget - handleSubmit chamado', {
      bookingType,
      oneWayCoords: { pickup: pickupCoordinates, dropoff: dropoffCoordinates },
      roundTripCoords: { 
        outboundPickup: outboundPickupCoordinates, 
        outboundDrop: outboundDropCoordinates,
        returnPickup: returnPickupCoordinates,
        returnDrop: returnDropCoordinates
      },
      hourlyCoords: { pickup: hourlyPickupCoordinates, dropoff: hourlyDropCoordinates }
    });
    
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
      // Save main fields for compatibility
      setPickupLocation({ address: outboundPickupAddress, coordinates: outboundPickupCoordinates });
      setDropoffLocation({ address: outboundDropAddress, coordinates: outboundDropCoordinates });
      setPickupDate(outboundDate);
      setPickupTime(outboundTime);
      setPassengers(outboundPassengers);
      setLuggage(smallLuggage, largeLuggage);
      
      // Save complete round trip data
      setRoundTripData({
        outboundPickupLocation: { address: outboundPickupAddress, coordinates: outboundPickupCoordinates },
        outboundDropoffLocation: { address: outboundDropAddress, coordinates: outboundDropCoordinates },
        outboundDate,
        outboundTime,
        outboundPassengers,
        returnPickupLocation: { address: returnPickupAddress, coordinates: returnPickupCoordinates },
        returnDropoffLocation: { address: returnDropAddress, coordinates: returnDropCoordinates },
        returnDate,
        returnTime,
        returnPassengers,
        durationDays
      });
    } else if (bookingType === "hourly") {
      // Save main fields for compatibility
      setPickupLocation({ address: hourlyPickupAddress, coordinates: hourlyPickupCoordinates });
      setDropoffLocation({ address: departureAirport, coordinates: hourlyDropCoordinates });
      setPickupDate(hourlyDate);
      setPickupTime(hourlyTime);
      setPassengers(hourlyPassengers);
      setLuggage(smallLuggage, largeLuggage);
      
      // Save complete hourly data
      setHourlyData({
        pickupLocation: { address: hourlyPickupAddress, coordinates: hourlyPickupCoordinates },
        dropoffLocation: { address: departureAirport, coordinates: hourlyDropCoordinates },
        date: hourlyDate,
        time: hourlyTime,
        passengers: hourlyPassengers,
        durationHours,
        orderType,
        departureAirport,
        airline,
        flightNumber,
        noFlightInfo
      });
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
    label: `${i + 1} ${i === 0 ? t('booking.hour') : t('booking.hours')}`
  }));
  
  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200",
      vertical 
        ? "p-4 w-full flex flex-col" // Removido max-h-[500px] para eliminar scroll
        : "max-w-7xl mx-auto p-8 -mt-36 relative z-10"
    )}>
      <Tabs defaultValue="one-way" className={cn("mb-4", vertical && "flex flex-col")}>
        <TabsList className={cn(
          vertical ? "grid grid-cols-3 mb-3 flex-shrink-0" : "grid grid-cols-4 mb-8 w-full"
        )}>
          <TabsTrigger value="one-way" onClick={() => setWidgetBookingType("one-way")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
            {t('booking.oneWay')}
          </TabsTrigger>
          <TabsTrigger value="round-trip" onClick={() => setWidgetBookingType("round-trip")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
            {t('booking.roundTrip')}
          </TabsTrigger>
          <TabsTrigger value="hourly" onClick={() => setWidgetBookingType("hourly")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
            {t('booking.hourly')}
          </TabsTrigger>
          {!vertical && (
            <TabsTrigger value="city-tour" onClick={() => setWidgetBookingType("city-tour")} className="data-[state=active]:bg-brand data-[state=active]:text-white">
              {t('booking.cityTour')}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ONE-WAY TAB */}
        <TabsContent value="one-way" className={cn("mt-0", vertical && "flex flex-col")}>
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col" : ""}>
            {vertical ? (
              <>
                {/* Layout compacto sem scroll - organizando em grid */}
                <div className="space-y-3">
                  {/* Linha 1: Localizações lado a lado */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Pick-up Location */}
                    <div className="space-y-1">
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
                    <div className="space-y-1">
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
                  </div>
                  
                  {/* Linha 2: Data e Hora lado a lado */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Date */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.dateTime')}</span>
                      </div>
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
                            {date ? format(date, "dd/MM") : t('booking.pickADate')}
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
                    
                    {/* Time */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Clock size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">&nbsp;</span>
                      </div>
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
                  
                  {/* Linha 3: Passageiros */}
                  <div className="space-y-1">
                    <div className="flex items-center mb-1">
                      <Users size={14} className="text-brand mr-1" />
                      <span className="text-xs font-medium">{t('booking.passengers')}</span>
                    </div>
                    <Select value={passengers.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder={`1 ${t('booking.passenger')}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? t('booking.passenger') : t('booking.passengers')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Linha 4: Bagagens lado a lado */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* 10kg Luggage */}
                    <div className="space-y-1">
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
                    <div className="space-y-1">
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
                  
                  {/* Linha 5: Botão de submissão */}
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      className="bg-brand hover:bg-brand-600 text-white w-full h-9 rounded-lg font-medium text-sm"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {t('booking.findMyTransfer')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Primeira linha - Localizações mais largas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Pick-up Location */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <MapPin size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.pickupLocation')}</span>
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
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <MapPin size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.dropoffLocation')}</span>
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
                  </div>
                  
                {/* Segunda linha - Data, Hora e Passageiros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {/* Date Picker */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <CalendarIcon size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.pickupDate')}</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy") : <span>{t('booking.pickADate')}</span>}
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
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Clock size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.pickupTime')}</span>
                    </div>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="h-11">
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
                
                  {/* Passengers */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Users size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.passengers')}</span>
                    </div>
                    <Select value={passengers.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={`1 ${t('booking.passenger')}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? t('booking.passenger') : t('booking.passengers')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="space-y-3">
                    <div className="mb-2 h-6"></div>
                    <Button 
                      type="submit"
                      className="bg-brand hover:bg-brand-600 text-white w-full h-11 rounded-lg font-medium text-base"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {t('booking.findMyTransfer')}
                    </Button>
                  </div>
                </div>
                
                {/* Terceira linha - Bagagem */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 10kg Luggage */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Briefcase size={18} className="text-red-600 mr-2" />
                      <span className="text-base font-medium text-red-600">{t('booking.luggage10kg')}</span>
                    </div>
                    <Select value={smallLuggage.toString()} onValueChange={(value) => setSmallLuggage(parseInt(value))}>
                      <SelectTrigger className="h-11">
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
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Briefcase size={18} className="text-red-600 mr-2" />
                      <span className="text-base font-medium text-red-600">{t('booking.luggage23kg')}</span>
                    </div>
                    <Select value={largeLuggage.toString()} onValueChange={(value) => setLargeLuggage(parseInt(value))}>
                      <SelectTrigger className="h-11">
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
              </>
            )}
          </form>
        </TabsContent>

        {/* ROUND-TRIP TAB */}
        <TabsContent value="round-trip" className={cn("mt-0", vertical && "flex flex-col")}>
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col" : "space-y-6"}>
            {vertical ? (
              <>
                {/* Layout compacto sem scroll */}
                <div className="space-y-3">
                  {/* Seção IDA */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-brand mb-1 border-b border-brand/20 pb-1">
                      {t('booking.pickupOutbound')}
                    </div>
                    
                    {/* Data e Hora da Ida */}
                    <div className="grid grid-cols-2 gap-2">
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
                              {outboundDate ? format(outboundDate, "dd/MM") : t('booking.date')}
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
                      </div>
                      <div className="space-y-1">
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

                    {/* Endereços da Ida */}
                    <div className="space-y-2">
                      <AddressAutocomplete
                        placeholder={t('booking.enterPickupLocation')}
                        value={outboundPickupAddress}
                        onChange={setOutboundPickupAddress}
                        onAddressSelect={(location) => {
                          setOutboundPickupAddress(location.address);
                          setOutboundPickupCoordinates(location.coordinates);
                        }}
                        required
                      />
                      <AddressAutocomplete
                        placeholder={t('booking.enterDropLocation')}
                        value={outboundDropAddress}
                        onChange={setOutboundDropAddress}
                        onAddressSelect={(location) => {
                          setOutboundDropAddress(location.address);
                          setOutboundDropCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>

                    {/* Passageiros da Ida */}
                    <div className="space-y-1">
                      <Select value={outboundPassengers.toString()} onValueChange={(value) => setOutboundPassengers(parseInt(value))}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={`1 ${t('booking.passenger')}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} {i === 0 ? t('booking.passenger') : t('booking.passengers')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Seção VOLTA */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-green-600 mb-1 border-b border-green-600/20 pb-1">
                      {t('booking.returnTrip')}
                    </div>
                    
                    {/* Data e Hora da Volta */}
                    <div className="grid grid-cols-2 gap-2">
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
                              {returnDate ? format(returnDate, "dd/MM") : t('booking.date')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={returnDate}
                              onSelect={(selectedDate) => selectedDate && setReturnDate(selectedDate)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
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

                    {/* Endereços da Volta */}
                    <div className="space-y-2">
                      <AddressAutocomplete
                        placeholder={t('booking.enterPickupLocation')}
                        value={returnPickupAddress}
                        onChange={setReturnPickupAddress}
                        onAddressSelect={(location) => {
                          setReturnPickupAddress(location.address);
                          setReturnPickupCoordinates(location.coordinates);
                        }}
                        required
                      />
                      <AddressAutocomplete
                        placeholder={t('booking.enterDropLocation')}
                        value={returnDropAddress}
                        onChange={setReturnDropAddress}
                        onAddressSelect={(location) => {
                          setReturnDropAddress(location.address);
                          setReturnDropCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Configurações Gerais */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1 border-b border-gray-200 pb-1">
                      {t('booking.generalSettings')}
                    </div>
                    
                    {/* Bagagens lado a lado */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-red-600">{t('booking.luggage10kg')}</span>
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
                      
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-red-600">{t('booking.luggage23kg')}</span>
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
                  
                  {/* Botão de submissão */}
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      className="bg-brand hover:bg-brand-600 text-white w-full h-9 rounded-lg font-medium text-sm"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {t('booking.findMyTransfer')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Pick-Up (Outbound) Section */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-xl font-medium mb-6 flex items-center">
                    <MapPin size={20} className="text-brand mr-2" />
                    {t('booking.pickupOutbound')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Outbound Date & Time */}
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <CalendarIcon size={18} className="text-brand mr-2" />
                        <span className="text-base font-medium">{t('booking.dateTime')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal h-11",
                                !outboundDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              {outboundDate ? format(outboundDate, "dd/MM") : t('booking.date')}
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
                          <SelectTrigger className="flex-1 h-11">
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
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <MapPin size={18} className="text-brand mr-2" />
                        <span className="text-base font-medium">{t('booking.pickupLocation')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterPickupLocation')}
                        value={outboundPickupAddress}
                        onChange={setOutboundPickupAddress}
                        onAddressSelect={(location) => {
                          setOutboundPickupAddress(location.address);
                          setOutboundPickupCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>

                    {/* Outbound Drop Address */}
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <MapPin size={18} className="text-gray-500 mr-2" />
                        <span className="text-base font-medium">{t('booking.dropLocation')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterDropLocation')}
                        value={outboundDropAddress}
                        onChange={setOutboundDropAddress}
                        onAddressSelect={(location) => {
                          setOutboundDropAddress(location.address);
                          setOutboundDropCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>

                    {/* Outbound Passengers */}
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <Users size={18} className="text-brand mr-2" />
                        <span className="text-base font-medium">{t('booking.passengers')}</span>
                      </div>
                      <Select value={outboundPassengers.toString()} onValueChange={(value) => setOutboundPassengers(parseInt(value))}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={`1 ${t('booking.passenger')}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} {i === 0 ? t('booking.passenger') : t('booking.passengers')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Return Section */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-xl font-medium mb-6 flex items-center">
                    <MapPin size={20} className="text-green-600 mr-2" />
                    {t('booking.return')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Return Date & Time */}
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <CalendarIcon size={18} className="text-green-600 mr-2" />
                        <span className="text-base font-medium">{t('booking.dateTime')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal h-11",
                                !returnDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              {returnDate ? format(returnDate, "dd/MM") : t('booking.date')}
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
                          <SelectTrigger className="flex-1 h-11">
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
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <MapPin size={18} className="text-green-600 mr-2" />
                        <span className="text-base font-medium">{t('booking.pickupLocation')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterPickupLocation')}
                        value={returnPickupAddress}
                        onChange={setReturnPickupAddress}
                        onAddressSelect={(location) => {
                          setReturnPickupAddress(location.address);
                          setReturnPickupCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>

                    {/* Return Drop Address */}
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <MapPin size={18} className="text-gray-500 mr-2" />
                        <span className="text-base font-medium">{t('booking.dropLocation')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterDropLocation')}
                        value={returnDropAddress}
                        onChange={setReturnDropAddress}
                        onAddressSelect={(location) => {
                          setReturnDropAddress(location.address);
                          setReturnDropCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>

                    {/* Return Passengers */}
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <Users size={18} className="text-green-600 mr-2" />
                        <span className="text-base font-medium">{t('booking.passengers')}</span>
                      </div>
                      <Select value={returnPassengers.toString()} onValueChange={(value) => setReturnPassengers(parseInt(value))}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={`1 ${t('booking.passenger')}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} {i === 0 ? t('booking.passenger') : t('booking.passengers')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Terceira linha - Duração e Bagagem */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration Days */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Clock size={18} className="text-blue-600 mr-2" />
                      <span className="text-base font-medium">{t('booking.durationDays')}</span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                    placeholder={t('booking.roundTripPlaceholder')}
                      className="w-full h-11"
                  />
                </div>
                
                {/* 10kg Luggage */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Briefcase size={18} className="text-red-600 mr-2" />
                      <span className="text-base font-medium text-red-600">{t('booking.luggage10kg')}</span>
                  </div>
                  <Select value={smallLuggage.toString()} onValueChange={(value) => setSmallLuggage(parseInt(value))}>
                      <SelectTrigger className="h-11">
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
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Briefcase size={18} className="text-red-600 mr-2" />
                      <span className="text-base font-medium text-red-600">{t('booking.luggage23kg')}</span>
                  </div>
                  <Select value={largeLuggage.toString()} onValueChange={(value) => setLargeLuggage(parseInt(value))}>
                      <SelectTrigger className="h-11">
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
                  className="bg-brand hover:bg-brand-600 text-white mt-8 w-full h-12 rounded-lg font-medium text-base"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('booking.findMyTransfer')}
                </Button>
              </>
            )}
          </form>
        </TabsContent>

        {/* HOURLY TAB */}
        <TabsContent value="hourly" className={cn("mt-0", vertical && "flex flex-col")}>
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col" : ""}>
            {vertical ? (
              <>
                {/* Layout compacto sem scroll */}
                <div className="space-y-3">
                  {/* Linha 1: Duração e Serviço */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Duration */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Clock size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.duration')}</span>
                      </div>
                      <Select value={durationHours.toString()} onValueChange={(value) => setDurationHours(parseInt(value))}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={`1 ${t('booking.hour')}`} />
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

                    {/* Service Type */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium">{t('booking.serviceType')}</span>
                      </div>
                      <Select value={orderType} onValueChange={(value) => setOrderType(value as "airport-dropoff" | "pickup")}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={t('booking.selectService')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airport-dropoff">{t('booking.airportDropOff')}</SelectItem>
                          <SelectItem value="pickup">{t('booking.airportPickup')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Linha 2: Data e Hora */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.date')}</span>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full h-8 justify-start text-left font-normal",
                              !hourlyDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {hourlyDate ? format(hourlyDate, "dd/MM") : t('booking.date')}
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
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Clock size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.time')}</span>
                      </div>
                      <Select value={hourlyTime} onValueChange={setHourlyTime}>
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

                  {/* Linha 3: Endereços */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-brand mr-1" />
                        <span className="text-xs font-medium">{t('booking.pickupAddress')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterPickupAddress')}
                        value={hourlyPickupAddress}
                        onChange={setHourlyPickupAddress}
                        onAddressSelect={(location) => {
                          setHourlyPickupAddress(location.address);
                          setHourlyPickupCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-gray-500 mr-1" />
                        <span className="text-xs font-medium">{t('booking.departureAirport')}</span>
                      </div>
                      <AddressAutocomplete
                        placeholder={t('booking.enterDepartureAirport')}
                        value={departureAirport}
                        onChange={setDepartureAirport}
                        onAddressSelect={(location) => {
                          setDepartureAirport(location.address);
                          setHourlyDropCoordinates(location.coordinates);
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Linha 4: Passageiros */}
                  <div className="space-y-1">
                    <div className="flex items-center mb-1">
                      <Users size={14} className="text-brand mr-1" />
                      <span className="text-xs font-medium">{t('booking.passengers')}</span>
                    </div>
                    <Select value={hourlyPassengers.toString()} onValueChange={(value) => setHourlyPassengers(parseInt(value))}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder={`1 ${t('booking.passenger')}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? t('booking.passenger') : t('booking.passengers')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Linha 5: Informações do Voo */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 mb-1 border-b border-gray-200 pb-1">
                      {t('booking.flightInfo')}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-medium">{t('booking.airline')}</span>
                        <Input
                          type="text"
                          value={airline}
                          onChange={(e) => setAirline(e.target.value)}
                          placeholder={t('booking.airlineExample')}
                          className="w-full h-8"
                          disabled={noFlightInfo}
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-medium">{t('booking.flightNumber')}</span>
                        <Input
                          type="text"
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value)}
                          placeholder={t('booking.flightExample')}
                          className="w-full h-8"
                          disabled={noFlightInfo}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="noFlightInfo"
                        checked={noFlightInfo}
                        onChange={(e) => {
                          setNoFlightInfo(e.target.checked);
                          if (e.target.checked) {
                            setAirline("");
                            setFlightNumber("");
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="noFlightInfo" className="text-xs text-gray-600">
                        {t('booking.noFlightInfo')}
                      </label>
                    </div>
                  </div>

                  {/* Linha 6: Bagagens */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-red-600">{t('booking.luggage10kg')}</span>
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
                    
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-red-600">{t('booking.luggage23kg')}</span>
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
                  
                  {/* Linha 7: Botão de submissão */}
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      className="bg-brand hover:bg-brand-600 text-white w-full h-9 rounded-lg font-medium text-sm"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {t('booking.findMyTransfer')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Primeira linha - Duração, Tipo de Serviço e Data/Hora */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Duration */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Clock size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.duration')} *</span>
                    </div>
                    <Select value={durationHours.toString()} onValueChange={(value) => setDurationHours(parseInt(value))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={`1 ${t('booking.hour')}`} />
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

                  {/* Order Type */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <MapPin size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.orderType')} *</span>
                    </div>
                    <Select value={orderType} onValueChange={(value) => setOrderType(value as "airport-dropoff" | "pickup")}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('booking.selectServiceType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airport-dropoff">{t('booking.airportDropOff')}</SelectItem>
                        <SelectItem value="pickup">{t('booking.airportPickup')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pick-up Date & Time */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <CalendarIcon size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.dateTime')} *</span>
                    </div>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal h-11",
                              !hourlyDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-1 h-4 w-4" />
                            {hourlyDate ? format(hourlyDate, "dd/MM") : t('booking.date')}
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
                        <SelectTrigger className="flex-1 h-11">
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
                </div>

                {/* Segunda linha - Endereços e Passageiros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Pick-up Address */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <MapPin size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.pickupAddress')} *</span>
                    </div>
                    <AddressAutocomplete
                      placeholder={t('booking.enterPickupAddress')}
                      value={hourlyPickupAddress}
                      onChange={setHourlyPickupAddress}
                      onAddressSelect={(location) => {
                        setHourlyPickupAddress(location.address);
                        setHourlyPickupCoordinates(location.coordinates);
                      }}
                      required
                    />
                  </div>

                  {/* Departure Airport */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <MapPin size={18} className="text-gray-500 mr-2" />
                      <span className="text-base font-medium">{t('booking.departureAirport')} *</span>
                    </div>
                    <AddressAutocomplete
                      placeholder={t('booking.enterDepartureAirport')}
                      value={departureAirport}
                      onChange={setDepartureAirport}
                      onAddressSelect={(location) => {
                        setDepartureAirport(location.address);
                        setHourlyDropCoordinates(location.coordinates);
                      }}
                      required
                    />
                  </div>

                  {/* Passenger Count */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Users size={18} className="text-brand mr-2" />
                      <span className="text-base font-medium">{t('booking.passengerCount')} *</span>
                    </div>
                    <Select value={hourlyPassengers.toString()} onValueChange={(value) => setHourlyPassengers(parseInt(value))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={`1 ${t('booking.passenger')}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? t('booking.passenger') : t('booking.passengers')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Terceira linha - Informações do Voo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Airline */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <span className="text-base font-medium">{t('booking.airline')}</span>
                    </div>
                    <Input
                      type="text"
                      value={airline}
                      onChange={(e) => setAirline(e.target.value)}
                      placeholder={t('booking.airlineExample')}
                      className="w-full h-11"
                      disabled={noFlightInfo}
                    />
                  </div>

                  {/* Flight Number */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <span className="text-base font-medium">{t('booking.flightNumber')}</span>
                    </div>
                    <Input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder={t('booking.flightExample')}
                      className="w-full h-11"
                      disabled={noFlightInfo}
                    />
                  </div>
                </div>

                {/* No Flight Info Checkbox */}
                <div className="flex items-center space-x-2 mb-6">
                  <input
                    type="checkbox"
                    id="noFlightInfo"
                    checked={noFlightInfo}
                    onChange={(e) => {
                      setNoFlightInfo(e.target.checked);
                      if (e.target.checked) {
                        setAirline("");
                        setFlightNumber("");
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="noFlightInfo" className="text-base text-gray-600">
                    {t('booking.noFlightInfo')}
                  </label>
                </div>

                {/* Quarta linha - Bagagem e Botão */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 10kg Luggage */}
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Briefcase size={18} className="text-red-600 mr-2" />
                      <span className="text-base font-medium text-red-600">{t('booking.luggage10kg')}</span>
                    </div>
                    <Select value={smallLuggage.toString()} onValueChange={(value) => setSmallLuggage(parseInt(value))}>
                      <SelectTrigger className="h-11">
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
                  <div className="space-y-3">
                    <div className="flex items-center mb-2">
                      <Briefcase size={18} className="text-red-600 mr-2" />
                      <span className="text-base font-medium text-red-600">{t('booking.luggage23kg')}</span>
                    </div>
                    <Select value={largeLuggage.toString()} onValueChange={(value) => setLargeLuggage(parseInt(value))}>
                      <SelectTrigger className="h-11">
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

                {/* Submit Button */}
                  <div className="space-y-3">
                    <div className="mb-2 h-6"></div>
                <Button 
                  type="submit"
                      className="bg-brand hover:bg-brand-600 text-white w-full h-11 rounded-lg font-medium text-base"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t('booking.findMyTransfer')}
                </Button>
                  </div>
                </div>
              </>
            )}
          </form>
        </TabsContent>
        
        <TabsContent value="city-tour" className="mt-0">
          <div className="text-center p-8">
            <p className="text-gray-600">{t('booking.cityTourComingSoon')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingWidget;
