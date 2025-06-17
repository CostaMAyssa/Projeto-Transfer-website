import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Play, ArrowRight } from "lucide-react";
import { vehicles } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import FAQ from "@/components/FAQ";
import CityTourSection from "@/components/CityTourSection";
import AutoFixPricing from "@/components/AutoFixPricing";

const serviceSlides = [{
  id: 1,
  title: "Sprinter Class",
  description: "Mercedes-Benz Sprinter, Ford Transit or similar",
  image: "/lovable-uploads/3b4fd734-dc52-4a22-a8e3-b668b7629315.png"
}, {
  id: 2,
  title: "Wedding Class",
  description: "Rolls Royce Phantom, Bentley Flying Spur or similar",
  image: "/lovable-uploads/baf6dc09-5b63-470c-90a1-0231305e3b67.png"
}, {
  id: 3,
  title: "Travel Transfer",
  description: "Luxury SUVs, Executive Sedans or similar",
  image: "/lovable-uploads/af0f41d4-ae3b-415a-8813-f14552ab516c.png"
}, {
  id: 4,
  title: "Intercity Rides",
  description: "Mercedes-Benz E-Class, BMW 5 Series, Cadillac XTS or similar",
  image: "/lovable-uploads/4173129f-aea8-4579-aa0c-46930d2d3004.png"
}];

const Index = () => {
  const [api, setApi] = useState<any>();
  const { t } = useTranslation();

  // Auto-play functionality for carousel
  useEffect(() => {
    if (!api) return;

    // Set up interval to automatically advance slides
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [api]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AutoFixPricing />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/lovable-uploads/b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {t('hero.title', 'Luxury Transportation')}
            <span className="block text-brand">{t('hero.subtitle', 'Redefined')}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            {t('hero.description', 'Experience premium comfort and reliability with our fleet of luxury vehicles and professional chauffeurs.')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-brand hover:bg-brand/90 text-white px-8 py-4 text-lg">
              {t('hero.bookNow', 'Book Now')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              {t('hero.watchVideo', 'Watch Video')}
            </Button>
          </div>

          {/* Booking Widget */}
          <div className="max-w-4xl mx-auto">
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* Services Carousel Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('services.title', 'Our Premium Services')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('services.description', 'From airport transfers to special events, we provide luxury transportation solutions tailored to your needs.')}
            </p>
          </div>

          <Carousel
            setApi={setApi}
            className="w-full max-w-6xl mx-auto"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {serviceSlides.map((service) => (
                <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-4">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        <Button className="w-full bg-brand hover:bg-brand/90">
                          {t('services.learnMore', 'Learn More')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('fleet.title', 'Our Luxury Fleet')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('fleet.description', 'Choose from our carefully selected collection of premium vehicles, each maintained to the highest standards.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <HoverCard key={vehicle.id}>
                <HoverCardTrigger asChild>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                      <p className="text-gray-600 mb-4">{vehicle.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-brand">${vehicle.price}/hour</span>
                        <span className="text-sm text-gray-500">{vehicle.passengers} passengers</span>
                      </div>
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">{vehicle.name}</h4>
                    <p className="text-sm text-gray-600">{vehicle.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>Passengers: {vehicle.passengers}</span>
                      <span>Luggage: {vehicle.luggage} bags</span>
                    </div>
                    <div className="pt-2">
                      <Button className="w-full bg-brand hover:bg-brand/90">
                        Book This Vehicle
                      </Button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* City Tours Section */}
      <CityTourSection />

      {/* FAQ Section */}
      <FAQ />

      <Footer />
    </div>
  );
};

export default Index;
