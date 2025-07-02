import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Stripe não configurado no servidor" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    // Body esperado: { amount: number, currency?: string, metadata?: Record<string, unknown> }
    const { amount, currency = "usd", metadata = {} } = await req.json();
    console.log("📋 Dados recebidos:", { amount, currency, metadata });

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Valor do pagamento inválido" }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (amount < 50) {
      return new Response(
        JSON.stringify({ error: "Valor mínimo é $0.50 USD" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        ...metadata,
        source: "transfer_website",
        created_at: new Date().toISOString(),
      },
    });

    console.log("✅ Payment Intent criado:", paymentIntent.id, "Status:", paymentIntent.status);

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Erro ao criar Payment Intent:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 400, headers: corsHeaders }
    );
  }
});
