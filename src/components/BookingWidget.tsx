import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBooking } from "@/contexts/BookingContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, MapPin, Search, Users, Briefcase, CreditCard, Loader2 } from "lucide-react";
import { BookingType } from "@/types/booking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddressAutocomplete from "./AddressAutocomplete";
import StripePaymentForm from './StripePaymentForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface BookingWidgetProps {
  vertical?: boolean;
}

interface BookingData {
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: number;
  passengers: number;
  luggage: { small: number; large: number };
  specialRequests: string;
}

interface PaymentIntentResult {
  id: string;
  status: string;
  receipt_email?: string;
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
  
  // Hourly specific fields
  const [orderType, setOrderType] = useState("airport-dropoff"); // airport-dropoff or pickup
  const [departureAirport, setDepartureAirport] = useState("");
  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [noFlightInfo, setNoFlightInfo] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [finalBookingData, setFinalBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setDropoffLocation({ address: departureAirport });
      setPickupDate(hourlyDate);
      setPickupTime(hourlyTime);
      setPassengers(hourlyPassengers);
    }

    // Navigate to booking page
    navigate("/booking");
  };

  const handleBookingSubmit = async () => {
    if (!pickupAddress || !dropoffAddress || !date || !time || !passengers || !smallLuggage || !largeLuggage) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Calcular preço final
      const finalPrice = await calculateZonePricing(
        pickupAddress,
        dropoffAddress,
        "economy" // Assuming a default category
      );

      if (!finalPrice || finalPrice <= 0) {
        toast({
          title: "Erro no cálculo",
          description: "Não foi possível calcular o preço para esta rota.",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados da reserva
      const bookingData = {
        pickup: pickupAddress,
        dropoff: dropoffAddress,
        date: date,
        time: time,
        price: finalPrice,
        passengers: passengers,
        luggage: { small: smallLuggage, large: largeLuggage },
        specialRequests: "",
      };

      setFinalBookingData(bookingData);
      setShowPayment(true);

    } catch (error) {
      console.error('Erro ao processar reserva:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar reserva. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: PaymentIntentResult) => {
    try {
      // Salvar reserva no banco de dados
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          pickup_address: pickupAddress,
          dropoff_address: dropoffAddress,
          pickup_date: date,
          pickup_time: time,
          vehicle_type: "economy",
          passengers: passengers,
          luggage: { small: smallLuggage, large: largeLuggage },
          special_requests: "",
          total_price: finalBookingData.price,
          payment_status: 'paid',
          stripe_payment_intent_id: paymentIntent.id,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar reserva:', error);
        toast({
          title: "Aviso",
          description: "Pagamento realizado, mas houve erro ao salvar a reserva. Entre em contato conosco.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar Payment Intent com booking_id
      await supabase
        .from('payment_intents')
        .update({ 
          booking_id: booking.id,
          customer_email: paymentIntent.receipt_email,
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      setShowPayment(false);
      setFinalBookingData(null);

      toast({
        title: "Reserva Confirmada!",
        description: `Sua reserva foi confirmada. ID: ${booking.id.slice(0, 8)}`,
      });

      // Resetar formulário
      setPickupAddress("");
      setDropoffAddress("");
      setDate(new Date());
      setTime("12:00");
      setPassengerCount(1);
      setSmallLuggage(0);
      setLargeLuggage(0);

    } catch (error) {
      console.error('Erro ao finalizar reserva:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar reserva. Entre em contato conosco.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Erro no Pagamento",
      description: error,
      variant: "destructive",
    });
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
    <>
      <div className={cn(
        "bg-white rounded-xl border border-gray-200",
        vertical 
          ? "p-4 w-full max-h-[500px] flex flex-col"
          : "max-w-5xl mx-auto p-6 -mt-36 relative z-10"
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
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            onAddressSelect={(location) => setOutboundPickupAddress(location.address)}
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
                            onAddressSelect={(location) => setOutboundDropAddress(location.address)}
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
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-green-600 mb-1">{t('booking.return')}</div>
                        
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
                            onAddressSelect={(location) => setReturnPickupAddress(location.address)}
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
                            onAddressSelect={(location) => setReturnDropAddress(location.address)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          onAddressSelect={(location) => setOutboundPickupAddress(location.address)}
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
                          onAddressSelect={(location) => setOutboundDropAddress(location.address)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          onAddressSelect={(location) => setReturnPickupAddress(location.address)}
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
                          onAddressSelect={(location) => setReturnDropAddress(location.address)}
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
          <TabsContent value="hourly" className={cn("mt-0", vertical && "flex flex-col flex-1 min-h-0")}>
            <form onSubmit={handleSubmit} className={vertical ? "flex flex-col flex-1 min-h-0" : "space-y-6"}>
              {vertical ? (
                <>
                  {/* Scrollable content area */}
                  <div className="flex-1 overflow-auto pr-2 -mr-2 pb-2">
                    <div className="flex flex-col space-y-2">
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
                        <Select value={orderType} onValueChange={setOrderType}>
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
                          onAddressSelect={(location) => setHourlyPickupAddress(location.address)}
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
                          onAddressSelect={(location) => setDepartureAirport(location.address)}
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

                      {/* Passenger Count */}
                      <div className="space-y-1">
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
                      <Select value={orderType} onValueChange={setOrderType}>
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
                        onAddressSelect={(location) => setHourlyPickupAddress(location.address)}
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
                        onAddressSelect={(location) => setDepartureAirport(location.address)}
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

      {/* Modal de Pagamento */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Finalizar Reserva</DialogTitle>
            <DialogDescription>
              Complete o pagamento para confirmar sua reserva
            </DialogDescription>
          </DialogHeader>
          
          {finalBookingData && (
            <StripePaymentForm
              amount={finalBookingData.price}
              currency="usd"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              bookingDetails={{
                pickup: finalBookingData.pickup,
                dropoff: finalBookingData.dropoff,
                vehicle: finalBookingData.vehicle.name,
                date: finalBookingData.date,
                time: finalBookingData.time,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingWidget;
