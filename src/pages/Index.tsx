import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import BookingWidget from "@/components/BookingWidget";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Play, ArrowRight } from "lucide-react";
import { vehicles } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState, useRef, Suspense } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import FAQ from "@/components/FAQ";
import CityTourSection from "@/components/CityTourSection";

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

// Simplified error boundary for components that may cause DOM issues
const ComponentErrorBoundary = ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('removeChild') || event.message?.includes('appendChild')) {
        console.warn('🚨 DOM manipulation error caught:', event.message);
        setHasError(true);
        event.preventDefault();
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="p-4 text-center">
        {fallback}
        <button 
          onClick={() => setHasError(false)}
          className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};

const Index = () => {
  const [api, setApi] = useState<unknown>(null);
  const { t } = useTranslation();
  const mountedRef = useRef(true);

  // Auto-play functionality for carousel with safe cleanup
  useEffect(() => {
    console.log('🎠 Setting up carousel auto-play');
    
    if (!api || !mountedRef.current) {
      console.log('⏳ Carousel API not ready or component unmounted');
      return;
    }

    let interval: NodeJS.Timeout;
    
    try {
      // Set up interval to automatically advance slides
      interval = setInterval(() => {
        try {
          if (api && mountedRef.current && typeof (api as any).scrollNext === 'function') {
            (api as any).scrollNext();
          }
        } catch (error) {
          console.warn('⚠️ Carousel scroll error:', error);
        }
      }, 5000);

      console.log('✅ Carousel auto-play configured');
    } catch (error) {
      console.error('🚨 Error setting up carousel:', error);
    }
      
    // Clear interval on component unmount or API change
    return () => {
      console.log('🧹 Cleaning up carousel interval');
      mountedRef.current = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [api]);
  
  // Ensure cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Background - Increased height to fit booking widget without scrolling */}
      <div className="relative h-[850px] md:h-[800px]">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: "url('/lovable-uploads/8dbef764-77f5-4717-bfe4-19f5775b0869.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 my-0 py-0"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 h-full flex relative z-10">
          {/* Left side content - reduced width to give more space to the booking widget */}
          <div className="w-full md:w-3/5 flex flex-col justify-center h-full pt-16">
            <div className="text-white max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl mb-8 font-light max-w-2xl">
                {t('hero.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Right side booking widget - moved slightly to the left with right margin */}
          <div className="hidden md:block md:w-2/5 h-full pt-16 pl-8 pr-12">
            <div className="h-full flex items-center">
              <ComponentErrorBoundary 
                fallback={<div className="text-white">Widget temporariamente indisponível</div>}
              >
                <Suspense fallback={<div className="bg-white rounded-xl p-6 animate-pulse">Carregando...</div>}>
                  <BookingWidget vertical={true} />
                </Suspense>
              </ComponentErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Booking Widget (Only shows on small screens) */}
      <div className="md:hidden container mx-auto px-4 -mt-36 relative z-10">
        <ComponentErrorBoundary 
          fallback={<div className="bg-white rounded-xl border p-6 text-center">Widget temporariamente indisponível</div>}
        >
          <Suspense fallback={<div className="bg-white rounded-xl border p-6 animate-pulse">Carregando...</div>}>
            <BookingWidget vertical={false} />
          </Suspense>
        </ComponentErrorBoundary>
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Safety First */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <img src="/lovable-uploads/317b73c6-d260-46bf-a54a-8f509814815a.png" alt="Safety First" className="w-16 h-16 object-contain" />
              </div>
              <h3 className="text-2xl font-normal mb-4">{t('benefits.safetyFirst')}</h3>
              <p className="text-gray-600 font-light">
                {t('benefits.safetyDescription')}
              </p>
            </div>
            
            {/* Prices With No Surprises */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <img src="/lovable-uploads/acddb1ee-40ba-410e-a859-767186f56f96.png" alt="Prices With No Surprises" className="w-16 h-16 object-contain" />
              </div>
              <h3 className="text-2xl font-normal mb-4">{t('benefits.pricesNoSurprises')}</h3>
              <p className="text-gray-600 font-light">
                {t('benefits.pricesDescription')}
              </p>
            </div>
            
            {/* Private Travel Solutions */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <img src="/lovable-uploads/9dffe454-d17e-4393-b086-9b697da7c149.png" alt="Private Travel Solutions" className="w-16 h-16 object-contain" />
              </div>
              <h3 className="text-2xl font-normal mb-4">{t('benefits.privateSolutions')}</h3>
              <p className="text-gray-600 font-light">
                {t('benefits.privateDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-normal">{t('fleet.title')}</h2>
          <Link to="/fleet" className="flex items-center text-brand hover:text-brand-700">
            {t('fleet.moreFleet')} <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map(vehicle => <div key={vehicle.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 bg-gray-50 flex items-center justify-center h-60 overflow-hidden">
                <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-contain" style={{
              transform: "scale(1.3)"
            }} // 30% zoom
            />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-normal mb-2">{vehicle.category}</h3>
                <p className="text-gray-600 text-sm mb-4">{vehicle.models}</p>
                <div className="flex flex-col space-y-4">
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-1 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-500">{t('fleet.passengers')}: {vehicle.capacity}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-500">{t('fleet.luggage')}:</span>
                    {vehicle.id === "suv" && <p className="text-xs text-gray-600">6 of 23kg ({t('fleet.checkedBaggage')}) and 5 of 10kg ({t('fleet.carryOnBaggage')})</p>}
                    {vehicle.id === "sedan" && <p className="text-xs text-gray-600">3 of 23kg ({t('fleet.checkedBaggage')}) and 2 of 10kg ({t('fleet.carryOnBaggage')})</p>}
                    {vehicle.id === "minivan" && <p className="text-xs text-gray-600">4 of 23kg ({t('fleet.checkedBaggage')}) and 4 of 10kg ({t('fleet.carryOnBaggage')})</p>}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </section>

      {/* Services Section with Carousel */}
      <section className="py-20 bg-gray-50 overflow-hidden relative">
        {/* Red curved line on the left side - moved from CityTourSection */}
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
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-normal">{t('services.title')}</h2>
            <Link to="/services" className="flex items-center text-brand hover:text-brand-700">
              {t('services.moreServices')} <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
          
          <div className="relative">
            <Carousel setApi={setApi} className="w-full" opts={{
            align: "start",
            loop: true
          }}>
              <CarouselContent>
                {serviceSlides.map(slide => <CarouselItem key={slide.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-4">
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <img src={slide.image} alt={slide.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                          <h3 className="text-xl font-normal mb-2">{slide.title}</h3>
                          <p className="text-gray-600 text-sm">{slide.description}</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* City Tours Section */}
      <CityTourSection />

      {/* FAQ Section */}
      <FAQ />

      <Footer />
    </div>;
};

export default Index;
