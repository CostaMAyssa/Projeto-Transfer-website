import React, { useState } from 'react';
import StripePaymentForm from '@/components/StripePaymentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/stripe';
import { toast } from '@/hooks/use-toast';

const PaymentExample = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [amount] = useState(150); // $150 exemplo

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('Pagamento realizado com sucesso:', paymentIntent);
    toast({
      title: 'Pagamento Realizado!',
      description: `Pagamento de ${formatCurrency(amount)} processado com sucesso.`,
    });
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error('Erro no pagamento:', error);
    toast({
      title: 'Erro no Pagamento',
      description: error,
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Sistema de Pagamento Stripe
          </h1>

          {!showPayment ? (
            <Card>
              <CardHeader>
                <CardTitle>Exemplo de Reserva</CardTitle>
                <CardDescription>
                  Demonstração do sistema de pagamento integrado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Detalhes da Reserva:</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>De:</strong> Queens, NY</div>
                    <div><strong>Para:</strong> JFK Airport</div>
                    <div><strong>Veículo:</strong> Sedan Executivo</div>
                    <div><strong>Data:</strong> Hoje às 14:00</div>
                    <div><strong>Valor:</strong> {formatCurrency(amount)}</div>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Pagar {formatCurrency(amount)}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setShowPayment(false)}
                className="mb-4"
              >
                ← Voltar
              </Button>
              
              <StripePaymentForm
                amount={amount}
                currency="usd"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                bookingDetails={{
                  pickup: 'Queens, NY',
                  dropoff: 'JFK Airport',
                  vehicle: 'Sedan Executivo',
                  date: 'Hoje',
                  time: '14:00',
                }}
              />
            </div>
          )}

          {/* Informações sobre o Stripe */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>🔒 Pagamentos processados de forma segura pelo Stripe</p>
            <p>✅ Chave LIVE configurada para produção</p>
            <p>💳 Aceita todos os principais cartões de crédito</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentExample; 