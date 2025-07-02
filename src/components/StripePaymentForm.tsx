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
          console.warn("⚠️ Edge Function não disponível:", error);
          
          // For development, show error but don't complete booking
          toast({
            title: "⚠️ Ambiente de Desenvolvimento",
            description: "Edge Function não configurada. Configure o Stripe para processar pagamentos reais.",
            variant: "destructive",
          });
          return;
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

        // Only complete booking if payment was successful
        if (paymentResult?.success && paymentResult?.status === 'succeeded') {
          console.log('✅ Pagamento confirmado no Stripe:', paymentResult);
          
          toast({
            title: "Pagamento Realizado com Sucesso!",
            description: `Pagamento de $${total.toFixed(2)} confirmado. Sua reserva foi criada.`,
          });
          
          // Complete the booking ONLY after payment confirmation
          completeBooking();
        } else if (paymentResult?.requiresAction) {
          console.log('🔐 Pagamento requer autenticação 3D Secure');
          
          toast({
            title: "Autenticação Necessária",
            description: "Seu pagamento requer autenticação adicional. Por favor, complete a verificação.",
            variant: "destructive",
          });
          
          // Don't complete booking - payment needs additional action
          return;
        } else {
          console.error('❌ Pagamento não foi confirmado:', paymentResult);
          
          toast({
            title: "Pagamento Não Confirmado",
            description: "O pagamento não foi processado com sucesso. Tente novamente.",
            variant: "destructive",
          });
          return;
        }
        
      } catch (edgeFunctionError) {
        console.error("❌ Erro na Edge Function:", edgeFunctionError);
        
        toast({
          title: "Erro no Processamento",
          description: "Não foi possível processar o pagamento. Verifique se o Stripe está configurado corretamente.",
          variant: "destructive",
        });
        
        // Do NOT complete booking if payment processing failed
        return;
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
<<<<<<< HEAD
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Pagamento com Cartão de Crédito</h2>
        <p className="text-gray-600">Complete your booking with secure payment</p>
      </div>

      {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Stripe não configurado. Configure VITE_STRIPE_PUBLISHABLE_KEY no arquivo .env.local
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nome do Portador do Cartão</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Mayssa" className="p-3 bg-gray-50" {...field} />
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
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ferreira Costa" className="p-3 bg-gray-50" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="mayssa@example.com" className="p-3 bg-gray-50" {...field} />
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
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" className="p-3 bg-gray-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" className="p-3 bg-gray-50" {...field} />
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
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" className="p-3 bg-gray-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <select className="w-full p-3 bg-gray-50 border rounded-md" {...field}>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="BR">Brazil</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Número do Cartão</h3>
            
            <div className="p-4 border rounded-md bg-gray-50">
              <div className="p-3 bg-white border rounded-md">
                <CardElement options={cardElementOptions} />
              </div>
              {cardError && (
                <p className="text-red-600 text-sm mt-2">{cardError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                🔒 O cartão de crédito deve ser emitido em nome do motorista. Cartões de débito são aceitos em alguns locais e para algumas categorias de carros. Seus dados são processados de forma segura pelo Stripe.
              </p>
            </div>
          </div>

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
                      Aceito os Termos e Condições - Condições de Reserva e Política de Privacidade. *
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
                      Quero me inscrever na newsletter da Transfero (Dicas de viagem e ofertas especiais)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={!stripe || isProcessing || !paymentIntent}
            className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto mt-6"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Reservar Agora
              </>
            ) : (
              <>
                Reservar Agora <ChevronRight size={18} className="ml-1" />
              </>
=======
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
>>>>>>> parent of 9e703ee (pagamento com stripe)
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
