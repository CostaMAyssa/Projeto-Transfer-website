
import { ReactNode } from 'react';
import { Landmark, Map } from 'lucide-react';

export interface CityTour {
  id: string;
  city: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  highlights: string[];
  price: number;
  icon: ReactNode;
  fullDescription?: string;
  includedServices?: string[];
  schedule?: {
    time: string;
    activity: string;
  }[];
}

export const cityTours: CityTour[] = [
  {
    id: "new-york",
    city: "New York",
    title: "Big Apple Explorer",
    description: "Experience the vibrant energy of New York City with our comprehensive tour of iconic landmarks including Times Square, Central Park, Empire State Building, and more.",
    image: "/lovable-uploads/8dbef764-77f5-4717-bfe4-19f5775b0869.png",
    duration: "8 hours",
    highlights: [
      "Times Square & Broadway District",
      "Central Park Tour",
      "Empire State Building",
      "Statue of Liberty View",
      "Brooklyn Bridge",
    ],
    price: 249,
    icon: <Landmark className="h-5 w-5" />,
    fullDescription: "Our Big Apple Explorer tour takes you through the heart of Manhattan, experiencing the very best that New York City has to offer. With a professional chauffeur and knowledgeable guide, you'll discover iconic landmarks, vibrant neighborhoods, and the unique energy that makes NYC the city that never sleeps. From the bright lights of Times Square to the peaceful paths of Central Park, this comprehensive tour provides an unforgettable introduction to America's largest city.",
    includedServices: [
      "Luxury vehicle transportation throughout the tour",
      "Professional chauffeur and licensed tour guide",
      "Complimentary bottled water and refreshments",
      "Admission tickets to Empire State Building observation deck",
      "Lunch at a selected NYC restaurant (vegetarian options available)",
      "Hotel pickup and drop-off within Manhattan",
      "All taxes, fees and handling charges"
    ],
    schedule: [
      { time: "9:00 AM", activity: "Hotel pickup & welcome briefing" },
      { time: "9:30 AM", activity: "Times Square & Broadway District exploration" },
      { time: "11:00 AM", activity: "Central Park guided tour" },
      { time: "12:30 PM", activity: "Lunch at selected Manhattan restaurant" },
      { time: "2:00 PM", activity: "Empire State Building experience" },
      { time: "3:30 PM", activity: "Downtown Manhattan & Financial District" },
      { time: "4:30 PM", activity: "Brooklyn Bridge & Statue of Liberty viewing" },
      { time: "5:00 PM", activity: "Return to hotel" }
    ]
  },
  {
    id: "philadelphia",
    city: "Philadelphia",
    title: "Historic Philadelphia",
    description: "Discover America's historic roots with our comprehensive tour of Philadelphia featuring Independence Hall, Liberty Bell, and other significant American landmarks.",
    image: "/lovable-uploads/af0f41d4-ae3b-415a-8813-f14552ab516c.png",
    duration: "6 hours",
    highlights: [
      "Independence Hall",
      "Liberty Bell Center",
      "Philadelphia Museum of Art",
      "Reading Terminal Market",
      "Rocky Steps Experience",
    ],
    price: 199,
    icon: <Landmark className="h-5 w-5" />,
    fullDescription: "Step back in time and explore the birthplace of American democracy with our Historic Philadelphia tour. Walk the same streets as the Founding Fathers, see where the Declaration of Independence was signed, and immerse yourself in the rich heritage of this historic city. Our experienced guides will bring history to life as you visit iconic landmarks and discover the stories behind Philadelphia's most treasured sites.",
    includedServices: [
      "Luxury vehicle transportation throughout the tour",
      "Professional chauffeur and licensed tour guide",
      "Complimentary bottled water and refreshments",
      "Admission to Independence Hall (subject to availability)",
      "Lunch at Reading Terminal Market (food cost not included)",
      "Hotel pickup and drop-off within Philadelphia city center",
      "All taxes, fees and handling charges"
    ],
    schedule: [
      { time: "10:00 AM", activity: "Hotel pickup & welcome briefing" },
      { time: "10:30 AM", activity: "Independence Hall guided tour" },
      { time: "11:30 AM", activity: "Liberty Bell Center visit" },
      { time: "12:30 PM", activity: "Lunch at Reading Terminal Market" },
      { time: "1:30 PM", activity: "Philadelphia Museum of Art & Rocky Steps" },
      { time: "3:00 PM", activity: "Old City & Society Hill exploration" },
      { time: "4:00 PM", activity: "Return to hotel" }
    ]
  },
  {
    id: "washington",
    city: "Washington, DC",
    title: "Capitol Explorer",
    description: "Tour the nation's capital with visits to iconic monuments, museums, and government buildings including the White House, Capitol Building, and Lincoln Memorial.",
    image: "/lovable-uploads/baf6dc09-5b63-470c-90a1-0231305e3b67.png",
    duration: "10 hours",
    highlights: [
      "White House (Exterior View)",
      "Capitol Building Tour",
      "Lincoln & Jefferson Memorials",
      "Smithsonian Museums",
      "Arlington National Cemetery",
    ],
    price: 279,
    icon: <Map className="h-5 w-5" />,
    fullDescription: "Experience the grandeur and historical significance of America's capital city with our comprehensive Washington, DC tour. From the iconic monuments of the National Mall to the corridors of power in the Capitol Building, our tour provides an in-depth look at the heart of American democracy. With skip-the-line access to key attractions and expert commentary throughout, you'll gain a deeper understanding of the nation's history and political system.",
    includedServices: [
      "Luxury vehicle transportation throughout the tour",
      "Professional chauffeur and licensed tour guide",
      "Complimentary bottled water and refreshments",
      "Reserved Capitol Building tour (subject to security clearance)",
      "Lunch at a selected DC restaurant (vegetarian options available)",
      "Hotel pickup and drop-off within DC metropolitan area",
      "All taxes, fees and handling charges"
    ],
    schedule: [
      { time: "8:00 AM", activity: "Hotel pickup & welcome briefing" },
      { time: "8:30 AM", activity: "White House exterior viewing & photo stop" },
      { time: "9:30 AM", activity: "Capitol Building guided tour" },
      { time: "11:30 AM", activity: "National Mall monuments exploration" },
      { time: "1:00 PM", activity: "Lunch at selected DC restaurant" },
      { time: "2:30 PM", activity: "Smithsonian Museum visit (choice of museum)" },
      { time: "4:30 PM", activity: "Arlington National Cemetery tour" },
      { time: "6:00 PM", activity: "Return to hotel" }
    ]
  },
];
