import { useBooking } from "@/contexts/BookingContext";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Users, Briefcase } from "lucide-react";
import RideMap from "./RideMap";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const RideSummary = () => {
  const { t } = useTranslation();
  const { bookingData, calculateTotal } = useBooking();
  const { 
    bookingType, 
    pickupLocation, 
    dropoffLocation, 
    pickupDate, 
    pickupTime, 
    passengers, 
    luggage, 
    vehicle, 
    extras,
    roundTrip,
    hourly
  } = bookingData;
  
  const [pricing, setPricing] = useState({ vehiclePrice: 0, extrasPrice: 0, total: 0 });
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Helper function to get the appropriate date and time based on booking type
  const getDisplayData = () => {
    switch (bookingType) {
      case 'round-trip':
        return {
          pickupDate: roundTrip?.outboundDate || pickupDate,
          pickupTime: roundTrip?.outboundTime || pickupTime,
          pickupLocation: roundTrip?.outboundPickupLocation || pickupLocation,
          dropoffLocation: roundTrip?.outboundDropoffLocation || dropoffLocation,
          passengers: roundTrip?.outboundPassengers || passengers,
          returnDate: roundTrip?.returnDate,
          returnTime: roundTrip?.returnTime,
          returnPickupLocation: roundTrip?.returnPickupLocation,
          returnDropoffLocation: roundTrip?.returnDropoffLocation,
          durationDays: roundTrip?.durationDays
        };
      case 'hourly':
        return {
          pickupDate: hourly?.date || pickupDate,
          pickupTime: hourly?.time || pickupTime,
          pickupLocation: hourly?.pickupLocation || pickupLocation,
          dropoffLocation: hourly?.dropoffLocation || dropoffLocation,
          passengers: hourly?.passengers || passengers,
          durationHours: hourly?.durationHours,
          airline: hourly?.airline,
          flightNumber: hourly?.flightNumber,
          orderType: hourly?.orderType
        };
      default:
        return {
          pickupDate,
          pickupTime,
          pickupLocation,
          dropoffLocation,
          passengers
        };
    }
  };
  
  const displayData = getDisplayData();
  const formattedDate = format(displayData.pickupDate, "EEE, MMM d, yyyy");
  
  // Calcular preços quando dados relevantes mudarem
  useEffect(() => {
    const updatePricing = async () => {
      setIsCalculating(true);
      try {
        const result = await calculateTotal();
        setPricing(result);
        console.log('📊 RideSummary - Preços atualizados:', result);
      } catch (error) {
        console.error('Erro ao calcular preços:', error);
        // Fallback para valores padrão
        setPricing({ 
          vehiclePrice: vehicle?.price || 0, 
          extrasPrice: extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0),
          total: (vehicle?.price || 0) + extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
        });
      } finally {
        setIsCalculating(false);
      }
    };
    
    // Reset pricing quando não há veículo selecionado
    if (!vehicle) {
      setPricing({ vehiclePrice: 0, extrasPrice: 0, total: 0 });
      setIsCalculating(false);
      return;
    }
    
    updatePricing();
  }, [calculateTotal, vehicle, extras, pickupLocation.coordinates, dropoffLocation.coordinates, pickupLocation.address, dropoffLocation.address]);
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-xl font-normal mb-6">{t('booking.yourRide')}</h3>
        
        {/* Map View */}
        <RideMap className="mb-6" />

        {/* Pickup & Dropoff */}
        <div className="space-y-4 mb-6">
          {bookingType === 'round-trip' ? (
            // Round Trip Layout
            <>
              <div className="border-b pb-3">
                <div className="text-sm font-medium text-brand mb-2">Ida</div>
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin size={16} className="text-brand mr-1" />
                    <span>{t('booking.pickup')}</span>
                  </div>
                  <div className="font-normal">
                    {displayData.pickupLocation?.address || t('booking.notSpecifiedYet')}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin size={16} className="text-brand mr-1" />
                    <span>{t('booking.dropoff')}</span>
                  </div>
                  <div className="font-normal">
                    {displayData.dropoffLocation?.address || t('booking.notSpecifiedYet')}
                  </div>
                </div>
              </div>
              
              {displayData.returnDate && (
                <div>
                  <div className="text-sm font-medium text-green-600 mb-2">Volta</div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin size={16} className="text-green-600 mr-1" />
                      <span>{t('booking.pickup')}</span>
                    </div>
                    <div className="font-normal">
                      {displayData.returnPickupLocation?.address || displayData.dropoffLocation?.address || t('booking.notSpecifiedYet')}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin size={16} className="text-green-600 mr-1" />
                      <span>{t('booking.dropoff')}</span>
                    </div>
                    <div className="font-normal">
                      {displayData.returnDropoffLocation?.address || displayData.pickupLocation?.address || t('booking.notSpecifiedYet')}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : bookingType === 'hourly' ? (
            // Hourly Layout
            <>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <MapPin size={16} className="text-brand mr-1" />
                  <span>{t('booking.pickup')}</span>
                </div>
                <div className="font-normal">
                  {displayData.pickupLocation?.address || t('booking.notSpecifiedYet')}
                </div>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <MapPin size={16} className="text-brand mr-1" />
                  <span>Aeroporto de Destino</span>
                </div>
                <div className="font-normal">
                  {displayData.dropoffLocation?.address || t('booking.notSpecifiedYet')}
                </div>
              </div>
              
              {(displayData.airline || displayData.flightNumber) && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-1">Informações do Voo</div>
                  {displayData.airline && (
                    <div className="text-sm text-blue-700">Companhia: {displayData.airline}</div>
                  )}
                  {displayData.flightNumber && (
                    <div className="text-sm text-blue-700">Voo: {displayData.flightNumber}</div>
                  )}
                </div>
              )}
            </>
          ) : (
            // One-Way Layout (default)
            <>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <MapPin size={16} className="text-brand mr-1" />
                  <span>{t('booking.pickup')}</span>
                </div>
                <div className="font-normal">
                  {displayData.pickupLocation?.address || t('booking.notSpecifiedYet')}
                </div>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <MapPin size={16} className="text-brand mr-1" />
                  <span>{t('booking.dropoff')}</span>
                </div>
                <div className="font-normal">
                  {displayData.dropoffLocation?.address || t('booking.notSpecifiedYet')}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date, Time, Passengers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Calendar size={16} className="text-brand mr-1" />
              <span>{bookingType === 'round-trip' ? 'Data de Ida' : t('booking.date')}</span>
            </div>
            <div className="font-normal">{formattedDate}</div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Clock size={16} className="text-brand mr-1" />
              <span>{bookingType === 'round-trip' ? 'Hora de Ida' : t('booking.time')}</span>
            </div>
            <div className="font-normal">
              {displayData.pickupTime ? 
                new Date(`2000-01-01T${displayData.pickupTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : t('booking.notSpecifiedYet')}
            </div>
          </div>

          {bookingType === 'round-trip' && displayData.returnDate && (
            <>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar size={16} className="text-green-600 mr-1" />
                  <span>Data de Volta</span>
                </div>
                <div className="font-normal">{format(displayData.returnDate, "EEE, MMM d, yyyy")}</div>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Clock size={16} className="text-green-600 mr-1" />
                  <span>Hora de Volta</span>
                </div>
                <div className="font-normal">
                  {displayData.returnTime ? 
                    new Date(`2000-01-01T${displayData.returnTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : t('booking.notSpecifiedYet')}
                </div>
              </div>
            </>
          )}

          {bookingType === 'hourly' && displayData.durationHours && (
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Clock size={16} className="text-blue-600 mr-1" />
                <span>Duração</span>
              </div>
              <div className="font-normal">{displayData.durationHours} hora(s)</div>
            </div>
          )}

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Users size={16} className="text-brand mr-1" />
              <span>{t('booking.passengers')}</span>
            </div>
            <div className="font-normal">{displayData.passengers}</div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Briefcase size={16} className="text-brand mr-1" />
              <span>{t('booking.luggage')}</span>
            </div>
            <div className="font-normal">
              {luggage.small} {t('booking.small')}, {luggage.large} {t('booking.large')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicle */}
      {vehicle && (
        <div className="p-6 border-b">
          <h4 className="text-md font-medium mb-4">{t('booking.selectedVehicle')}</h4>
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-lg mr-3 flex items-center justify-center overflow-hidden">
              <img src={vehicle.image} alt={vehicle.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h5 className="font-medium">{vehicle.name}</h5>
              <p className="text-sm text-gray-500">{vehicle.category}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Extras */}
      {extras.length > 0 && (
        <div className="p-6 border-b">
          <h4 className="text-md font-medium mb-4">{t('booking.selectedExtras')}</h4>
          <ul className="space-y-2">
            {extras.map(extra => (
              <li key={extra.id} className="flex justify-between">
                <span>{extra.name} (x{extra.quantity})</span>
                <span>${(extra.price * extra.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Total */}
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between mb-2">
          <span>{t('booking.vehiclePrice')}</span>
          <span>
            {isCalculating ? (
              <span className="text-gray-400">Calculando...</span>
            ) : (
              `$${pricing.vehiclePrice.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span>{t('booking.extras')}</span>
          <span>${pricing.extrasPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-medium">
          <span>{t('booking.total')}</span>
          <span>
            {isCalculating ? (
              <span className="text-gray-400">Calculando...</span>
            ) : (
              `$${pricing.total.toFixed(2)}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RideSummary;
