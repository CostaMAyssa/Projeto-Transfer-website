import { useBooking } from "@/contexts/BookingContext";
import RideSummary from "@/components/RideSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extras } from "@/data/mockData";
import ExtraOptionItem from "@/components/ExtraOptionItem";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const ExtrasSelection = () => {
  const { t } = useTranslation();
  const { nextStep, prevStep, updateExtraQuantity, bookingData } = useBooking();

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
            <div className="bg-white border rounded-lg overflow-hidden">
              {extras.slice(0, 4).map((extra) => (
                <ExtraOptionItem key={extra.id} extra={extra} />
              ))}
            </div>

            {/* Services with Select Buttons */}
            {extras.slice(4).map((extra) => {
              const isSelected = bookingData.extras.some(e => e.id === extra.id);
              return (
                <div key={extra.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-normal flex items-center">
                      {extra.name}
                      <span className="ml-2 px-2 py-1 bg-[#ED1B24] text-white rounded-md text-sm">
                        ${extra.price}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{extra.description}</p>
                  </div>
                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    className={isSelected 
                      ? "bg-[#ED1B24] text-white hover:bg-red-600" 
                      : "border-[#ED1B24] text-[#ED1B24] hover:bg-red-50"
                    }
                    onClick={() => handleSelectExtra(extra.id)}
                  >
                    {isSelected ? t('booking.selected') : t('booking.select')} <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              );
            })}

            {/* Notes for chauffeur */}
            <div className="mt-8">
              <h4 className="mb-2 font-normal">{t('booking.notesToDriver')}</h4>
              <Textarea
                placeholder={t('booking.notesToDriverPlaceholder')}
                className="w-full h-32 p-3"
              />
            </div>

            {/* Continue Button */}
            <div className="mt-6">
              <Button 
                onClick={nextStep} 
                className="bg-[#111111] hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto font-normal"
              >
                {t('booking.continue')} <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <RideSummary />
        </div>
      </div>
    </div>
  );
};

export default ExtrasSelection;
