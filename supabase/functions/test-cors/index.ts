import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  console.log("Requisição recebida para test-cors:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Respondendo OPTIONS com 200 OK e CORS headers");
    return new Response("ok", { headers: corsHeaders });
  }

  // Simples resposta para outros métodos para confirmar que a função roda
  return new Response("Hello from test-cors function!", {
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });
}); 