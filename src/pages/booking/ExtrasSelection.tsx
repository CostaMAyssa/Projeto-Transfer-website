import { useBooking } from "@/contexts/BookingContext";
import RideSummary from "@/components/RideSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useExtras } from "@/hooks/useExtras";
import ExtraOptionItem from "@/components/ExtraOptionItem";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const ExtrasSelection = () => {
  const { t } = useTranslation();
  const { nextStep, prevStep, updateExtraQuantity, bookingData, setPassengerDetails, setAvailableExtras } = useBooking();
  const { extras, loading, error } = useExtras();
  const [notes, setNotes] = useState(bookingData.passengerDetails.notes || '');

  // Atualizar os extras disponíveis no contexto quando carregados
  useEffect(() => {
    if (extras.length > 0) {
      console.log('🔄 Atualizando extras disponíveis no contexto:', extras.length);
      setAvailableExtras(extras);
    }
  }, [extras, setAvailableExtras]);

  const handleSelectExtra = (extraId: string) => {
    // Verificar se o extra já está selecionado
    const existingExtra = bookingData.extras.find(e => e.id === extraId);
    if (existingExtra) {
      // Se já está selecionado, remover (quantidade 0)
      updateExtraQuantity(extraId, 0);
    } else {
      // Se não está selecionado, adicionar com quantidade 1
      updateExtraQuantity(extraId, 1);
    }
  };

  const handleContinue = () => {
    // Salvar as observações no contexto antes de continuar
    setPassengerDetails({
      ...bookingData.passengerDetails,
      notes: notes
    });
    nextStep();
  };

  // Mostrar loading enquanto carrega os extras
  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-normal mb-6">{t('booking.extraOptions')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <RideSummary />
          </div>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-normal mb-6">{t('booking.extraOptions')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">
                {t('booking.errorLoadingExtras', 'Erro ao carregar extras. Tente novamente.')}
              </p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <RideSummary />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-normal mb-6">{t('booking.extraOptions')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Flight/Train Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">{t('booking.flightTrainNumber')}</label>
              <Input
                placeholder={t('booking.flightExample')}
                className="w-full p-3"
              />
            </div>

            {/* Extra Options */}
            {extras.length > 0 && (
              <div className="bg-white border rounded-lg overflow-hidden">
                {extras.slice(0, 4).map((extra) => (
                  <ExtraOptionItem key={extra.id} extra={extra} />
                ))}
              </div>
            )}

            {/* Services with Select Buttons */}
            {extras.length > 4 && (
              <div className="bg-white border rounded-lg overflow-hidden">
                {extras.slice(4).map((extra) => (
                  <div key={extra.id} className="p-4 border-b last:border-b-0 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {extra.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {extra.description}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        ${extra.price}
                      </p>
                    </div>
                    <Button
                      variant={bookingData.extras.find(e => e.id === extra.id) ? "default" : "outline"}
                      onClick={() => handleSelectExtra(extra.id)}
                      className="ml-4"
                    >
                      {bookingData.extras.find(e => e.id === extra.id) ? t('booking.selected') : t('booking.select')}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Observações */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">{t('booking.specialRequests')}</h3>
              <Textarea
                placeholder={t('booking.specialRequestsPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                {t('booking.back')}
              </Button>
              
              <Button onClick={handleContinue} className="flex items-center gap-2">
                {t('booking.continue')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Ride Summary */}
        <div className="lg:col-span-1">
          <RideSummary />
        </div>
      </div>
    </div>
  );
};

export default ExtrasSelection;
