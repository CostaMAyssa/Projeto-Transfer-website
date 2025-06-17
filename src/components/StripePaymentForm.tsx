import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise, formatCurrency, confirmPayment } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntent: PaymentIntentResult) => void;
  onError: (error: string) => void;
  bookingDetails?: {
    pickup: string;
    dropoff: string;
    vehicle: string;
    date: string;
    time: string;
  };
}

interface PaymentIntentResult {
  id: string;
  status: string;
  receipt_email?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'usd',
  onSuccess,
  onError,
  bookingDetails,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Configuração do CardElement
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
  };

  // Criar Payment Intent quando o componente carrega
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Usar Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('stripe-payment', {
          body: {
            amount: Math.round(amount * 100), // Converte para centavos
            currency,
            metadata: {
              pickup: bookingDetails?.pickup || '',
              dropoff: bookingDetails?.dropoff || '',
              vehicle: bookingDetails?.vehicle || '',
              date: bookingDetails?.date || '',
              time: bookingDetails?.time || '',
            },
          },
        });

        if (error) {
          throw error;
        }

        setClientSecret(data.client_secret);
      } catch (error) {
        console.error('Erro ao criar Payment Intent:', error);
        setError('Erro ao inicializar pagamento. Tente novamente.');
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, currency, bookingDetails]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe não foi carregado corretamente');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Elemento do cartão não encontrado');
      return;
    }

    // Validar informações do cliente
    if (!customerInfo.name || !customerInfo.email) {
      setError('Por favor, preencha nome e email');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirmar o pagamento
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        },
      });

      if (error) {
        console.error('Erro no pagamento:', error);
        setError(error.message || 'Erro no processamento do pagamento');
        onError(error.message || 'Erro no pagamento');
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Pagamento realizado com sucesso:', paymentIntent);
        toast({
          title: 'Pagamento Realizado!',
          description: `Pagamento de ${formatCurrency(amount)} processado com sucesso.`,
        });
        onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setError('Erro interno no processamento do pagamento');
      onError('Erro interno no pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: keyof typeof customerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamento Seguro
        </CardTitle>
        <CardDescription>
          Total: <span className="font-bold text-lg">{formatCurrency(amount)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações do Cliente */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Detalhes da Reserva */}
          {bookingDetails && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <div><strong>De:</strong> {bookingDetails.pickup}</div>
              <div><strong>Para:</strong> {bookingDetails.dropoff}</div>
              <div><strong>Veículo:</strong> {bookingDetails.vehicle}</div>
              <div><strong>Data:</strong> {bookingDetails.date} às {bookingDetails.time}</div>
            </div>
          )}

          {/* Elemento do Cartão */}
          <div>
            <Label>Informações do Cartão *</Label>
            <div className="border rounded-md p-3 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botão de Pagamento */}
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Pagar {formatCurrency(amount)}
              </>
            )}
          </Button>

          {/* Informações de Segurança */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            Pagamento seguro processado pelo Stripe
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Componente wrapper com Elements Provider
const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
