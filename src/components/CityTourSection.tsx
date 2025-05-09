
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Map, Calendar, Star } from "lucide-react";
import { cityTours, createCityTours } from "@/data/cityTours";
import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
          <p className="text-white/80 max-w-3xl mx-auto text-lg">
            Experience the beauty and history of America's most iconic cities with our premium chauffeur-guided tours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <Link key={tour.id} to={`/city-tours/${tour.id}`} className="group">
              <div className="bg-transparent overflow-hidden relative">
                <div className="overflow-hidden rounded-lg">
                  <AspectRatio ratio={3/4} className="bg-black/20">
                    <img 
                      src={tour.image} 
                      alt={tour.city} 
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                  </AspectRatio>
                </div>
                
                <div className="px-1 pt-4">
                  {/* Eyebrow - Duration */}
                  <div className="mb-2">
                    <span className="text-brand-500 text-sm font-medium tracking-wider">{tour.duration}</span>
                  </div>
                  
                  {/* Title - City Name */}
                  <h3 className="text-white text-xl font-medium mb-2">
                    {tour.city}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{tour.title}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tour.highlights.slice(0, 3).map((highlight, index) => {
                      const highlightText = highlight.split(' ').slice(0, 2).join(' ');
                      return (
                        <span 
                          key={index} 
                          className="bg-white/10 text-xs px-3 py-1 rounded-full text-white flex items-center"
                        >
                          {index === 0 && <Map className="h-3 w-3 mr-1" />}
                          {index === 1 && <Star className="h-3 w-3 mr-1" />}
                          {index === 2 && <Calendar className="h-3 w-3 mr-1" />}
                          {highlightText}
                        </span>
                      );
                    })}
                  </div>
                  
                  {/* Call to Action */}
                  <Button 
                    className="bg-brand-500 text-white hover:bg-brand-600 transition-colors rounded-full"
                    size="sm"
                  >
                    Book Tour <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/services" className="inline-flex items-center text-brand-500 hover:text-brand-400 group">
            View All City Tours <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CityTourSection;
