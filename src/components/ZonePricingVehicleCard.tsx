import { useBooking } from "@/contexts/BookingContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, Users, Briefcase, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAutoPricing, formatPrice } from "@/hooks/useZonePricing";
import { VehicleCategory } from "@/lib/zone-pricing";
import { Skeleton } from "@/components/ui/skeleton";

interface ZonePricingVehicleCardProps {
  vehicle: VehicleCategory;
  pickupLocation?: { address: string; coordinates?: [number, number] };
  dropoffLocation?: { address: string; coordinates?: [number, number] };
  selected?: boolean;
  onSelect?: (vehicle: VehicleCategory) => void;
}

const ZonePricingVehicleCard = ({ 
  vehicle, 
  pickupLocation, 
  dropoffLocation,
  selected = false,
  onSelect 
}: ZonePricingVehicleCardProps) => {
  const { t } = useTranslation();
  
  // Calculo automático de preços baseado nas localizações
  const { 
    data: pricingData, 
    isLoading: isPricingLoading, 
    error: pricingError 
  } = useAutoPricing(
    pickupLocation || null,
    dropoffLocation || null,
    vehicle.id,
    !!(pickupLocation?.coordinates && dropoffLocation?.coordinates)
  );

  const handleVehicleSelect = () => {
    if (onSelect) {
      onSelect(vehicle);
    }
  };

  const getLuggageText = (vehicleId: string) => {
    switch(vehicleId) {
      case "suv":
        return `6 ${t('fleet.checkedBaggage')} ${t('booking.and')} 5 ${t('fleet.carryOnBaggage')}`;
      case "sedan":
        return `3 ${t('fleet.checkedBaggage')} ${t('booking.and')} 2 ${t('fleet.carryOnBaggage')}`;
      case "minivan":
        return `4 ${t('fleet.checkedBaggage')} ${t('booking.and')} 4 ${t('fleet.carryOnBaggage')}`;
      default:
        return `${vehicle.capacity} lugares`;
    }
  };

  const getVehicleImage = (vehicleId: string) => {
    const images = {
      sedan: "/lovable-uploads/8cd7b8ce-deda-49ae-bd1a-e6b2b07a6d82.png",
      suv: "/lovable-uploads/4e7b6c9a-3c84-4593-a7c6-07c21b6e7b22.png", 
      minivan: "/lovable-uploads/6d1f4c84-2e3a-4f95-8b5d-9c8e7f1a6d92.png"
    };
    return images[vehicleId as keyof typeof images] || images.sedan;
  };

  const renderPriceSection = () => {
    if (isPricingLoading && pickupLocation?.coordinates && dropoffLocation?.coordinates) {
      return (
        <div className="mb-2">
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      );
    }

    if (pricingError || !pricingData) {
      return (
        <div className="mb-2">
          <span className="text-2xl font-normal">{formatPrice(vehicle.base_price)}</span>
          <p className="text-sm text-gray-600">{t('booking.allPricesInclude')}</p>
          {!pickupLocation?.coordinates || !dropoffLocation?.coordinates ? (
            <p className="text-xs text-amber-600 flex items-center mt-1">
              <MapPin size={12} className="mr-1" />
              Selecione origem e destino para preço exato
            </p>
          ) : (
            <p className="text-xs text-red-600 flex items-center mt-1">
              <AlertTriangle size={12} className="mr-1" />
              Erro no cálculo. Preço base exibido.
            </p>
          )}
        </div>
      );
    }

    const { success, price, out_of_coverage, pickup_zone, dropoff_zone, whatsapp_contact, message } = pricingData;

    if (!success) {
      return (
        <div className="mb-2">
          <span className="text-2xl font-normal">{formatPrice(vehicle.base_price)}</span>
          <p className="text-sm text-red-600 flex items-center mt-1">
            <AlertTriangle size={12} className="mr-1" />
            {message || 'Erro no cálculo de preços'}
          </p>
        </div>
      );
    }

    return (
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-normal">{formatPrice(price || vehicle.base_price)}</span>
          {out_of_coverage && (
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
              Fora de cobertura
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600">{t('booking.allPricesInclude')}</p>
        
        {pickup_zone && dropoff_zone && (
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <MapPin size={12} className="mr-1" />
            {pickup_zone.name} → {dropoff_zone.name}
          </div>
        )}
        
        {whatsapp_contact && (
          <p className="text-xs text-amber-600 mt-1 flex items-center">
            <Clock size={12} className="mr-1" />
            Entre em contato via WhatsApp para confirmação
          </p>
        )}
        
        {message && !whatsapp_contact && (
          <p className="text-xs text-gray-500 mt-1">{message}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-lg overflow-hidden mb-6 bg-white transition-all duration-200 ${
      selected ? 'ring-2 ring-brand border-brand' : 'hover:border-gray-300'
    }`}>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Image with zoom effect */}
        <div className="p-4 flex items-center justify-center bg-gray-50 overflow-hidden">
          <img 
            src={getVehicleImage(vehicle.id)} 
            alt={vehicle.name} 
            className="w-full max-w-sm object-contain h-48"
            style={{ transform: "scale(1.1)" }}
          />
        </div>
        
        {/* Details */}
        <div className="lg:col-span-2 p-4 lg:p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-normal mb-1">{vehicle.name}</h3>
            <p className="text-sm text-gray-600">{vehicle.description}</p>
          </div>

          <div className="flex flex-col mb-4 space-y-2">
            <div className="flex items-center">
              <Users size={18} className="mr-1" />
              <span className="text-sm font-medium">{t('fleet.passengers')}: {vehicle.capacity}</span>
            </div>
            <div className="flex items-start">
              <Briefcase size={18} className="mr-1 mt-0.5" />
              <div className="text-sm">
                <span className="font-medium">{t('fleet.luggage')}: </span>
                <span className="text-gray-600 text-xs">{getLuggageText(vehicle.id)}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            {renderPriceSection()}
            
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {vehicle.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                    <Check size={12} className="mr-1 text-brand" />
                    {feature}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="link" 
                className="text-brand hover:text-brand-700 p-0 font-medium"
              >
                {t('booking.showMoreInfo')}
              </Button>
              
              <Button 
                onClick={handleVehicleSelect} 
                variant={selected ? "outline" : "default"}
                className={
                  selected 
                    ? "border-brand text-brand hover:text-brand-700 font-medium" 
                    : "bg-black hover:bg-gray-800 text-white font-medium"
                }
                disabled={pricingData?.whatsapp_contact && !pricingData?.success}
              >
                {selected ? t('booking.selected') : t('booking.select')} 
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZonePricingVehicleCard; 