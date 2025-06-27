import { useBooking } from "@/contexts/BookingContext";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Confirmation = () => {
  const { bookingData, reservationId, calculateTotal } = useBooking();
  const [totalAmount, setTotalAmount] = useState(0);
  
  useEffect(() => {
    // Calculate total when component mounts
    const getTotal = async () => {
      try {
        const { total } = await calculateTotal();
        setTotalAmount(total);
      } catch (error) {
        console.error('Error calculating total:', error);
        setTotalAmount(bookingData.vehicle?.price || 0);
      }
    };
    
    getTotal();
  }, [calculateTotal, bookingData.vehicle]);
  
  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM dd, yyyy", { locale: ptBR });
  };

  // Get dynamic email - prefer passenger email, fallback to payment email
  const confirmationEmail = bookingData.passengerDetails.email || 
                           bookingData.paymentDetails.email || 
                           'contato@aztransfer.com';

  // Get dynamic payment method
  const paymentMethod = bookingData.paymentDetails.paymentMethod || 'Cartão de Crédito';

  console.log('📧 Email para confirmação:', confirmationEmail);
  console.log('💰 Total calculado:', totalAmount);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Success Message */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-brand flex items-center justify-center">
            <Check size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-normal mb-2">Sistema, seu pedido foi enviado com sucesso!</h1>
        <p className="text-gray-600">
          Os detalhes da reserva foram enviados para: {confirmationEmail}
        </p>
      </div>

      {/* Order Summary */}
      <div className="border rounded-lg overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 p-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Número do pedido</p>
            <p className="font-normal">{reservationId}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Data</p>
            <p className="font-normal">{formatDate(bookingData.pickupDate)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Total</p>
            <p className="font-normal">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Método de pagamento</p>
            <p className="font-normal">{paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="border rounded-lg overflow-hidden mb-8">
        <h2 className="bg-gray-50 p-4 font-normal border-b">Informações de reserva</h2>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">Endereço de retirada</p>
              <p className="font-normal">{bookingData.pickupLocation.address}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Endereço de entrega</p>
              <p className="font-normal">{bookingData.dropoffLocation.address}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Data de retirada</p>
              <p className="font-normal">{formatDate(bookingData.pickupDate)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Horário de coleta</p>
              <p className="font-normal">{bookingData.pickupTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Vehicle */}
      {bookingData.vehicle && (
        <div className="border rounded-lg overflow-hidden mb-8">
          <h2 className="bg-gray-50 p-4 font-normal border-b">Carro selecionado</h2>
          
          <div className="p-6">
            <img 
              src={bookingData.vehicle.image} 
              alt={bookingData.vehicle.name} 
              className="w-full max-h-56 object-contain mb-6" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Aula</p>
                <p className="font-normal">{bookingData.vehicle.category}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Carros</p>
                <p className="font-normal">{bookingData.vehicle.models.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return to Home Button */}
      <div className="text-center mt-8">
        <Button asChild className="bg-brand hover:bg-brand-600 text-white px-8 py-6 text-lg">
          <a href="/">Voltar para casa</a>
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
