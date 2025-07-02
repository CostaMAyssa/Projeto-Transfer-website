import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

serve(async (req) => {
  /* Pré-flight */ 
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  
  /** Caminho chamado (autocomplete | details) */ 
  const url = new URL(req.url);
  const action = url.pathname.split("/").pop(); // ex.: "…/autocomplete"
  
  /** API-key vindo do Supabase Secret */ 
  const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!googleApiKey) {
    return json({
      error: "GOOGLE_API_KEY não configurada no Supabase Secrets"
    }, 500);
  }
  
  try {
    switch(action) {
      /* ------------------------------------------------- */
      /*  AUTOCOMPLETE (Nova API)                        */
      /* ------------------------------------------------- */
      case "autocomplete": {
        if (req.method !== "POST") return methodNotAllowed();
        const { input } = await req.json();
        if (!input || input.length < 3) {
          return json({
            status: "INVALID_REQUEST",
            error_message: "input ≥ 3 caracteres"
          }, 400);
        }
        
        // Usar a Nova API do Google Places
        const requestBody = {
          input: input,
          includedRegionCodes: ["us"], // Apenas EUA
          languageCode: "en",
          locationBias: {
            rectangle: {
              low: {
                latitude: 40.0,    // Sul de NY
                longitude: -75.0   // Oeste de NJ
              },
              high: {
                latitude: 42.0,    // Norte de NY
                longitude: -73.0   // Leste de NY
              }
            }
          }
        };
        
        const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": googleApiKey
          },
          body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        return json(data);
      }
      
      /* ------------------------------------------------- */
      /*  DETAILS                                         */
      /* ------------------------------------------------- */
      case "details": {
        if (req.method !== "POST") return methodNotAllowed();
        const { place_id } = await req.json();
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
      /*  ROTA NÃO ENCONTRADA                              */
      /* ------------------------------------------------- */
      default:
        return json({
          error: "Endpoint não encontrado. Use /autocomplete ou /details"
        }, 404);
    }
  } catch (err) {
    console.error("Erro na Google Places API:", err);
    return json({
      status: "UNKNOWN_ERROR",
      error_message: "Erro interno no servidor"
    }, 500);
  }
});

/* ---------- Helpers ---------- */
function json(body: any, status = 200) {
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