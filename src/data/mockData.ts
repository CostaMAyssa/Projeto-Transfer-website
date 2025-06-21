import { ExtraType, VehicleType } from "@/types/booking";

export const vehicles: VehicleType[] = [
  {
    id: "suv",
    name: "SUV",
    category: "SUV",
    description: "Spacious vehicle for groups and larger luggage needs",
    models: "Chevrolet Suburban or similar",
    capacity: 6,
    luggage: 6,
    price: 160,
    image: "/lovable-uploads/d7859a6e-d290-4f3f-a494-2dd91f50c9cd.png",
    features: ["Meet & Greet included", "Free cancellation", "Free Waiting time", "Safe and secure travel"]
  },
  {
    id: "sedan",
    name: "Sedan",
    category: "SEDAN",
    description: "Comfortable and elegant transport for business travelers",
    models: "Toyota Camry or similar",
    capacity: 3,
    luggage: 3,
    price: 130,
    image: "/lovable-uploads/c2fc4186-469d-4557-a80b-4a3e32dbc017.png",
    features: ["Meet & Greet included", "Free cancellation", "Free Waiting time", "Safe and secure travel"]
  },
  {
    id: "van",
    name: "Van",
    category: "VAN",
    description: "Spacious transport for families and groups",
    models: "Chrysler Pacifica or similar",
    capacity: 7,
    luggage: 4,
    price: 150,
    image: "/lovable-uploads/76414054-57cd-4796-9734-f706281297f6.png",
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
