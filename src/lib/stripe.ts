import { loadStripe, Stripe, StripeElements, PaymentMethodCreateParams } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '@/config/stripe';

// Inicializa o Stripe com a configuração centralizada
export const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

// Re-exporta configurações para compatibilidade
export const stripeConfig = STRIPE_CONFIG;

// Tipos para pagamentos
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

// Função para criar Payment Intent
export async function createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
  try {
    // Chama a Edge Function do Supabase para criar o Payment Intent
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Converte para centavos
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar Payment Intent');
    }

    const paymentIntent = await response.json();
    return paymentIntent;
  } catch (error) {
    console.error('Erro ao criar Payment Intent:', error);
    throw error;
  }
}

// Função para confirmar pagamento
export async function confirmPayment(
  stripe: Stripe,
  clientSecret: string,
  paymentMethod: string | object
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod as any,
    });

    if (error) {
      console.error('Erro no pagamento:', error);
      return { success: false, error: error.message };
    }

    if (paymentIntent.status === 'succeeded') {
      return { success: true };
    } else {
      return { success: false, error: 'Pagamento não foi processado' };
    }
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return { success: false, error: 'Erro interno no pagamento' };
  }
}

// Função para formatar valor em dólares
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Função para validar cartão de crédito
export function validateCard(cardNumber: string, expiryDate: string, cvc: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar número do cartão (Luhn algorithm)
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    errors.push('Número do cartão inválido');
  }

  // Validar data de expiração
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
    errors.push('Data de expiração inválida');
  } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    errors.push('Cartão expirado');
  }

  // Validar CVC
  if (!/^\d{3,4}$/.test(cvc)) {
    errors.push('CVC inválido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
} 