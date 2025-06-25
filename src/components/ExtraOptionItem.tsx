import { useState } from "react";
import { ExtraType } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useTranslation } from "react-i18next";

interface ExtraOptionItemProps {
  extra: ExtraType;
}

const ExtraOptionItem = ({
  extra
}: ExtraOptionItemProps) => {
  const { t } = useTranslation();
  const {
    updateExtraQuantity,
    bookingData
  } = useBooking();

  // Find if this extra already exists in the booking data
  const existingExtra = bookingData.extras.find(e => e.id === extra.id);
  const [quantity, setQuantity] = useState(existingExtra?.quantity || 0);
  
  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    updateExtraQuantity(extra.id, newQuantity);
  };
  
  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateExtraQuantity(extra.id, newQuantity);
    }
  };

  // Map extra IDs to translation keys
  const getExtraName = (extraId: string) => {
    const translationMap: Record<string, string> = {
      'child-seat': t('extras.childSeat'),
      'booster-seat': t('extras.boosterSeat'),
      'vodka-bottle': t('extras.vodkaBottle'),
      'flowers': t('extras.flowers'),
      'alcohol-package': t('extras.alcoholPackage'),
      'airport-assistance': t('extras.airportAssistance'),
      'bodyguard': t('extras.bodyguard')
    };
    return translationMap[extraId] || extra.name;
  };

  const getExtraDescription = (extraId: string) => {
    const translationMap: Record<string, string> = {
      'child-seat': t('extras.childSeatDesc'),
      'booster-seat': t('extras.boosterSeatDesc'),
      'vodka-bottle': t('extras.vodkaBottleDesc'),
      'flowers': t('extras.flowersDesc'),
      'alcohol-package': t('extras.alcoholPackageDesc'),
      'airport-assistance': t('extras.airportAssistanceDesc'),
      'bodyguard': t('extras.bodyguardDesc')
    };
    return translationMap[extraId] || extra.description;
  };
  
  return (
    <div className="flex justify-between items-center py-5 border-b last:border-b-0">
      <div className="pl-4">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold">{getExtraName(extra.id)}</h4>
          {extra.price > 0 && (
            <span className="ml-2 px-2 py-1 bg-brand text-white rounded-md text-sm">
              ${extra.price}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{getExtraDescription(extra.id)}</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full" 
          onClick={handleDecrement} 
          disabled={quantity === 0}
        >
          <Minus size={16} />
        </Button>
        
        <span className="w-4 text-center">{quantity}</span>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full" 
          onClick={handleIncrement}
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ExtraOptionItem;
