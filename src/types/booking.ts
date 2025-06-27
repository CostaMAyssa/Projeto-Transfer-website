// Define booking types
export type BookingType = 'one-way' | 'round-trip' | 'hourly' | 'city-tour';

export interface LocationData {
  address: string;
  coordinates?: [number, number]; // [longitude, latitude]
}

export interface LuggageData {
  small: number; // 10kg
  large: number; // 23kg
}

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string; // Added notes property
}

export interface PaymentDetails {
  firstName: string;
  lastName: string;
  company?: string; // Added company property
  address: string;
  country: string;
  city: string;
  postal: string;
  cardHolder?: string; // Added cardHolder property
  cardNumber?: string; // Added cardNumber property
  expiryMonth?: string; // Added expiryMonth property
  expiryYear?: string; // Added expiryYear property
  cvv?: string; // Added cvv property
  termsAccepted: boolean;
  newsletterSubscription: boolean;
  email?: string; // Added email property
  paymentMethod?: string; // Added payment method property
}

export interface VehicleType {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: number;
  luggage?: number; // Added luggage property
  image: string;
  features: string[];
  description: string;
  models: string;
}

export interface ExtraType {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
}

export interface BookingFormData {
  bookingType: BookingType;
  pickupLocation: LocationData;
  dropoffLocation: LocationData;
  pickupDate: Date;
  pickupTime: string;
  returnDate?: Date;
  returnTime?: string;
  passengers: number;
  luggage: LuggageData;
  vehicle?: VehicleType;
  extras: ExtraType[];
  passengerDetails: PassengerDetails;
  paymentDetails: PaymentDetails;
}
