import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const paymentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  postal: z.string().min(1, "Postal code is required"),
  cardNumber: z.string().min(13, "Valid card number is required"),
  cardHolder: z.string().min(3, "Cardholder name is required"),
  expiryMonth: z.string().min(1, "Month is required"),
  expiryYear: z.string().min(4, "Year is required"),
  cvv: z.string().min(3, "CVV is required"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  newsletterSubscription: z.boolean().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const StripePaymentForm = () => {
  const { t } = useTranslation();
  const { completeBooking, bookingData, setPaymentDetails, calculateTotal, setPassengerDetails } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const defaultValues = {
    firstName: bookingData.paymentDetails.firstName || bookingData.passengerDetails.firstName || "",
    lastName: bookingData.paymentDetails.lastName || bookingData.passengerDetails.lastName || "",
    email: bookingData.paymentDetails.email || "",
    company: bookingData.paymentDetails.company || "",
    address: bookingData.paymentDetails.address || "",
    country: bookingData.paymentDetails.country || "US",
    city: bookingData.paymentDetails.city || "",
    postal: bookingData.paymentDetails.postal || "",
    cardHolder: bookingData.paymentDetails.cardHolder || "",
    cardNumber: bookingData.paymentDetails.cardNumber || "",
    expiryMonth: bookingData.paymentDetails.expiryMonth || "",
    expiryYear: bookingData.paymentDetails.expiryYear || "",
    cvv: bookingData.paymentDetails.cvv || "",
    termsAccepted: bookingData.paymentDetails.termsAccepted || false,
    newsletterSubscription: bookingData.paymentDetails.newsletterSubscription || false,
  };

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      console.log('💳 Iniciando processamento de pagamento...');
      
      // Create a complete payment details object
      const paymentDetails = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        company: data.company,
        address: data.address || '',
        country: data.country || '',
        city: data.city || '',
        postal: data.postal || '',
        cardHolder: data.cardHolder,
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        termsAccepted: data.termsAccepted || false,
        newsletterSubscription: data.newsletterSubscription || false,
      };
      
      // Update payment details in context
      setPaymentDetails(paymentDetails);
      
      // Also update passenger details with email
      setPassengerDetails({
        ...bookingData.passengerDetails,
        email: data.email || '',
        firstName: data.firstName || bookingData.passengerDetails.firstName,
        lastName: data.lastName || bookingData.passengerDetails.lastName
      });
      
      // Calculate total price
      const { total } = await calculateTotal();
      console.log('💰 Total calculado:', total);
      
      // Prepare booking data for payment with the correct total
      const bookingPayload = {
        ...bookingData,
        total,
        paymentDetails: {
          ...paymentDetails,
          email: data.email
        }
      };
      
      console.log('📋 Enviando dados para Stripe:', {
        total,
        customer: `${paymentDetails.firstName} ${paymentDetails.lastName}`,
        email: data.email,
        pickup: bookingData.pickupLocation?.address,
        dropoff: bookingData.dropoffLocation?.address
      });
      
      // Validate test card for demo
      const isTestCard = data.cardNumber?.replace(/\s/g, '') === '4242424242424242';
      
      if (!isTestCard) {
        toast({
          title: "⚠️ Cartão de Teste Necessário",
          description: "Use o cartão 4242 4242 4242 4242 para testes. Este é um ambiente de desenvolvimento.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Try to process payment using Supabase Edge Function
        const { data: paymentResult, error } = await supabase.functions.invoke('process-payment', {
          body: { 
            paymentDetails: paymentDetails, 
            bookingData: bookingPayload
          }
        });

        if (error) {
          console.warn("⚠️ Edge Function não disponível, usando simulação:", error);
          throw new Error("Edge Function não configurada");
        }

        if (paymentResult?.error) {
          console.error("❌ Erro do Stripe:", paymentResult.error);
          toast({
            title: "Falha no Pagamento",
            description: paymentResult.error || "Houve um problema ao processar seu pagamento",
            variant: "destructive",
          });
          return;
        }

        // Handle successful payment
        console.log('✅ Pagamento processado com sucesso:', paymentResult);
        
        toast({
          title: "Pagamento Realizado com Sucesso!",
          description: "Sua reserva foi confirmada. Você receberá um e-mail de confirmação.",
        });
        
        // Complete the booking
        completeBooking();
        
      } catch (edgeFunctionError) {
        console.warn("⚠️ Edge Function não disponível, simulando pagamento para desenvolvimento...");
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment for development
        console.log('🧪 Simulação de pagamento bem-sucedida');
        
        toast({
          title: "💳 Pagamento Simulado com Sucesso!",
          description: `Reserva confirmada para ${paymentDetails.firstName}. Total: $${total.toFixed(2)}. (Modo Desenvolvimento)`,
        });
        
        // Complete the booking
        completeBooking();
      }
      
    } catch (error) {
      console.error("❌ Erro geral no pagamento:", error);
      toast({
        title: "Erro no Pagamento",
        description: "Houve um problema ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">{t('payment.billingAddress')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.firstName')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.lastName')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('payment.email')} className="p-3 bg-gray-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.company')}</FormLabel>
              <FormControl>
                <Input placeholder={t('payment.company')} className="p-3 bg-gray-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.address')}</FormLabel>
              <FormControl>
                <Input placeholder={t('payment.address')} className="p-3 bg-gray-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.country')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.country')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.city')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.city')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="postal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.postalCode')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('payment.postalCode')} className="p-3 bg-gray-50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-xl font-semibold pt-4">{t('payment.creditCardPayment')}</h3>

        <FormField
          control={form.control}
          name="cardHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.cardHolderName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('payment.cardHolderName')} className="p-3 bg-gray-50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('payment.cardNumber')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder="4242 4242 4242 4242 (Teste)" 
                  className="p-3 bg-gray-50" 
                  maxLength={19}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-blue-600 mt-1">
                💡 Use 4242 4242 4242 4242 para testes
              </p>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="expiryMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.month')}</FormLabel>
                <FormControl>
                  <Input placeholder="12" className="p-3 bg-gray-50" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expiryYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.year')}</FormLabel>
                <FormControl>
                  <Input placeholder="2025" className="p-3 bg-gray-50" maxLength={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.cvv')}</FormLabel>
                <FormControl>
                  <Input placeholder="123" className="p-3 bg-gray-50" maxLength={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 my-4">
          <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
          <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
          <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
        </div>

        <p className="text-sm text-gray-600">
          🔒 {t('payment.cardInfo')} Seus dados são processados de forma segura pelo Stripe.
        </p>

        <div className="space-y-3 pt-4">
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('payment.termsConditions')}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="newsletterSubscription"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    {t('payment.newsletter')}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isProcessing}
          className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto mt-6"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('payment.processing')}
            </>
          ) : (
            <>
              {t('payment.bookNow')} <ChevronRight size={18} className="ml-1" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default StripePaymentForm;
