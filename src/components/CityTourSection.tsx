import { Map } from "lucide-react";
import { cityTours, createCityTours } from "@/data/cityTours";
import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useTranslation } from "react-i18next";

const CityTourSection = () => {
  const { t } = useTranslation();
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
    <section className="py-32 relative overflow-hidden">
      {/* Dark background color */}
      <div className="absolute inset-0 bg-[#111111] z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-normal text-white mb-4">{t('cityTours.title')}</h2>
          <p className="text-white/80 max-w-3xl mx-auto text-lg">
            {t('cityTours.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div key={tour.id} className="group">
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
                  {/* Title - Themed Title - smaller eyebrow with lighter red */}
                  <div className="mb-2">
                    <span className="text-[#FCD6D8] text-xs font-medium">
                      {tour.id === "washington" && t('cityTours.categories.historical')}
                      {tour.id === "new-york" && t('cityTours.categories.popular')}
                      {tour.id === "philadelphia" && t('cityTours.categories.cultural')}
                    </span>
                  </div>
                  
                  {/* City Name - larger title */}
                  <h3 className="text-white text-3xl font-medium mb-2">
                    {tour.city}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white/90 text-sm mb-4 line-clamp-3">
                    {tour.id === "washington" && t('cityTours.descriptions.washington')}
                    {tour.id === "new-york" && t('cityTours.descriptions.newYork')}
                    {tour.id === "philadelphia" && t('cityTours.descriptions.philadelphia')}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tour.id === "washington" && (
                      <>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.whiteHouse')}
                        </span>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.capitol')}
                        </span>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.lincolnMemorial')}
                        </span>
                      </>
                    )}
                    
                    {tour.id === "new-york" && (
                      <>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.timesSquare')}
                        </span>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.centralPark')}
                        </span>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.statueOfLiberty')}
                        </span>
                      </>
                    )}
                    
                    {tour.id === "philadelphia" && (
                      <>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.independenceHall')}
                        </span>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.libertyBell')}
                        </span>
                        <span className="bg-white/10 text-xs px-3 py-1 text-white flex items-center">
                          <Map className="h-3 w-3 mr-1" />
                          {t('cityTours.landmarks.artMuseum')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CityTourSection;
