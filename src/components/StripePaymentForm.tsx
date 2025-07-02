import { useState, useEffect } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const billingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  postal: z.string().min(1, "Postal code is required"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
  newsletterSubscription: z.boolean().optional(),
});

type BillingFormData = z.infer<typeof billingSchema>;

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      ':placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  disableLink: true,
};

const CheckoutForm = () => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { completeBooking, bookingData, setPaymentDetails, calculateTotal, setPassengerDetails } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<{ client_secret: string; id: string } | null>(null);
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
    termsAccepted: bookingData.paymentDetails.termsAccepted || false,
    newsletterSubscription: bookingData.paymentDetails.newsletterSubscription || false,
  };

  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues,
  });

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { total } = await calculateTotal();
        console.log('💰 Criando Payment Intent para:', total);

        const { data, error } = await supabase.functions.invoke('process-payment', {
          body: { 
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: {
              pickup: bookingData.pickupLocation?.address || '',
              dropoff: bookingData.dropoffLocation?.address || '',
              passengers: bookingData.passengers?.toString() || '1',
              vehicle: bookingData.vehicle?.name || '',
              bookingType: bookingData.bookingType || 'one-way'
            }
          }
        });

        if (error) {
          console.error('❌ Erro ao criar Payment Intent:', error);
          toast({
            title: "Erro de Configuração",
            description: "Não foi possível inicializar o pagamento. Verifique a configuração do Stripe.",
            variant: "destructive",
          });
          return;
        }

        setPaymentIntent(data);
        console.log('✅ Payment Intent criado:', data.id);
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
      }
    };

    createPaymentIntent();
  }, []);

  const onSubmit = async (data: BillingFormData) => {
    if (!stripe || !elements || !paymentIntent) {
      console.error('❌ Stripe, elements, ou paymentIntent não disponível');
      toast({
        title: "Erro de Configuração",
        description: "Problema com a configuração do pagamento. Recarregue a página.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCardError('');

    console.log('💳 Iniciando processo de pagamento SEGURO...');
    console.log('🔍 PaymentIntent ID:', paymentIntent.client_secret);
    console.log('📝 Dados do formulário:', data);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado');
      }

      console.log('🔄 Confirmando Payment Intent com Stripe Elements...');

      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              address: {
                line1: data.address,
                city: data.city,
                postal_code: data.postal,
                country: data.country,
              },
            },
          },
        }
      );

      if (error) {
        console.error('❌ Erro no pagamento:', error);
        setCardError(error.message || 'Erro desconhecido no pagamento');
        
        toast({
          title: "Erro no Pagamento",
          description: error.message || "Erro ao processar o pagamento. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Payment Intent confirmado:', confirmedPaymentIntent);

      if (confirmedPaymentIntent.status === 'succeeded') {
        console.log('🎉 Pagamento realizado com sucesso!');

        const paymentDetails = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          company: data.company,
          address: data.address,
          country: data.country,
          city: data.city,
          postal: data.postal,
          termsAccepted: data.termsAccepted,
          newsletterSubscription: data.newsletterSubscription,
          paymentIntentId: confirmedPaymentIntent.id,
          paymentStatus: confirmedPaymentIntent.status,
        };

        console.log('💾 Salvando detalhes do pagamento...');
        setPaymentDetails(paymentDetails);
        setPassengerDetails({
          ...bookingData.passengerDetails,
          email: data.email,
          firstName: data.firstName || bookingData.passengerDetails.firstName,
          lastName: data.lastName || bookingData.passengerDetails.lastName
        });

        toast({
          title: "Pagamento Realizado com Sucesso!",
          description: `Pagamento confirmado. Finalizando reserva...`,
        });

        console.log('🔄 Chamando completeBooking...');
        await completeBooking();
        
      } else {
        console.warn('⚠️ Status do pagamento:', confirmedPaymentIntent.status);
        
        toast({
          title: "Pagamento Pendente",
          description: "Seu pagamento está sendo processado. Você receberá uma confirmação em breve.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      
      toast({
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Erro inesperado ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t('payment.billingAddress')}</h2>
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
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

const StripePaymentForm = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default StripePaymentForm;
