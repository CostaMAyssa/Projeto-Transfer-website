import { useState, useEffect } from "react";
import { useBooking } from "@/contexts/BookingContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronRight, AlertTriangle, Loader2 } from "lucide-react";
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

  const onSubmit = async (data: BillingFormData) => {
    if (!stripe || !elements) {
      console.error('❌ Stripe ou elements não disponível');
      toast({
        title: "Erro de Configuração",
        description: "Problema com a configuração do pagamento. Recarregue a página.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCardError('');

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado.');
      }

      console.log('💳 Criando Payment Method no frontend...');
      const { paymentMethod, error: createPaymentMethodError } = await stripe.createPaymentMethod({
        type: 'card',
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
      });

      if (createPaymentMethodError) {
        console.error('❌ Erro ao criar Payment Method:', createPaymentMethodError);
        console.error('Detalhes do erro Stripe:', createPaymentMethodError.code, createPaymentMethodError.type, createPaymentMethodError.param, createPaymentMethodError.decline_code);
        setCardError(createPaymentMethodError.message || 'Erro ao criar método de pagamento.');
        toast({
          title: "Erro no Pagamento",
          description: createPaymentMethodError.message || "Erro ao processar o pagamento. Tente novamente.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (!paymentMethod || !paymentMethod.id) {
        throw new Error('Payment Method não foi criado ou ID ausente.');
      }

      console.log('✅ Payment Method criado no frontend:', paymentMethod.id);
      console.log('💰 Iniciando criação do Payment Intent na Edge Function...');

      // Agora, enviamos o ID do PaymentMethod para a Edge Function
      const { data: intentData, error: intentError } = await supabase.functions.invoke('process-payment', {
        body: {
          paymentMethodId: paymentMethod.id, // Enviando apenas o ID seguro
          paymentDetails: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            company: data.company,
            address: data.address,
            country: data.country,
            city: data.city,
            postal: data.postal,
          },
          bookingData: {
            ...bookingData,
            total: (await calculateTotal()).total,
          },
        },
      });

      if (intentError) {
        console.error('❌ Erro ao criar Payment Intent na Edge Function:', intentError);
        toast({
          title: "Erro de Configuração",
          description: intentError.message || "Não foi possível inicializar o pagamento. Verifique a configuração do Stripe no servidor.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      setPaymentIntent(intentData);
      console.log('✅ Payment Intent criado pela Edge Function:', intentData.id);

      // Se o Payment Intent requer ação (ex: 3D Secure), confirmamos no frontend
      if (intentData.requiresAction && intentData.clientSecret) {
        console.log('🔐 Pagamento requer autenticação 3D Secure no frontend...');
        const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          { payment_method: paymentMethod.id } // Usamos o ID do PaymentMethod já criado
        );

        if (confirmError) {
          console.error('❌ Erro na confirmação 3D Secure:', confirmError);
          setCardError(confirmError.message || 'Erro na autenticação 3D Secure.');
          toast({
            title: "Erro no Pagamento",
            description: confirmError.message || "Erro na autenticação do cartão. Tente novamente.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        console.log('✅ Payment Intent confirmado após 3D Secure:', confirmedPaymentIntent);
        // Atualiza intentData com o resultado da confirmação
        intentData.status = confirmedPaymentIntent.status;
        intentData.id = confirmedPaymentIntent.id;
      }


      // Após a criação/confirmação do Payment Intent (pela EF ou 3D Secure), verificamos o status final
      if (intentData.status === 'succeeded') {
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
          paymentIntentId: intentData.id,
          paymentStatus: intentData.status,
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
        console.warn('⚠️ Status do pagamento final:', intentData.status);
        
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

      {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Chave pública do Stripe não configurada (VITE_STRIPE_PUBLISHABLE_KEY). O formulário de pagamento não funcionará.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Detalhes de Cobrança</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primeiro Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu primeiro nome" {...field} />
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
                    <Input placeholder="Seu sobrenome" {...field} />
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
                  <Input type="email" placeholder="seu@email.com" {...field} />
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
                <FormLabel>Empresa (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da sua empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <h2 className="text-2xl font-bold mb-4 mt-8">Endereço de Cobrança</h2>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço da rua" {...field} />
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
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="País" {...field} />
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
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} />
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
                    <Input placeholder="CEP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">Pagamento com Cartão de Crédito</h2>
          <p className="text-sm text-gray-600 mb-4">
            O cartão de crédito deve ser emitido em nome do motorista. Cartões de débito são aceitos em alguns locais e para algumas categorias de carros.
            Seus dados são processados de forma segura pelo Stripe.
          </p>
          
          <div className="border p-4 rounded-md">
            <Label htmlFor="card-element" className="mb-2 block">Número do Cartão</Label>
            <CardElement id="card-element" options={cardElementOptions} className="p-2 border rounded-md" />
            {cardError && <div className="text-red-500 text-sm mt-2"><AlertTriangle className="inline h-4 w-4 mr-1" />{cardError}</div>}
          </div>

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Aceito os Termos e Condições e a Reserva e Política de Privacidade.</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newsletterSubscription"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Quero me inscrever na newsletter da Transfero (Dicas de viagem e ofertas especiais)</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
              </>
            ) : (
              <>
                Pagar com Cartão de Crédito <ChevronRight className="ml-2 h-4 w-4" />
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
