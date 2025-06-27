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
    console.log('🔄 Iniciando processamento de pagamento...');
    
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
    const { paymentDetails, bookingData } = await req.json();
    console.log('📋 Dados recebidos:', {
      customer: `${paymentDetails?.firstName} ${paymentDetails?.lastName}`,
      total: bookingData?.total,
      pickup: bookingData?.pickupLocation?.address,
      dropoff: bookingData?.dropoffLocation?.address
    });

    // Validate required data
    if (!paymentDetails || !bookingData) {
      throw new Error("Dados de pagamento ou reserva não fornecidos");
    }

    // Format amount for Stripe (convert to cents)
    const total = bookingData.total || 0;
    const amount = Math.round(total * 100);

    if (!amount || amount <= 0) {
      throw new Error("Valor do pagamento inválido");
    }

    console.log(`💰 Processando pagamento de $${total} (${amount} cents)`);

    // Create payment method for card
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: paymentDetails.cardNumber?.replace(/\s/g, ''),
        exp_month: parseInt(paymentDetails.expiryMonth),
        exp_year: parseInt(paymentDetails.expiryYear),
        cvc: paymentDetails.cvv,
      },
      billing_details: {
        name: paymentDetails.cardHolder,
        address: {
          line1: paymentDetails.address,
          city: paymentDetails.city,
          postal_code: paymentDetails.postal,
          country: paymentDetails.country,
        },
      },
    });

    console.log('💳 Payment method criado:', paymentMethod.id);

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method: paymentMethod.id,
      confirmation_method: 'manual',
      confirm: true,
      return_url: 'https://your-website.com/return',
      description: `Transfer service from ${bookingData.pickupLocation?.address || 'Unknown'} to ${bookingData.dropoffLocation?.address || 'Unknown'}`,
      metadata: {
        customerName: `${paymentDetails.firstName} ${paymentDetails.lastName}`,
        customerEmail: paymentDetails.email || '',
        pickupLocation: bookingData.pickupLocation?.address || '',
        dropoffLocation: bookingData.dropoffLocation?.address || '',
        pickupDate: bookingData.pickupDate?.toString() || '',
        pickupTime: bookingData.pickupTime || '',
        passengers: bookingData.passengers?.toString() || '1',
        vehicleName: bookingData.vehicle?.name || "Not selected",
        bookingType: bookingData.bookingType || 'one-way',
        company: paymentDetails.company || '',
      },
    });

    console.log('✅ Payment Intent criado:', paymentIntent.id, 'Status:', paymentIntent.status);

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      console.log('🎉 Pagamento realizado com sucesso!');
      
      return new Response(
        JSON.stringify({
          success: true,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: amount,
          currency: paymentIntent.currency,
          customer: `${paymentDetails.firstName} ${paymentDetails.lastName}`,
          message: "Pagamento processado com sucesso"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (paymentIntent.status === 'requires_action') {
      console.log('🔐 Pagamento requer autenticação 3D Secure');
      
      return new Response(
        JSON.stringify({
          requiresAction: true,
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          message: "Pagamento requer autenticação adicional"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.error('❌ Pagamento falhou. Status:', paymentIntent.status);
      
      return new Response(
        JSON.stringify({
          error: `Pagamento não foi processado. Status: ${paymentIntent.status}`,
          status: paymentIntent.status,
          paymentIntentId: paymentIntent.id
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("❌ Erro no processamento do pagamento:", error);
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe Error:", error.type, error.message);
      
      return new Response(
        JSON.stringify({
          error: error.message || "Erro no processamento do pagamento",
          type: error.type,
          code: error.code
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Handle general errors
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno no servidor" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
