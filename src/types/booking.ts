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

// Flight validation types
export interface FlightInfo {
  flight_number: string;
  airline: string;
  departure_time: string;
  arrival_time: string;
  departure_airport: string;
  arrival_airport: string;
  terminal?: string;
  gate?: string;
  status: string;
}

export interface FlightValidationData {
  airline: string;
  flightNumber: string;
  noFlightInfo: boolean;
  validationResult?: {
    is_valid: boolean;
    suggested_time?: string;
    suggested_date?: string;
    reason?: string;
    flight_info?: FlightInfo;
  };
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
  
  // Flight validation data (available for all booking types)
  flightData?: FlightValidationData;
  
  // Round Trip specific fields
  roundTrip?: {
    outboundPickupLocation: LocationData;
    outboundDropoffLocation: LocationData;
    outboundDate: Date;
    outboundTime: string;
    outboundPassengers: number;
    returnPickupLocation: LocationData;
    returnDropoffLocation: LocationData;
    returnDate: Date;
    returnTime: string;
    returnPassengers: number;
    durationDays: number;
    // Flight data for outbound and return flights
    outboundFlightData?: FlightValidationData;
    returnFlightData?: FlightValidationData;
  };
  
  // Hourly specific fields
  hourly?: {
    pickupLocation: LocationData;
    dropoffLocation: LocationData;
    date: Date;
    time: string;
    passengers: number;
    durationHours: number;
    orderType: 'airport-dropoff' | 'pickup';
    departureAirport: string;
    airline: string;
    flightNumber: string;
    noFlightInfo: boolean;
  };
}
