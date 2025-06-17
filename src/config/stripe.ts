// Configuração centralizada do Stripe
export const STRIPE_CONFIG = {
  // Chave pública LIVE do Stripe
  publishableKey: 'pk_live_51RVhwrC5H76xJS3LZLqaKgiRmRJMKrfpHOWejgmVwCwhbyBtDiiD4G5IQSLimkWjK86UshswNa8HmbKvbJSxFyrC00L4EbEvwc',
  
  // Configurações padrão
  currency: 'usd',
  country: 'US',
  locale: 'en-US' as const,
  
  // Configurações de aparência
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  
  // Métodos de pagamento permitidos
  paymentMethods: {
    card: {
      enabled: true,
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
    },
  },
};

// Função para validar se o Stripe está configurado
export function validateStripeConfig(): boolean {
  return Boolean(STRIPE_CONFIG.publishableKey);
}

// Função para obter configuração baseada no ambiente
export function getStripeConfig() {
  if (!validateStripeConfig()) {
    throw new Error('Stripe não está configurado corretamente');
  }
  
  return STRIPE_CONFIG;
} 