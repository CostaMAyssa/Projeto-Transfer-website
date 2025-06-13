import React, { createContext, useContext, useState } from 'react';
import { BookingFormData, ExtraType, VehicleType } from '@/types/booking';
import { useToast } from "@/hooks/use-toast";
import { vehicles, extras as mockExtras } from '@/data/mockData';

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
  calculateTotal: () => { vehiclePrice: number; extrasPrice: number; total: number };
  completeBooking: () => void;
  populateDemoData: () => void;
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

  const calculateTotal = () => {
    const vehiclePrice = bookingData.vehicle?.price || 0;
    
    const extrasPrice = bookingData.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0
    );
    
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
      pickupLocation: { address: 'Aero Road, Bohemia, New York 11716, United States' },
      dropoffLocation: { address: 'Bohemia, New York 11716, United States' },
      vehicle: vehicles[1], // Sedan
    }));
  };

  const value = {
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
    bookingComplete,
    reservationId,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
