import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

/** CORS padrão para todas as rotas */ 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE"
};

interface GooglePlacesAutocompleteRequest {
  input: string;
}

interface GooglePlacesDetailsRequest {
  place_id: string;
}

serve(async (req: Request) => {
  /* Pré-flight */ 
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  
  /** Caminho chamado (autocomplete | details | process-payment) */ 
  const url = new URL(req.url);
  const action = url.pathname.split("/").pop(); // ex.: "…/autocomplete"
  
  try {
    switch(action) {
      /* ------------------------------------------------- */
      /*  AUTOCOMPLETE                                    */
      /* ------------------------------------------------- */
      case "autocomplete": {
        const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!googleApiKey) {
          return json({ error: "GOOGLE_API_KEY não configurada no Supabase Secrets" }, 500);
        }
        if (req.method !== "POST") return methodNotAllowed();
        const { input } = (await req.json()) as GooglePlacesAutocompleteRequest;
        if (!input || input.length < 3) {
          return json({
            status: "INVALID_REQUEST",
            error_message: "input ≥ 3 caracteres"
          }, 400);
        }
        
        const placesUrl = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
        placesUrl.searchParams.set("input", input);
        placesUrl.searchParams.set("key", googleApiKey);
        placesUrl.searchParams.set("components", "country:us");
        placesUrl.searchParams.set("types", "geocode|establishment");
        placesUrl.searchParams.set("language", "en");
        placesUrl.searchParams.set("region", "us");
        placesUrl.searchParams.set("location", "40.7589,-73.9851");
        placesUrl.searchParams.set("radius", "100000");

        const data = await (await fetch(placesUrl.toString())).json();
        return json(data);
      }
      
      /* ------------------------------------------------- */
      /*  DETAILS                                         */
      /* ------------------------------------------------- */
      case "details": {
        const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!googleApiKey) {
          return json({ error: "GOOGLE_API_KEY não configurada no Supabase Secrets" }, 500);
        }
        if (req.method !== "POST") return methodNotAllowed();
        const { place_id } = (await req.json()) as GooglePlacesDetailsRequest;
        if (!place_id) {
          return json({
            status: "INVALID_REQUEST",
            error_message: "place_id obrigatório"
          }, 400);
        }
        
        const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
        detailsUrl.searchParams.set("place_id", place_id);
        detailsUrl.searchParams.set("fields", "geometry,formatted_address,address_components");
        detailsUrl.searchParams.set("key", googleApiKey);
        
        const data = await (await fetch(detailsUrl.toString())).json();
        return json(data);
      }
      
      /* ------------------------------------------------- */
      /*  PROCESS-PAYMENT (STRIPE)                       */
      /* ------------------------------------------------- */
      case "process-payment": {
        console.log('🔄 Criando Payment Intent...');

        const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeSecretKey) {
          console.error('❌ STRIPE_SECRET_KEY não configurada');
          return json({ error: "Stripe não configurado no servidor" }, 500);
        }

        const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
        if (req.method !== "POST") return methodNotAllowed();

        // Espera { amount: number, currency?: string, metadata?: Record<string, unknown> }
        const { amount, currency = "usd", metadata = {} } = (await req.json()) as {
          amount: number;
          currency?: string;
          metadata?: Record<string, unknown>;
        };
        console.log('📋 Dados recebidos:', { amount, currency, metadata });

        if (!amount || amount <= 0) {
          return json({ error: "Valor do pagamento inválido" }, 400);
        }
        if (amount < 50) {
          return json({ error: "Valor mínimo é $0.50 USD" }, 400);
        }

        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: { enabled: true },
            metadata: {
              ...metadata,
              source: 'transfer_website',
              created_at: new Date().toISOString(),
            },
          });

          console.log('✅ Payment Intent criado:', paymentIntent.id, 'Status:', paymentIntent.status);

          return json({
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          });
        } catch (error: unknown) {
          console.error('❌ Erro ao criar Payment Intent:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          return json(
            { error: errorMessage || "Erro interno do servidor", details: "Falha ao criar Payment Intent" },
            400
          );
        }
      }
      
      /* ------------------------------------------------- */
      /*  ROTA NÃO ENCONTRADA                              */
      /* ------------------------------------------------- */
      default:
        return json({
          error: "Endpoint não encontrado. Use /autocomplete, /details ou /process-payment"
        }, 404);
    }
  } catch (err: unknown) {
    console.error("Erro na API:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    if (err instanceof Error && 'type' in err && 'message' in err) {
      console.error("Stripe Error:", (err as any).type, err.message);
      
      return json({
        error: err.message || "Erro no processamento do pagamento",
        type: (err as any).type,
        code: (err as any).code
      }, 400);
    }
    
    if (action === 'autocomplete' || action === 'details') {
      return json({
        status: "UNKNOWN_ERROR",
        error_message: "Erro interno no servidor"
      }, 500);
    }
    
    return json({
      error: errorMessage || "Erro interno no servidor"
    }, 500);
  }
});

/* ---------- Helpers ---------- */
function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function methodNotAllowed() {
  return json({
    error: "Method not allowed"
  }, 405);
} 