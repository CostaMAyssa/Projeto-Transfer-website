
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Map, Landmark } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// City tour data
const cityTours = [
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
    icon: <Landmark className="h-5 w-5" />
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
    icon: <Landmark className="h-5 w-5" />
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
    icon: <Map className="h-5 w-5" />
  },
];

const CityTourSection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Dark overlay for entire section */}
      <div className="absolute inset-0 bg-black/90 z-0"></div>
      
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10 bg-repeat z-0" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-normal text-white mb-4">City Tour Packages</h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            Experience the beauty and history of America's most iconic cities with our premium chauffeur-guided tours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cityTours.map((tour) => (
            <div key={tour.id} className="relative group">
              {/* City card with image background */}
              <div className="relative h-[500px] rounded-xl overflow-hidden">
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${tour.image})` }}
                ></div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                
                {/* Card content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center mb-3">
                    <span className="bg-brand-500 p-2 rounded-full mr-3">
                      {tour.icon}
                    </span>
                    <span className="text-gray-300 text-sm">{tour.duration} duration</span>
                  </div>
                  
                  <h3 className="text-white text-3xl font-normal mb-2">
                    {tour.city}
                  </h3>
                  <p className="text-gray-300 text-lg mb-4">{tour.title}</p>
                  
                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {tour.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2"></div>
                        <span className="text-gray-300 text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <span className="text-2xl font-medium">${tour.price}</span>
                      <span className="text-gray-300 text-sm ml-1">per person</span>
                    </div>
                    
                    <Button variant="default" className="bg-brand hover:bg-brand-600">
                      Book Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/services" className="inline-flex items-center text-brand-500 hover:text-brand-400">
            View All City Tours <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CityTourSection;
