import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Criando Payment Intent...');
    
    // Validate Stripe secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY não configurada');
      throw new Error("Stripe não configurado no servidor");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Parse request body
    const { amount, currency = "usd", metadata = {} } = await req.json();
    console.log('📋 Dados recebidos:', { amount, currency, metadata });

    // Validate required data
    if (!amount || amount <= 0) {
      throw new Error("Valor do pagamento inválido");
    }

    // Amount must be at least $0.50 USD
    if (amount < 50) {
      throw new Error("Valor mínimo é $0.50 USD");
    }

    console.log(`💰 Criando Payment Intent de ${amount} centavos (${(amount/100).toFixed(2)} USD)`);

    // Create Payment Intent (apenas criação, sem confirmação)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        source: 'transfer_website',
        created_at: new Date().toISOString(),
      },
      // NÃO incluir confirmation_method: 'manual' ou confirm: true
      // Isso será feito no frontend com Stripe Elements
    });

    console.log('✅ Payment Intent criado:', paymentIntent.id, 'Status:', paymentIntent.status);

    // Return only the necessary data for the frontend
    const response = {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
    });

  } catch (error) {
    console.error('❌ Erro ao criar Payment Intent:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Erro interno do servidor",
        details: "Falha ao criar Payment Intent"
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
}); 