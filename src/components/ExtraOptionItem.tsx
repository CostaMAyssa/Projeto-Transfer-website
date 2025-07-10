import { useState } from "react";
import { ExtraType } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";

interface ExtraOptionItemProps {
  extra: ExtraType;
}

const ExtraOptionItem = ({
  extra
}: ExtraOptionItemProps) => {
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
  
  return (
    <div className="flex justify-between items-center py-5 border-b last:border-b-0">
      <div className="pl-4">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold">{extra.name}</h4>
          {extra.price > 0 && (
            <span className="ml-2 px-2 py-1 bg-brand text-white rounded-md text-sm">
              ${extra.price}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{extra.description}</p>
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
