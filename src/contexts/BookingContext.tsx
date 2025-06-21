import React, { createContext, useContext, useState } from 'react';
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
  const [bookingData, setBookingData] = useState<BookingFormData>(defaultBookingData);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Update functions
  const setBookingType = (type: BookingFormData['bookingType']) => {
    setBookingData((prev) => ({ ...prev, bookingType: type }));
  };

  const setPickupLocation = (location: { address: string; coordinates?: [number, number] }) => {
    setBookingData((prev) => ({ ...prev, pickupLocation: location }));
  };

  const setDropoffLocation = (location: { address: string; coordinates?: [number, number] }) => {
    setBookingData((prev) => ({ ...prev, dropoffLocation: location }));
  };

  const setPickupDate = (date: Date) => {
    setBookingData((prev) => ({ ...prev, pickupDate: date }));
  };

  const setPickupTime = (time: string) => {
    setBookingData((prev) => ({ ...prev, pickupTime: time }));
  };

  const setReturnDate = (date?: Date) => {
    setBookingData((prev) => ({ ...prev, returnDate: date }));
  };

  const setReturnTime = (time?: string) => {
    setBookingData((prev) => ({ ...prev, returnTime: time }));
  };

  const setPassengers = (count: number) => {
    setBookingData((prev) => ({ ...prev, passengers: count }));
  };

  const setLuggage = (small: number, large: number) => {
    setBookingData((prev) => ({ ...prev, luggage: { small, large } }));
  };

  const selectVehicle = (vehicle: VehicleType) => {
    setBookingData((prev) => ({ ...prev, vehicle }));
    toast({
      title: "Vehicle selected",
      description: `You've selected the ${vehicle.name}`,
    });
  };

  const addExtra = (extra: ExtraType) => {
    setBookingData((prev) => {
      const existingExtras = prev.extras.filter((e) => e.id !== extra.id);
      return { ...prev, extras: [...existingExtras, extra] };
    });
  };

  const updateExtraQuantity = (extraId: string, quantity: number) => {
    setBookingData((prev) => {
      // Encontrar o extra nos dados mock
      const extraFromMock = mockExtras.find((e: ExtraType) => e.id === extraId);
      
      if (!extraFromMock) return prev;
      
      const updatedExtras = prev.extras.filter((extra) => extra.id !== extraId);
      
      // Se quantity > 0, adicionar o extra com a nova quantidade
      if (quantity > 0) {
        const newExtra = { ...extraFromMock, quantity };
        updatedExtras.push(newExtra);
      }
      
      return { ...prev, extras: updatedExtras };
    });
  };

  const setPassengerDetails = (details: BookingFormData['passengerDetails']) => {
    setBookingData((prev) => ({ ...prev, passengerDetails: { ...prev.passengerDetails, ...details } }));
  };

  const setPaymentDetails = (details: BookingFormData['paymentDetails']) => {
    setBookingData((prev) => ({ ...prev, paymentDetails: { ...prev.paymentDetails, ...details } }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Função de cálculo atualizada para usar zone pricing
  const calculateTotal = async () => {
    console.log('🔍 Iniciando cálculo de preços...');
    console.log('📋 Veículo selecionado:', bookingData.vehicle);
    console.log('📍 Pickup coordinates:', bookingData.pickupLocation.coordinates);
    console.log('📍 Dropoff coordinates:', bookingData.dropoffLocation.coordinates);
    
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
          console.log('✅ Preço zone pricing aplicado:', vehiclePrice);
        } else {
          console.log('⚠️ Zone pricing falhou, usando preço base:', vehiclePrice);
        }
        
      } catch (error) {
        console.error('❌ Erro no zone pricing:', error);
        // Manter preço base em caso de erro
      }
    } else {
      console.log('⚠️ Coordenadas não disponíveis, usando preço base');
    }
    
    const extrasPrice = bookingData.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0
    );
    
    console.log('🎁 Preço dos extras:', extrasPrice);
    console.log('💵 Total final:', vehiclePrice + extrasPrice);
    
    return {
      vehiclePrice,
      extrasPrice,
      total: vehiclePrice + extrasPrice,
    };
  };

  const completeBooking = () => {
    // In a real app, we'd send the booking data to a server here
    // Generate a simple booking ID for demo purposes
    const generatedId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    setReservationId(generatedId);
    setBookingComplete(true);
    // Move to the confirmation step
    setCurrentStep(4);
    
    toast({
      title: "Booking complete!",
      description: `Your reservation ID is ${generatedId}`,
    });
  };

  // Função para popular dados de demonstração
  const populateDemoData = () => {
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
  };

  const resetBooking = () => {
    console.log('🔄 Resetando todos os dados da reserva...');
    
    // Reset all booking data to initial state
    setBookingData({
      ...defaultBookingData,
      pickupDate: new Date(), // Always use current date
    });
    
    setCurrentStep(0);
    setBookingComplete(false);
    setReservationId(null);
    
    console.log('✅ Reset completo realizado');
  };

  return (
    <BookingContext.Provider
      value={{
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
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
