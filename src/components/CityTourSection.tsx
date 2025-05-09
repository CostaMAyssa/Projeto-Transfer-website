
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Landmark, Map } from "lucide-react";
import { cityTours, createCityTours } from "@/data/cityTours";
import { useEffect, useState } from "react";

const CityTourSection = () => {
  const [tours, setTours] = useState([]);

  // Initialize the city tours with icons on component mount
  useEffect(() => {
    // Add the tours with icons
    const toursData = createCityTours();
    setTours(toursData);
    
    // Also update the cityTours array for other components
    cityTours.length = 0;
    cityTours.push(...toursData);
  }, []);

  // Helper function to render the correct icon based on icon string
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'landmark':
        return <Landmark className="h-5 w-5 text-white" />;
      case 'map':
        return <Map className="h-5 w-5 text-white" />;
      default:
        return <Landmark className="h-5 w-5 text-white" />;
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Dark background color */}
      <div className="absolute inset-0 bg-[#111111] z-0"></div>
      
      {/* Red curved line on the left side */}
      <div 
        className="absolute left-0 top-0 bottom-0 z-0" 
        style={{ 
          width: '40%', 
          backgroundImage: `url("/lovable-uploads/45b9942a-dad5-4d13-ad48-48f01e8e8772.png")`, 
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'left center'
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
          {tours.map((tour) => (
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
                      {renderIcon(tour.icon)}
                    </span>
                    <span className="text-gray-300 text-sm">{tour.duration}</span>
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
                    
                    <Link to={`/city-tours/${tour.id}`}>
                      <Button variant="default" className="bg-brand hover:bg-brand-600">
                        Book Now <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
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
