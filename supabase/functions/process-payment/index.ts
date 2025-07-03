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

      // Enviar e-mail de confirmação usando SendGrid
      try {
        const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
        if (!sendgridApiKey) {
          console.error('❌ SENDGRID_API_KEY não configurada. E-mail de confirmação não será enviado.');
        } else {
          const sendgridApiUrl = "https://api.sendgrid.com/v3/mail/send";
          const emailSubject = "Confirmação da sua Reserva Transfero - Pagamento Aprovado!";
          const customerEmail = paymentDetails.email;
          const customerName = `${paymentDetails.firstName} ${paymentDetails.lastName}`;

          const emailBodyHtml = `
            <h1>Confirmação da sua Reserva Transfero</h1>
            <p>Olá ${customerName},</p>
            <p>Seu pagamento foi aprovado e sua reserva está confirmada!</p>
            
            <h2>Detalhes da Reserva:</h2>
            <ul>
              <li><strong>Tipo de Reserva:</strong> ${bookingData.bookingType || 'Não especificado'}</li>
              <li><strong>Origem:</strong> ${bookingData.pickupLocation?.address || 'Não especificado'}</li>
              <li><strong>Destino:</strong> ${bookingData.dropoffLocation?.address || 'Não especificado'}</li>
              <li><strong>Data:</strong> ${new Date(bookingData.pickupDate).toLocaleDateString('pt-BR') || 'Não especificada'}</li>
              <li><strong>Hora:</strong> ${bookingData.pickupTime || 'Não especificada'}</li>
              <li><strong>Veículo:</strong> ${bookingData.vehicle?.name || 'Não selecionado'}</li>
              <li><strong>Passageiros:</strong> ${bookingData.passengers || '1'}</li>
              <li><strong>Valor Total:</strong> USD ${bookingData.total?.toFixed(2) || '0.00'}</li>
            </ul>

            <h2>Detalhes do Pagamento:</h2>
            <ul>
              <li><strong>ID do Pagamento:</strong> ${paymentIntent.id}</li>
              <li><strong>Status:</strong> ${paymentIntent.status}</li>
              <li><strong>Valor Pago:</strong> ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}</li>
            </ul>

            <p>Agradecemos a sua preferência!</p>
            <p>Atenciosamente,</p>
            <p>A Equipe Transfero</p>
          `;

          const emailPayload = {
            personalizations: [
              {
                to: [{ email: customerEmail, name: customerName }],
                subject: emailSubject,
              },
            ],
            from: { email: "no-reply@yourdomain.com", name: "Transfero" }, // TODO: Configurar um e-mail remetente real
            content: [
              {
                type: "text/html",
                value: emailBodyHtml,
              },
            ],
          };

          const sendEmailResponse = await fetch(sendgridApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sendgridApiKey}`,
            },
            body: JSON.stringify(emailPayload),
          });

          if (sendEmailResponse.ok) {
            console.log('📧 E-mail de confirmação enviado com sucesso!');
          } else {
            const errorBody = await sendEmailResponse.json();
            console.error('❌ Erro ao enviar e-mail de confirmação:', sendEmailResponse.status, errorBody);
          }
        }
      } catch (emailError) {
        console.error('❌ Exceção ao enviar e-mail de confirmação:', emailError);
      }
      
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
