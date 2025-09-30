import React, { createContext, useContext, useState, useCallback } from 'react';
import { BookingFormData, ExtraType, VehicleType, FlightValidationData } from '@/types/booking';
import { useToast } from "@/hooks/use-toast";
import { vehicles } from '@/data/mockData';
import { calculateZonePricing } from '@/lib/zone-pricing';
import { supabase } from '@/integrations/supabase/client';

// Initialize with default data
const defaultBookingData: BookingFormData = {
  bookingType: 'one-way',
  pickupLocation: { address: '' },
  dropoffLocation: { address: '' },
  pickupDate: new Date(),
  pickupTime: '12:00',
  passengers: 1,
  luggage: {
    small: 2,
    large: 4,
  },
  extras: [],
  passengerDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  paymentDetails: {
    firstName: '',
    lastName: '',
    address: '',
    country: '',
    city: '',
    postal: '',
    termsAccepted: false,
    newsletterSubscription: false,
  },
};

type BookingContextType = {
  bookingData: BookingFormData;
  currentStep: number;
  availableExtras: ExtraType[];
  setAvailableExtras: (extras: ExtraType[]) => void;
  setBookingType: (type: BookingFormData['bookingType']) => void;
  setPickupLocation: (location: { address: string; coordinates?: [number, number] }) => void;
  setDropoffLocation: (location: { address: string; coordinates?: [number, number] }) => void;
  setPickupDate: (date: Date) => void;
  setPickupTime: (time: string) => void;
  setReturnDate: (date?: Date) => void;
  setReturnTime: (time?: string) => void;
  setPassengers: (count: number) => void;
  setLuggage: (small: number, large: number) => void;
  selectVehicle: (vehicle: VehicleType) => void;
  addExtra: (extra: ExtraType) => void;
  updateExtraQuantity: (extraId: string, quantity: number) => void;
  setPassengerDetails: (details: BookingFormData['passengerDetails']) => void;
  setPaymentDetails: (details: BookingFormData['paymentDetails']) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  calculateTotal: () => Promise<{ vehiclePrice: number; extrasPrice: number; total: number }>;
  completeBooking: () => Promise<void>;
  populateDemoData: () => void;
  resetBooking: () => void;
  bookingComplete: boolean;
  reservationId: string | null;
  
  // Round Trip functions
  setRoundTripData: (data: BookingFormData['roundTrip']) => void;
  
  // Hourly functions
  setHourlyData: (data: BookingFormData['hourly']) => void;
  
  // Flight validation functions
  setFlightData: (data: FlightValidationData) => void;
  setOutboundFlightData: (data: FlightValidationData) => void;
  setReturnFlightData: (data: FlightValidationData) => void;
  clearFlightData: () => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  console.log('🏪 BookingProvider initializing...');
  
  const [bookingData, setBookingData] = useState<BookingFormData>(() => {
    console.log('📋 Initializing booking data with defaults');
    return { ...defaultBookingData };
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [availableExtras, setAvailableExtras] = useState<ExtraType[]>([]);
  const { toast } = useToast();

  // Update functions with safety checks
  const setBookingType = useCallback((type: BookingFormData['bookingType']) => {
    console.log('🔄 Setting booking type:', type);
    setBookingData((prev) => {
      if (!prev) {
        console.warn('⚠️ Previous booking data is null, using defaults');
        return { ...defaultBookingData, bookingType: type };
      }
      return { ...prev, bookingType: type };
    });
  }, []);

  const setPickupLocation = useCallback((location: { address: string; coordinates?: [number, number] }) => {
    console.log('📍 Setting pickup location:', location);
    setBookingData((prev) => {
      if (!prev) {
        console.warn('⚠️ Previous booking data is null, using defaults');
        return { ...defaultBookingData, pickupLocation: location };
      }
      return { ...prev, pickupLocation: location };
    });
  }, []);

  const setDropoffLocation = useCallback((location: { address: string; coordinates?: [number, number] }) => {
    console.log('📍 Setting dropoff location:', location);
    setBookingData((prev) => {
      if (!prev) {
        console.warn('⚠️ Previous booking data is null, using defaults');
        return { ...defaultBookingData, dropoffLocation: location };
      }
      return { ...prev, dropoffLocation: location };
    });
  }, []);

  const setPickupDate = useCallback((date: Date) => {
    console.log('📅 Setting pickup date:', date);
    if (!date || isNaN(date.getTime())) {
      console.warn('⚠️ Invalid date provided, using current date');
      date = new Date();
    }
    setBookingData((prev) => ({ ...prev, pickupDate: date }));
  }, []);

  const setPickupTime = useCallback((time: string) => {
    console.log('⏰ Setting pickup time:', time);
    setBookingData((prev) => ({ ...prev, pickupTime: time }));
  }, []);

  const setReturnDate = useCallback((date?: Date) => {
    console.log('📅 Setting return date:', date);
    if (date && isNaN(date.getTime())) {
      console.warn('⚠️ Invalid return date provided, setting to undefined');
      date = undefined;
    }
    setBookingData((prev) => ({ ...prev, returnDate: date }));
  }, []);

  const setReturnTime = useCallback((time?: string) => {
    console.log('⏰ Setting return time:', time);
    setBookingData((prev) => ({ ...prev, returnTime: time }));
  }, []);

  const setPassengers = useCallback((count: number) => {
    console.log('👥 Setting passengers:', count);
    if (count < 1) {
      console.warn('⚠️ Invalid passenger count, setting to 1');
      count = 1;
    }
    setBookingData((prev) => ({ ...prev, passengers: count }));
  }, []);

  const setLuggage = useCallback((small: number, large: number) => {
    console.log('🧳 Setting luggage:', { small, large });
    setBookingData((prev) => ({ ...prev, luggage: { small: Math.max(0, small), large: Math.max(0, large) } }));
  }, []);

  const selectVehicle = useCallback((vehicle: VehicleType) => {
    console.log('🚗 Selecting vehicle:', vehicle);
    if (!vehicle) {
      console.warn('⚠️ Invalid vehicle provided');
      return;
    }
    
    setBookingData((prev) => ({ ...prev, vehicle }));
    
    try {
      toast({
        title: "Veículo selecionado",
        description: `Você selecionou ${vehicle.name}`,
      });
    } catch (error) {
      console.warn('⚠️ Error showing toast:', error);
    }
  }, [toast]);

  const addExtra = useCallback((extra: ExtraType) => {
    console.log('➕ Adding extra:', extra);
    if (!extra) {
      console.warn('⚠️ Invalid extra provided');
      return;
    }
    
    setBookingData((prev) => {
      const existingExtras = (prev.extras || []).filter((e) => e.id !== extra.id);
      return { ...prev, extras: [...existingExtras, extra] };
    });
  }, []);

  const updateExtraQuantity = useCallback((extraId: string, quantity: number) => {
    console.log('🔄 Updating extra quantity:', { extraId, quantity });
    
    if (!extraId) {
      console.warn('⚠️ Invalid extra ID provided');
      return;
    }
    
    setBookingData((prev) => {
      try {
        // Encontrar o extra na lista de extras disponíveis
        const extraFromAvailable = availableExtras.find((e: ExtraType) => e.id === extraId);
        
        if (!extraFromAvailable) {
          console.warn('⚠️ Extra not found in available extras:', extraId);
          return prev;
        }
        
        const updatedExtras = (prev.extras || []).filter((extra) => extra.id !== extraId);
        
        // Se quantity > 0, adicionar o extra com a nova quantidade
        if (quantity > 0) {
          const newExtra = { ...extraFromAvailable, quantity };
          updatedExtras.push(newExtra);
        }
        
        return { ...prev, extras: updatedExtras };
      } catch (error) {
        console.error('🚨 Error updating extra quantity:', error);
        return prev;
      }
    });
  }, [availableExtras]);

  const setPassengerDetails = useCallback((details: BookingFormData['passengerDetails']) => {
    console.log('👤 Setting passenger details');
    setBookingData((prev) => ({ 
      ...prev, 
      passengerDetails: { 
        ...prev.passengerDetails, 
        ...details 
      } 
    }));
  }, []);

  const setPaymentDetails = useCallback((details: BookingFormData['paymentDetails']) => {
    console.log('💳 Setting payment details');
    setBookingData((prev) => ({ 
      ...prev, 
      paymentDetails: { 
        ...prev.paymentDetails, 
        ...details 
      } 
    }));
  }, []);

  const nextStep = useCallback(() => {
    console.log('➡️ Moving to next step from:', currentStep);
    setCurrentStep((prev) => prev + 1);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    console.log('⬅️ Moving to previous step from:', currentStep);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    console.log('🎯 Going to step:', step);
    if (step < 0) {
      console.warn('⚠️ Invalid step number, setting to 0');
      step = 0;
    }
    setCurrentStep(step);
  }, []);

  // Função de cálculo atualizada para usar zone pricing
  const calculateTotal = useCallback(async () => {
    console.log('💰 Iniciando cálculo de preços...');
    console.log('📋 Veículo selecionado:', bookingData.vehicle);
    console.log('📍 Pickup coordinates:', bookingData.pickupLocation.coordinates);
    console.log('📍 Dropoff coordinates:', bookingData.dropoffLocation.coordinates);
    console.log('🎯 Tipo de booking:', bookingData.bookingType);
    
    try {
      let vehiclePrice = bookingData.vehicle?.price || 0;
      console.log('💰 Preço base do veículo:', vehiclePrice);
      
      // Se temos coordenadas de origem e destino, usar zone pricing
      if (bookingData.pickupLocation.coordinates && 
          bookingData.dropoffLocation.coordinates && 
          bookingData.vehicle) {
        
        try {
          console.log('🔍 Calculando preço com zone pricing...');
          console.log('🚗 Categoria do veículo:', bookingData.vehicle.category);
          
          // Preparar dados para diferentes tipos de booking
          let zonePricingRequest = {
            pickup_location: {
              address: bookingData.pickupLocation.address,
              coordinates: bookingData.pickupLocation.coordinates
            },
            dropoff_location: {
              address: bookingData.dropoffLocation.address,
              coordinates: bookingData.dropoffLocation.coordinates
            },
            vehicle_category: bookingData.vehicle.category,
            booking_type: bookingData.bookingType
          };
          
          // Adicionar dados específicos por tipo de booking
          switch (bookingData.bookingType) {
            case 'round-trip':
              if (bookingData.roundTrip) {
                zonePricingRequest = {
                  ...zonePricingRequest,
                  round_trip_data: {
                    outbound_date: bookingData.roundTrip.outboundDate?.toISOString(),
                    return_date: bookingData.roundTrip.returnDate?.toISOString(),
                    duration_days: bookingData.roundTrip.durationDays
                  }
                };
              }
              break;
              
            case 'hourly':
              if (bookingData.hourly) {
                zonePricingRequest = {
                  ...zonePricingRequest,
                  duration_hours: bookingData.hourly.durationHours
                };
              }
              break;
          }
          
          console.log('📤 Enviando request para zone pricing:', zonePricingRequest);
          
          const zonePricingResult = await calculateZonePricing(zonePricingRequest);
          
          console.log('📊 Resultado zone pricing:', zonePricingResult);
          
          if (zonePricingResult.success && zonePricingResult.price) {
            vehiclePrice = zonePricingResult.price;
            console.log('✅ Preço atualizado pelo zone pricing:', vehiclePrice);
            console.log('📊 Breakdown de preços:', zonePricingResult.pricing_breakdown);
          } else {
            console.log('⚠️ Zone pricing não retornou preço válido, mantendo preço base');
          }
        } catch (zonePricingError) {
          console.warn('⚠️ Erro no zone pricing, usando preço base:', zonePricingError);
        }
      } else {
        console.log('ℹ️ Usando preço base (sem coordenadas ou veículo)');
        
        // Para bookings sem coordenadas, aplicar multiplicadores básicos
        if (bookingData.bookingType === 'round-trip') {
          vehiclePrice = vehiclePrice * 2; // Ida + volta
          console.log('🔄 Round-trip: duplicando preço base para', vehiclePrice);
        } else if (bookingData.bookingType === 'hourly' && bookingData.hourly?.durationHours) {
          const hourlyRate = Math.max(vehiclePrice * 0.4, 50); // Mínimo $50/hora
          vehiclePrice = hourlyRate * bookingData.hourly.durationHours;
          console.log('⏰ Hourly: calculando', hourlyRate, 'x', bookingData.hourly.durationHours, '=', vehiclePrice);
        }
      }
      
      // Calcular preço dos extras
      const extrasPrice = (bookingData.extras || []).reduce((total, extra) => {
        const price = (extra.price || 0) * (extra.quantity || 1);
        console.log(`💰 Extra ${extra.id}: $${extra.price} x ${extra.quantity} = $${price}`);
        return total + price;
      }, 0);
      
      const total = vehiclePrice + extrasPrice;
      
      console.log('💰 Resumo de preços:', {
        bookingType: bookingData.bookingType,
        vehiclePrice,
        extrasPrice,
        total
      });
      
      return {
        vehiclePrice,
        extrasPrice,
        total
      };
    } catch (error) {
      console.error('🚨 Erro no cálculo de preços:', error);
      return {
        vehiclePrice: bookingData.vehicle?.price || 0,
        extrasPrice: 0,
        total: bookingData.vehicle?.price || 0
      };
    }
  }, [bookingData]);

  const completeBooking = useCallback(async () => {
    console.log('✅ Completing booking...');
    try {
      // Calculate pricing first
      const pricing = await calculateTotal();
      
      // Determine payment method based on payment details
      let paymentMethod = 'Cartão de Crédito';
      if (bookingData.paymentDetails.cardNumber) {
        const cardNumber = bookingData.paymentDetails.cardNumber.replace(/\s/g, '');
        if (cardNumber.startsWith('4')) {
          paymentMethod = 'Visa';
        } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
          paymentMethod = 'Mastercard';
        } else if (cardNumber.startsWith('3')) {
          paymentMethod = 'American Express';
        }
      }
      
      // Prepare booking data for Supabase
      const bookingToSave = {
        booking_type: bookingData.bookingType,
        pickup_location: bookingData.pickupLocation.address,
        dropoff_location: bookingData.dropoffLocation.address,
        pickup_location_json: {
          address: bookingData.pickupLocation.address,
          coordinates: bookingData.pickupLocation.coordinates
        },
        dropoff_location_json: {
          address: bookingData.dropoffLocation.address,
          coordinates: bookingData.dropoffLocation.coordinates
        },
        pickup_date: bookingData.pickupDate.toISOString().split('T')[0],
        pickup_time: bookingData.pickupTime,
        passengers: bookingData.passengers,
        luggage: bookingData.luggage.small + bookingData.luggage.large,
        luggage_json: bookingData.luggage,
        vehicle_json: bookingData.vehicle,
        extras: bookingData.extras,
        round_trip_data: bookingData.roundTrip,
        hourly_data: bookingData.hourly,
        passenger_details: {
          firstName: bookingData.passengerDetails.firstName,
          lastName: bookingData.passengerDetails.lastName,
          email: bookingData.passengerDetails.email,
          phone: bookingData.passengerDetails.phone
        },
        payment_details: {
          ...bookingData.paymentDetails,
          paymentMethod,
          email: bookingData.passengerDetails.email || bookingData.paymentDetails.email
        },
        vehicle_price: pricing.vehiclePrice,
        extras_price: pricing.extrasPrice,
        total_amount: pricing.total,
        payment_method: paymentMethod,
        status: 'confirmed',
        payment_status: 'succeeded'
      };
      
      console.log('💾 Saving booking to Supabase:', bookingToSave);
      
      // Save to Supabase
      const { data: savedBooking, error } = await supabase
        .from('bookings')
        .insert([bookingToSave])
        .select('*')
        .single();
      
      if (error) {
        console.error('🚨 Supabase error:', error);
        throw new Error(`Erro ao salvar reserva: ${error.message}`);
      }
      
      console.log('✅ Booking saved successfully:', savedBooking);
      
      // Update local state with the saved booking data
      const newReservationId = savedBooking.reservation_id;
      
      setBookingData(prev => ({
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          paymentMethod,
          email: prev.passengerDetails.email || prev.paymentDetails.email
        }
      }));
      
      setReservationId(newReservationId);
      setBookingComplete(true);
      
      toast({
        title: "Reserva confirmada!",
        description: `Seu número de reserva é: ${newReservationId}`,
      });
      
      console.log('✅ Booking completed with reservation ID:', newReservationId);
    } catch (error) {
      console.error('🚨 Error completing booking:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao finalizar a reserva. Tente novamente.",
        variant: "destructive"
      });
      throw error; // Re-throw to handle in payment form
    }
  }, [toast, bookingData, calculateTotal]);

  const populateDemoData = useCallback(() => {
    console.log('🧪 Populating demo data...');
    setBookingData(prev => ({
      ...prev,
      pickupLocation: { 
        address: 'John F. Kennedy International Airport (JFK), Queens, NY, USA',
        coordinates: [-73.7781, 40.6413]
      },
      dropoffLocation: { 
        address: 'LaGuardia Airport (LGA), East Elmhurst, NY, USA',
        coordinates: [-73.8740, 40.7769]
      },
      vehicle: vehicles[1], // Sedan
      passengers: 2,
      luggage: { small: 1, large: 2 }
    }));
    
    toast({
      title: "Demo data loaded",
      description: "Sample booking data has been populated",
    });
  }, [toast]);

  const resetBooking = useCallback(() => {
    console.log('🔄 Resetting booking data...');
    try {
      setBookingData({ ...defaultBookingData });
      setCurrentStep(0);
      setBookingComplete(false);
      setReservationId(null);
      console.log('✅ Booking data reset successfully');
    } catch (error) {
      console.error('🚨 Error resetting booking:', error);
    }
  }, []);

  // Round Trip functions
  const setRoundTripData = useCallback((data: BookingFormData['roundTrip']) => {
    console.log('🔄 Setting round trip data:', data);
    setBookingData((prev) => ({ ...prev, roundTrip: data }));
  }, []);
  
  // Hourly functions
  const setHourlyData = useCallback((data: BookingFormData['hourly']) => {
    console.log('🕒 Setting hourly data:', data);
    setBookingData((prev) => ({ ...prev, hourly: data }));
  }, []);

  // Flight validation functions
  const setFlightData = useCallback((data: FlightValidationData) => {
    console.log('✈️ Setting flight data:', data);
    setBookingData((prev) => ({ ...prev, flightData: data }));
  }, []);

  const setOutboundFlightData = useCallback((data: FlightValidationData) => {
    console.log('✈️ Setting outbound flight data:', data);
    setBookingData((prev) => ({
      ...prev,
      roundTrip: prev.roundTrip ? { ...prev.roundTrip, outboundFlightData: data } : undefined
    }));
  }, []);

  const setReturnFlightData = useCallback((data: FlightValidationData) => {
    console.log('✈️ Setting return flight data:', data);
    setBookingData((prev) => ({
      ...prev,
      roundTrip: prev.roundTrip ? { ...prev.roundTrip, returnFlightData: data } : undefined
    }));
  }, []);

  const clearFlightData = useCallback(() => {
    console.log('🧹 Clearing flight data');
    setBookingData((prev) => ({
      ...prev,
      flightData: undefined,
      roundTrip: prev.roundTrip ? {
        ...prev.roundTrip,
        outboundFlightData: undefined,
        returnFlightData: undefined
      } : undefined
    }));
  }, []);

  const contextValue = {
    bookingData,
    currentStep,
    availableExtras,
    setAvailableExtras,
    setBookingType,
    setPickupLocation,
    setDropoffLocation,
    setPickupDate,
    setPickupTime,
    setReturnDate,
    setReturnTime,
    setPassengers,
    setLuggage,
    selectVehicle,
    addExtra,
    updateExtraQuantity,
    setPassengerDetails,
    setPaymentDetails,
    nextStep,
    prevStep,
    goToStep,
    calculateTotal,
    completeBooking,
    populateDemoData,
    resetBooking,
    bookingComplete,
    reservationId,
    
    // Round Trip functions
    setRoundTripData,
    
    // Hourly functions
    setHourlyData,
    
    // Flight validation functions
    setFlightData,
    setOutboundFlightData,
    setReturnFlightData,
    clearFlightData,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  
  if (context === undefined) {
    console.error('🚨 useBooking must be used within a BookingProvider');
    throw new Error('useBooking must be used within a BookingProvider');
  }
  
  return context;
}
