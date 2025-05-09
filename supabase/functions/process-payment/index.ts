
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
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Parse request body
    const { paymentDetails, bookingData } = await req.json();

    // Format data for stripe
    const total = bookingData.calculateTotal?.total || 0;
    const amount = Math.round(total * 100); // Convert to cents

    if (!amount || amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
      description: `Transfer service from ${bookingData.pickupLocation?.address} to ${bookingData.dropoffLocation?.address}`,
      metadata: {
        customerName: `${paymentDetails.firstName} ${paymentDetails.lastName}`,
        pickupLocation: bookingData.pickupLocation?.address,
        dropoffLocation: bookingData.dropoffLocation?.address,
        pickupDate: bookingData.pickupDate?.toString(),
        pickupTime: bookingData.pickupTime,
        passengers: bookingData.passengers?.toString(),
        vehicleName: bookingData.vehicle?.name || "Not selected"
      },
    });

    // Return client secret to the client
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error processing payment" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
