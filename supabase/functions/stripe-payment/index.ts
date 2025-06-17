import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar Stripe com a chave secreta
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Inicializar Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { amount, currency = 'usd', metadata = {} } = await req.json()

    // Validar dados
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Valor já deve vir em centavos
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
      },
    })

    // Salvar no banco de dados para auditoria
    const { error: dbError } = await supabaseClient
      .from('payment_intents')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
        created_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError)
      // Não falha o pagamento por erro de auditoria
    }

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 