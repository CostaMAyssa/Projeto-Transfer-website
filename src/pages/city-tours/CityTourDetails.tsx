
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cityTours, CityTour, createCityTours } from "@/data/cityTours";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CityTourDetails = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [tour, setTour] = useState<CityTour | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initialize city tours if empty
    if (cityTours.length === 0) {
      const tours = createCityTours();
      cityTours.push(...tours);
    }
    
    const foundTour = cityTours.find(t => t.id === tourId);
    if (foundTour) {
      setTour(foundTour);
    }
  }, [tourId]);
  
  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-normal mb-4">Tour not found</h2>
            <Link to="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${tour.image})` }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-16 relative z-10">
          <div className="max-w-4xl">
            <Link to="/" className="inline-flex items-center text-white mb-6 hover:text-brand-400">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Link>
            <h1 className="text-5xl font-normal text-white mb-4">{tour.city}</h1>
            <h2 className="text-3xl font-light text-white mb-6">{tour.title}</h2>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-brand-400" />
                <span className="text-white">{tour.duration}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-brand-400" />
                <span className="text-white">{tour.city}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-brand-400" />
                <span className="text-white">Available Daily</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="text-white mr-8">
                <span className="text-3xl font-medium">${tour.price}</span>
                <span className="text-white/70 ml-2">per person</span>
              </div>
              <Button size="lg" className="bg-brand hover:bg-brand-600">
                Book This Tour
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tour Content */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-normal mb-6">Tour Overview</h3>
              <p className="text-gray-700 text-lg mb-8">
                {tour.fullDescription}
              </p>
              
              <h3 className="text-2xl font-normal mb-4">Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {tour.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-2"></div>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-2xl font-normal mb-4">Tour Schedule</h3>
              <div className="space-y-4 mb-12">
                {tour.schedule?.map((item, index) => (
                  <div key={index} className="flex border-l-2 border-brand-500 pl-4 pb-4">
                    <div className="w-20 font-medium text-gray-900">{item.time}</div>
                    <div className="flex-1 text-gray-700">{item.activity}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h4 className="text-xl font-medium mb-4">Services Included</h4>
                <div className="space-y-2">
                  {tour.includedServices?.map((service, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 mr-2"></div>
                      <span className="text-gray-700 text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-brand-50 rounded-xl p-6">
                <h4 className="text-xl font-medium mb-4">Need Help?</h4>
                <p className="text-gray-700 mb-4">
                  Have questions about this tour or need assistance with booking? Our team is ready to help you plan your perfect city tour experience.
                </p>
                <Button variant="outline" className="w-full mb-3">
                  Contact Us
                </Button>
                <Button className="w-full bg-brand hover:bg-brand-600">
                  Book This Tour
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CityTourDetails;
