import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBooking } from "@/contexts/BookingContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, MapPin, Search, Users, Briefcase } from "lucide-react";
import { BookingType, FlightValidationData } from "@/types/booking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddressAutocomplete from "./AddressAutocomplete";
import FlightValidationMessage from "./FlightValidationMessage";
import FlightFields from "./FlightFields";
import FlightFieldsInline from "./FlightFieldsInline";
import { useFlightValidationWithDebounce } from "@/hooks/useFlightValidation";

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
    setHourlyData,
    setFlightData,
    setOutboundFlightData,
    setReturnFlightData
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
  
  // Flight validation for one-way
  const [oneWayAirline, setOneWayAirline] = useState("");
  const [oneWayFlightNumber, setOneWayFlightNumber] = useState("");
  const [oneWayNoFlightInfo, setOneWayNoFlightInfo] = useState(false);
  const [oneWayFlightData, setOneWayFlightData] = useState<FlightValidationData | undefined>();

  // Round-trip state
  const [outboundDate, setOutboundDate] = useState<Date>(new Date());
  const [outboundTime, setOutboundTime] = useState("12:00");
  const [outboundPickupAddress, setOutboundPickupAddress] = useState("");
  const [outboundDropAddress, setOutboundDropAddress] = useState("");
  const [outboundPickupCoordinates, setOutboundPickupCoordinates] = useState<[number, number] | undefined>();
  const [outboundDropCoordinates, setOutboundDropCoordinates] = useState<[number, number] | undefined>();
  const [outboundPassengers, setOutboundPassengers] = useState(1);
  
  // Flight validation for outbound
  const [outboundAirline, setOutboundAirline] = useState("");
  const [outboundFlightNumber, setOutboundFlightNumber] = useState("");
  const [outboundNoFlightInfo, setOutboundNoFlightInfo] = useState(false);
  const [outboundFlightData, setOutboundFlightDataState] = useState<FlightValidationData | undefined>();
  
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [returnTime, setReturnTime] = useState("12:00");
  const [returnPickupAddress, setReturnPickupAddress] = useState("");
  const [returnDropAddress, setReturnDropAddress] = useState("");
  const [returnPickupCoordinates, setReturnPickupCoordinates] = useState<[number, number] | undefined>();
  const [returnDropCoordinates, setReturnDropCoordinates] = useState<[number, number] | undefined>();
  const [returnPassengers, setReturnPassengers] = useState(1);
  const [durationDays, setDurationDays] = useState(0);
  
  // Flight validation for return
  const [returnAirline, setReturnAirline] = useState("");
  const [returnFlightNumber, setReturnFlightNumber] = useState("");
  const [returnNoFlightInfo, setReturnNoFlightInfo] = useState(false);
  const [returnFlightData, setReturnFlightDataState] = useState<FlightValidationData | undefined>();

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

  // Flight validation hooks
  const { validateFlight: validateOneWayFlight, isLoading: oneWayValidating, lastValidation: oneWayValidation } = useFlightValidationWithDebounce(1000);
  const { validateFlight: validateOutboundFlight, isLoading: outboundValidating, lastValidation: outboundValidation } = useFlightValidationWithDebounce(1000);
  const { validateFlight: validateReturnFlight, isLoading: returnValidating, lastValidation: returnValidation } = useFlightValidationWithDebounce(1000);
  const { validateFlight: validateHourlyFlight, isLoading: hourlyValidating, lastValidation: hourlyValidation } = useFlightValidationWithDebounce(1000);

  // Helper function to determine booking type based on addresses
  const isAirportBooking = (pickup: string, dropoff: string) => {
    const airportKeywords = ['aeroporto', 'airport', 'terminal', 'galeão', 'guarulhos', 'confins', 'santos dumont'];
    return airportKeywords.some(keyword => 
      pickup.toLowerCase().includes(keyword) || dropoff.toLowerCase().includes(keyword)
    );
  };

  // Flight validation effects
  useEffect(() => {
    if (bookingType === 'one-way' && !oneWayNoFlightInfo && oneWayFlightNumber && isAirportBooking(pickupAddress, dropoffAddress)) {
      const bookingType = isAirportBooking(pickupAddress, dropoffAddress) ? 'dropoff' : 'pickup';
      validateOneWayFlight({
        flight_number: oneWayFlightNumber,
        airline: oneWayAirline,
        date: format(date, 'yyyy-MM-dd'),
        time: time,
        booking_type: bookingType as 'pickup' | 'dropoff'
      }).then(result => {
        if (result) {
          const flightData: FlightValidationData = {
            airline: oneWayAirline,
            flightNumber: oneWayFlightNumber,
            noFlightInfo: oneWayNoFlightInfo,
            validationResult: result.validation_result
          };
          setOneWayFlightData(flightData);
          setFlightData(flightData);
        }
      });
    }
  }, [oneWayFlightNumber, oneWayAirline, date, time, pickupAddress, dropoffAddress, oneWayNoFlightInfo]);

  useEffect(() => {
    if (bookingType === 'round-trip' && !outboundNoFlightInfo && outboundFlightNumber && isAirportBooking(outboundPickupAddress, outboundDropAddress)) {
      const bookingType = isAirportBooking(outboundPickupAddress, outboundDropAddress) ? 'dropoff' : 'pickup';
      validateOutboundFlight({
        flight_number: outboundFlightNumber,
        airline: outboundAirline,
        date: format(outboundDate, 'yyyy-MM-dd'),
        time: outboundTime,
        booking_type: bookingType as 'pickup' | 'dropoff'
      }).then(result => {
        if (result) {
          const flightData: FlightValidationData = {
            airline: outboundAirline,
            flightNumber: outboundFlightNumber,
            noFlightInfo: outboundNoFlightInfo,
            validationResult: result.validation_result
          };
          setOutboundFlightDataState(flightData);
          setOutboundFlightData(flightData);
        }
      });
    }
  }, [outboundFlightNumber, outboundAirline, outboundDate, outboundTime, outboundPickupAddress, outboundDropAddress, outboundNoFlightInfo]);

  useEffect(() => {
    if (bookingType === 'round-trip' && !returnNoFlightInfo && returnFlightNumber && isAirportBooking(returnPickupAddress, returnDropAddress)) {
      const bookingType = isAirportBooking(returnPickupAddress, returnDropAddress) ? 'dropoff' : 'pickup';
      validateReturnFlight({
        flight_number: returnFlightNumber,
        airline: returnAirline,
        date: format(returnDate, 'yyyy-MM-dd'),
        time: returnTime,
        booking_type: bookingType as 'pickup' | 'dropoff'
      }).then(result => {
        if (result) {
          const flightData: FlightValidationData = {
            airline: returnAirline,
            flightNumber: returnFlightNumber,
            noFlightInfo: returnNoFlightInfo,
            validationResult: result.validation_result
          };
          setReturnFlightDataState(flightData);
          setReturnFlightData(flightData);
        }
      });
    }
  }, [returnFlightNumber, returnAirline, returnDate, returnTime, returnPickupAddress, returnDropAddress, returnNoFlightInfo]);

  useEffect(() => {
    if (bookingType === 'hourly' && !noFlightInfo && flightNumber) {
      const bookingType = orderType === 'airport-dropoff' ? 'dropoff' : 'pickup';
      validateHourlyFlight({
        flight_number: flightNumber,
        airline: airline,
        date: format(hourlyDate, 'yyyy-MM-dd'),
        time: hourlyTime,
        booking_type: bookingType
      }).then(result => {
        if (result) {
          const flightData: FlightValidationData = {
            airline: airline,
            flightNumber: flightNumber,
            noFlightInfo: noFlightInfo,
            validationResult: result.validation_result
          };
          // Update hourly data with flight validation
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
      });
    }
  }, [flightNumber, airline, hourlyDate, hourlyTime, orderType, noFlightInfo]);

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
    
    console.log('📋 BookingWidget - Antes de setBookingType:', bookingType);
    // Update booking data in context based on booking type
    // Só atualiza o bookingType se os dados estiverem preenchidos
    if (bookingType === "one-way" && pickupAddress && dropoffAddress) {
      setBookingType(bookingType);
    } else if (bookingType === "round-trip" && outboundPickupAddress && outboundDropAddress && returnPickupAddress && returnDropAddress) {
      setBookingType(bookingType);
    } else if (bookingType === "hourly" && hourlyPickupAddress && departureAirport) {
      setBookingType(bookingType);
    } else {
      console.log('⚠️ BookingWidget - Dados incompletos, não atualizando bookingType');
      return; // Não navega se dados estiverem incompletos
    }
    console.log('✅ BookingWidget - Depois de setBookingType:', bookingType);
    
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
        ? "p-4 w-full max-h-[900px] flex flex-col"
        : "w-full max-w-5xl mx-auto p-6 relative z-10"
    )}>
      <Tabs defaultValue="one-way" className={cn("mb-4", vertical && "flex flex-col h-full min-h-0")}>
        <TabsList className={cn(
          vertical ? "grid grid-cols-3 mb-3 flex-shrink-0" : "grid grid-cols-4 mb-8"
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
        <TabsContent value="one-way" className={cn("mt-0", vertical && "flex flex-col flex-1 min-h-0")}>
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col flex-1 min-h-0" : ""}>
            {vertical ? (
              <>
                {/* Scrollable content area */}
                <div className="flex-1 overflow-auto pr-2 -mr-2 pb-2">
                  <div className="flex flex-col space-y-2">
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
                        <span className="text-xs font-medium">{t('booking.dateTime')}</span>
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
                              {date ? format(date, "dd/MM/yyyy") : t('booking.pickADate')}
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
                
                {/* Flight Information for One-Way */}
                <FlightFieldsInline
                  airline={oneWayAirline}
                  setAirline={setOneWayAirline}
                  flightNumber={oneWayFlightNumber}
                  setFlightNumber={setOneWayFlightNumber}
                  noFlightInfo={oneWayNoFlightInfo}
                  setNoFlightInfo={setOneWayNoFlightInfo}
                  validationData={oneWayValidation ? {
                    airline: oneWayAirline,
                    flightNumber: oneWayFlightNumber,
                    noFlightInfo: oneWayNoFlightInfo,
                    validationResult: oneWayValidation.validation_result
                  } : undefined}
                  isLoading={oneWayValidating}
                />
                
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          {date ? format(date, "PPP") : <span>{t('booking.pickADate')}</span>}
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
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Passengers */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <Users size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.passengers')}</span>
                    </div>
                    <Select value={passengers.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                      <SelectTrigger>
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

                {/* Flight Information for One-Way Horizontal */}
                <FlightFieldsInline
                  airline={oneWayAirline}
                  setAirline={setOneWayAirline}
                  flightNumber={oneWayFlightNumber}
                  setFlightNumber={setOneWayFlightNumber}
                  noFlightInfo={oneWayNoFlightInfo}
                  setNoFlightInfo={setOneWayNoFlightInfo}
                  validationData={oneWayValidation ? {
                    airline: oneWayAirline,
                    flightNumber: oneWayFlightNumber,
                    noFlightInfo: oneWayNoFlightInfo,
                    validationResult: oneWayValidation.validation_result
                  } : undefined}
                  isLoading={oneWayValidating}
                />

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="bg-brand hover:bg-brand-600 text-white mt-8 w-full py-3 rounded-lg font-medium"
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
                  <div className="flex flex-col space-y-1">
                    {/* Pick-Up (Outbound) Section */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-brand mb-1">{t('booking.pickupOutbound')}</div>
                      
                      {/* Outbound Date & Time */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <CalendarIcon size={14} className="text-brand mr-1" />
                          <span className="text-xs font-medium">{t('booking.dateTime')}</span>
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
                          <span className="text-xs font-medium">{t('booking.pickupLocation')}</span>
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
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="text-gray-500 mr-1" />
                          <span className="text-xs font-medium">{t('booking.dropLocation')}</span>
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
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <Users size={14} className="text-brand mr-1" />
                          <span className="text-xs font-medium">{t('booking.passengers')}</span>
                        </div>
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

                    {/* Return Section */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-green-600 mb-1 mt-2">{t('booking.return')}</div>
                      
                      {/* Return Date & Time */}
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <CalendarIcon size={14} className="text-green-600 mr-1" />
                          <span className="text-xs font-medium">{t('booking.dateTime')}</span>
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
                          <span className="text-xs font-medium">{t('booking.pickupLocation')}</span>
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
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="text-gray-500 mr-1" />
                          <span className="text-xs font-medium">{t('booking.dropLocation')}</span>
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
                      <div className="space-y-1">
                        <div className="flex items-center mb-1">
                          <Users size={14} className="text-green-600 mr-1" />
                          <span className="text-xs font-medium">{t('booking.passengers')}</span>
                        </div>
                        <Select value={returnPassengers.toString()} onValueChange={(value) => setReturnPassengers(parseInt(value))}>
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
                    
                    {/* Duration Days */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Clock size={14} className="text-blue-600 mr-1" />
                        <span className="text-xs font-medium">{t('booking.durationDays')}</span>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={durationDays}
                        onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                        placeholder={t('booking.roundTripPlaceholder')}
                        className="w-full h-8"
                      />
                    </div>
                    
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
                    {t('booking.pickupOutbound')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Outbound Date & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={14} className="text-brand mr-1" />
                        <span className="text-sm font-medium">{t('booking.dateTime')}</span>
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
                        <span className="text-sm font-medium">{t('booking.pickupLocation')}</span>
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
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-gray-500 mr-1" />
                        <span className="text-sm font-medium">{t('booking.dropLocation')}</span>
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
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Users size={14} className="text-brand mr-1" />
                        <span className="text-sm font-medium">{t('booking.passengers')}</span>
                      </div>
                      <Select value={outboundPassengers.toString()} onValueChange={(value) => setOutboundPassengers(parseInt(value))}>
                        <SelectTrigger>
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
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <MapPin size={18} className="text-green-600 mr-2" />
                    {t('booking.return')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Return Date & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={14} className="text-green-600 mr-1" />
                        <span className="text-sm font-medium">{t('booking.dateTime')}</span>
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
                        <span className="text-sm font-medium">{t('booking.pickupLocation')}</span>
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
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="text-gray-500 mr-1" />
                        <span className="text-sm font-medium">{t('booking.dropLocation')}</span>
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
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Users size={14} className="text-green-600 mr-1" />
                        <span className="text-sm font-medium">{t('booking.passengers')}</span>
                      </div>
                      <Select value={returnPassengers.toString()} onValueChange={(value) => setReturnPassengers(parseInt(value))}>
                        <SelectTrigger>
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
                
                {/* Duration Days */}
                <div className="space-y-1">
                  <div className="flex items-center mb-1">
                    <Clock size={14} className="text-blue-600 mr-1" />
                    <span className="text-xs font-medium">{t('booking.durationDays')}</span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                    placeholder={t('booking.roundTripPlaceholder')}
                    className="w-full h-8"
                  />
                </div>
                
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
        <TabsContent value="hourly" className={cn("mt-0", vertical && "flex flex-col flex-1 min-h-0")}>
          <form onSubmit={handleSubmit} className={vertical ? "flex flex-col flex-1 min-h-0" : "space-y-6"}>
            {vertical ? (
              <>
                {/* Scrollable content area */}
                <div className="flex-1 overflow-auto pr-2 -mr-2 pb-2">
                  <div className="flex flex-col space-y-1">
                    {/* Duration */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <Clock size={16} className="text-brand mr-1" />
                        <span className="text-sm font-medium">{t('booking.duration')} *</span>
                      </div>
                      <Select value={durationHours.toString()} onValueChange={(value) => setDurationHours(parseInt(value))}>
                        <SelectTrigger>
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
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={16} className="text-brand mr-1" />
                        <span className="text-sm font-medium">{t('booking.orderType')} *</span>
                      </div>
                      <Select value={orderType} onValueChange={(value) => setOrderType(value as "airport-dropoff" | "pickup")}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('booking.selectServiceType')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="airport-dropoff">{t('booking.airportDropOff')}</SelectItem>
                          <SelectItem value="airport-pickup">{t('booking.airportPickup')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pick-up Date & Time */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <CalendarIcon size={16} className="text-brand mr-1" />
                        <span className="text-sm font-medium">{t('booking.dateTime')} *</span>
                      </div>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "flex-1 justify-start text-left font-normal",
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

                    {/* Pick-up Address */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={16} className="text-brand mr-1" />
                        <span className="text-sm font-medium">{t('booking.pickupAddress')} *</span>
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
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <MapPin size={16} className="text-gray-500 mr-1" />
                        <span className="text-sm font-medium">{t('booking.departureAirport')} *</span>
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

                    {/* Airline */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium">{t('booking.airline')}</span>
                      </div>
                      <Input
                        type="text"
                        value={airline}
                        onChange={(e) => setAirline(e.target.value)}
                        placeholder={t('booking.airlineExample')}
                        className="w-full h-8"
                        disabled={noFlightInfo}
                      />
                    </div>

                    {/* Flight Number */}
                    <div className="space-y-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium">{t('booking.flightNumber')}</span>
                      </div>
                      <Input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        placeholder={t('booking.flightExample')}
                        className="w-full h-8"
                        disabled={noFlightInfo}
                      />
                    </div>

                    {/* No Flight Info Checkbox */}
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
                      <label htmlFor="noFlightInfo" className="text-sm text-gray-600">
                        {t('booking.noFlightInfo')}
                      </label>
                    </div>

                    {/* Luggage Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 10kg Luggage */}
                      <div className="space-y-1">
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
                      <div className="space-y-1">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <Clock size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.duration')} *</span>
                    </div>
                    <Select value={durationHours.toString()} onValueChange={(value) => setDurationHours(parseInt(value))}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <MapPin size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.orderType')} *</span>
                    </div>
                    <Select value={orderType} onValueChange={(value) => setOrderType(value as "airport-dropoff" | "pickup")}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('booking.selectServiceType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airport-dropoff">{t('booking.airportDropOff')}</SelectItem>
                        <SelectItem value="airport-pickup">{t('booking.airportPickup')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pick-up Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <CalendarIcon size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.dateTime')} *</span>
                    </div>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
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
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pick-up Address */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <MapPin size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.pickupAddress')} *</span>
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
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <MapPin size={16} className="text-gray-500 mr-1" />
                      <span className="text-sm font-medium">{t('booking.departureAirport')} *</span>
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

                {/* Third Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Airline */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium">{t('booking.airline')}</span>
                    </div>
                    <Input
                      type="text"
                      value={airline}
                      onChange={(e) => setAirline(e.target.value)}
                      placeholder={t('booking.airlineExample')}
                      className="w-full"
                      disabled={noFlightInfo}
                    />
                  </div>

                  {/* Flight Number */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-medium">{t('booking.flightNumber')}</span>
                    </div>
                    <Input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder={t('booking.flightExample')}
                      className="w-full"
                      disabled={noFlightInfo}
                    />
                  </div>

                  {/* Passenger Count */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-1">
                      <Users size={16} className="text-brand mr-1" />
                      <span className="text-sm font-medium">{t('booking.passengerCount')} *</span>
                    </div>
                    <Select value={hourlyPassengers.toString()} onValueChange={(value) => setHourlyPassengers(parseInt(value))}>
                      <SelectTrigger>
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

                {/* No Flight Info Checkbox */}
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
                  <label htmlFor="noFlightInfo" className="text-sm text-gray-600">
                    {t('booking.noFlightInfo')}
                  </label>
                </div>

                {/* Luggage Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Flight Information for Hourly */}
                <FlightFieldsInline
                  airline={airline}
                  setAirline={setAirline}
                  flightNumber={flightNumber}
                  setFlightNumber={setFlightNumber}
                  noFlightInfo={noFlightInfo}
                  setNoFlightInfo={setNoFlightInfo}
                  validationData={hourlyValidation ? {
                    airline: airline,
                    flightNumber: flightNumber,
                    noFlightInfo: noFlightInfo,
                    validationResult: hourlyValidation.validation_result
                  } : undefined}
                  isLoading={hourlyValidating}
                />

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
