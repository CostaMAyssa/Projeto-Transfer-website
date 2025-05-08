
export type BookingType = 'one-way' | 'round-trip' | 'hourly' | 'city-tour';

export type LocationType = {
  address: string;
  city?: string;
  country?: string;
};

export type VehicleType = {
  id: string;
  name: string;
  category: string;
  description: string;
  models: string;
  capacity: number;
  luggage: number;
  price: number;
  image: string;
  features: string[];
};

export type ExtraType = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

export type BookingFormData = {
  bookingType: BookingType;
  pickupLocation: LocationType;
  dropoffLocation: LocationType;
  pickupDate: Date;
  pickupTime: string;
  returnDate?: Date;
  returnTime?: string;
  passengers: number;
  luggage: {
    small: number; // 10kg
    large: number; // 23kg
  };
  vehicle?: VehicleType;
  extras: ExtraType[];
  passengerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  };
  paymentDetails: {
    firstName: string;
    lastName: string;
    company?: string;
    address: string;
    country: string;
    city: string;
    postal: string;
    cardHolder?: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    termsAccepted: boolean;
    newsletterSubscription: boolean;
  };
};
