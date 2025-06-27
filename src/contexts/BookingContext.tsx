import React, { createContext, useContext, useState, useCallback } from 'react';
import { BookingFormData, ExtraType, VehicleType } from '@/types/booking';
import { useToast } from "@/hooks/use-toast";
import { vehicles, extras as mockExtras } from '@/data/mockData';
import { calculateZonePricing } from '@/lib/zone-pricing';

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
  completeBooking: () => void;
  populateDemoData: () => void;
  resetBooking: () => void;
  bookingComplete: boolean;
  reservationId: string | null;
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
        // Encontrar o extra nos dados mock
        const extraFromMock = mockExtras.find((e: ExtraType) => e.id === extraId);
        
        if (!extraFromMock) {
          console.warn('⚠️ Extra not found in mock data:', extraId);
          return prev;
        }
        
        const updatedExtras = (prev.extras || []).filter((extra) => extra.id !== extraId);
        
        // Se quantity > 0, adicionar o extra com a nova quantidade
        if (quantity > 0) {
          const newExtra = { ...extraFromMock, quantity };
          updatedExtras.push(newExtra);
        }
        
        return { ...prev, extras: updatedExtras };
      } catch (error) {
        console.error('🚨 Error updating extra quantity:', error);
        return prev;
      }
    });
  }, []);

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
          
          const zonePricingResult = await calculateZonePricing({
            pickup_location: {
              address: bookingData.pickupLocation.address,
              coordinates: bookingData.pickupLocation.coordinates
            },
            dropoff_location: {
              address: bookingData.dropoffLocation.address,
              coordinates: bookingData.dropoffLocation.coordinates
            },
            vehicle_category: bookingData.vehicle.category
          });
          
          console.log('📊 Resultado zone pricing:', zonePricingResult);
          
          if (zonePricingResult.success && zonePricingResult.price) {
            vehiclePrice = zonePricingResult.price;
            console.log('✅ Preço atualizado pelo zone pricing:', vehiclePrice);
          } else {
            console.log('⚠️ Zone pricing não retornou preço válido, mantendo preço base');
          }
        } catch (zonePricingError) {
          console.warn('⚠️ Erro no zone pricing, usando preço base:', zonePricingError);
        }
      } else {
        console.log('ℹ️ Usando preço base (sem coordenadas ou veículo)');
      }
      
      // Calcular preço dos extras
      const extrasPrice = (bookingData.extras || []).reduce((total, extra) => {
        const price = (extra.price || 0) * (extra.quantity || 1);
        console.log(`💰 Extra ${extra.id}: $${extra.price} x ${extra.quantity} = $${price}`);
        return total + price;
      }, 0);
      
      const total = vehiclePrice + extrasPrice;
      
      console.log('💰 Resumo de preços:', {
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

  const completeBooking = useCallback(() => {
    console.log('✅ Completing booking...');
    try {
      const newReservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        description: "Erro ao finalizar a reserva. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [toast]);

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

  const contextValue = {
    bookingData,
    currentStep,
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
