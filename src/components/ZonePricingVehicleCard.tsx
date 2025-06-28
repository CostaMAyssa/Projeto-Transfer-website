import { useBooking } from "@/contexts/BookingContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, Users, Briefcase, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAutoPricing } from "@/hooks/useZonePricing";
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
  const { nextStep, bookingData } = useBooking();
  
  // Função local para formatar preços (valores já estão em dólares)
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(0)}`;
  };
  
  // Preparar dados para diferentes tipos de booking
  const prepareBookingData = () => {
    const bookingType = bookingData.bookingType || 'one-way';
    let durationHours: number | undefined;
    let roundTripData: { outbound_date?: string; return_date?: string; duration_days?: number } | undefined;
    
    if (bookingType === 'hourly' && bookingData.hourly) {
      durationHours = bookingData.hourly.durationHours;
    }
    
    if (bookingType === 'round-trip' && bookingData.roundTrip) {
      roundTripData = {
        outbound_date: bookingData.roundTrip.outboundDate?.toISOString(),
        return_date: bookingData.roundTrip.returnDate?.toISOString(),
        duration_days: bookingData.roundTrip.durationDays
      };
    }
    
    return { bookingType, durationHours, roundTripData };
  };
  
  const { bookingType, durationHours, roundTripData } = prepareBookingData();
  
  // Calculo automático de preços baseado nas localizações e tipo de booking
  const { 
    data: pricingData, 
    isLoading: isPricingLoading, 
    error: pricingError 
  } = useAutoPricing(
    pickupLocation || null,
    dropoffLocation || null,
    vehicle.id,
    !!(pickupLocation?.coordinates && dropoffLocation?.coordinates),
    bookingType,
    durationHours,
    roundTripData
  );

  const handleVehicleSelect = () => {
    if (onSelect) {
      // Se já está selecionado e é fora de cobertura, abrir WhatsApp
      if (selected && pricingData?.whatsapp_contact) {
        const message = encodeURIComponent(
          `Olá! Gostaria de solicitar um orçamento para transfer fora da área de cobertura.\n\n` +
          `Veículo: ${vehicle.name}\n` +
          `Origem: ${pickupLocation?.address || 'Não informado'}\n` +
          `Destino: ${dropoffLocation?.address || 'Não informado'}\n\n` +
          `Aguardo retorno. Obrigado!`
        );
        const whatsappUrl = `https://wa.me/13478487765?text=${message}`;
        window.open(whatsappUrl, '_blank');
        return;
      }
      
      onSelect(vehicle);
      
      // Só avança automaticamente se não estiver fora de cobertura
      if (!pricingData?.whatsapp_contact) {
        nextStep();
      }
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
    // Mapear exatamente como no mockData.ts - cada veículo tem sua imagem específica
    // Normalizar para minúsculo para garantir compatibilidade
    const normalizedId = vehicleId.toLowerCase();
    
    const images = {
      sedan: "/lovable-uploads/c2fc4186-469d-4557-a80b-4a3e32dbc017.png",  // Sedan - Toyota Camry
      suv: "/lovable-uploads/d7859a6e-d290-4f3f-a494-2dd91f50c9cd.png",    // SUV - Chevrolet Suburban
      van: "/lovable-uploads/76414054-57cd-4796-9734-f706281297f6.png",     // Van - Chrysler Pacifica
      minivan: "/lovable-uploads/76414054-57cd-4796-9734-f706281297f6.png"  // Minivan - mesma do Van
    };
    
    const selectedImage = images[normalizedId as keyof typeof images] || images.sedan;
    
    return selectedImage;
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
            {typeof pickup_zone === 'object' ? pickup_zone.name : pickup_zone} → {typeof dropoff_zone === 'object' ? dropoff_zone.name : dropoff_zone}
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
            src={`${getVehicleImage(vehicle.id)}?v=${Date.now()}`}
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
                disabled={pricingData && !pricingData.success}
              >
                {selected && pricingData?.whatsapp_contact ? 'Contate via WhatsApp' : (selected ? t('booking.selected') : t('booking.select'))}
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