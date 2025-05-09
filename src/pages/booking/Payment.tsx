
import { useBooking } from "@/contexts/BookingContext";
import RideSummary from "@/components/RideSummary";
import StripePaymentForm from "@/components/StripePaymentForm";

const Payment = () => {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StripePaymentForm />
        </div>
        
        <div>
          <RideSummary />
        </div>
      </div>
    </div>
  );
};

export default Payment;
