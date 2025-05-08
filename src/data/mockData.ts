
import { ExtraType, VehicleType } from "@/types/booking";

export const vehicles: VehicleType[] = [
  {
    id: "business-class",
    name: "Business Class",
    category: "Business Class",
    description: "Comfortable and professional transport for business travelers",
    models: "Mercedes-Benz E-Class, BMW 5 Series, Cadillac XTS or similar",
    capacity: 3,
    luggage: 2,
    price: 1150,
    image: "/lovable-uploads/087c4245-4db8-4588-8647-3bf4628dbd93.png",
    features: ["Meet & Greet included", "Free cancellation", "Free Waiting time", "Safe and secure travel"]
  },
  {
    id: "first-class",
    name: "First Class",
    category: "First Class",
    description: "Luxury transportation with premium amenities",
    models: "Mercedes-Benz EQS, BMW 7 Series, Audi A8 or similar",
    capacity: 5,
    luggage: 3,
    price: 750,
    image: "/lovable-uploads/398a580a-246d-46ba-89e3-80f1491551d4.png",
    features: ["Meet & Greet included", "Free cancellation", "Free Waiting time", "Safe and secure travel"]
  },
  {
    id: "business-van",
    name: "Business Van/SUV",
    category: "Business Van/SUV",
    description: "Spacious vehicles for groups and families",
    models: "Mercedes-Benz V-Class, Chevrolet Suburban, Cadillac",
    capacity: 2,
    luggage: 1,
    price: 1300,
    image: "/lovable-uploads/55cd9c56-3e07-4df9-a7c3-88577f60ff05.png",
    features: ["Meet & Greet included", "Free cancellation", "Free Waiting time", "Safe and secure travel"]
  }
];

export const extras: ExtraType[] = [
  {
    id: "child-seat",
    name: "Child Seat",
    description: "Suitable for toddlers weighing 0-18 kg (approx 0 to 4 years).",
    price: 12,
    quantity: 0
  },
  {
    id: "booster-seat",
    name: "Booster seat",
    description: "Suitable for children weighing 15-36 kg (approx 4 to 10 years).",
    price: 12,
    quantity: 0
  },
  {
    id: "vodka-bottle",
    name: "Vodka Bottle",
    description: "Absolut Vodka 0.7l Bottle",
    price: 12,
    quantity: 0
  },
  {
    id: "flowers",
    name: "Bouquet of Flowers",
    description: "A bouquet of seasonal flowers prepared by a local florist",
    price: 12,
    quantity: 0
  },
  {
    id: "alcohol-package",
    name: "Alcohol Package",
    description: "A selection of premium alcoholic beverages",
    price: 12,
    quantity: 0
  },
  {
    id: "airport-assistance",
    name: "Airport Assistance and Hostess Service",
    description: "Professional assistance at the airport and hostess service",
    price: 12,
    quantity: 0
  },
  {
    id: "bodyguard",
    name: "Bodyguard Service",
    description: "Professional security personnel for your safety",
    price: 12,
    quantity: 0
  }
];
