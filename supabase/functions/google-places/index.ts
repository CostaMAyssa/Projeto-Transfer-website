import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface GooglePlacesAutocompleteRequest {
  input: string;
}

interface GooglePlacesDetailsRequest {
  place_id: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop(); // 'autocomplete' ou 'details'
    
    // Sua API Key do Google (configure nas variáveis de ambiente do Supabase)
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY') || 'AIzaSyC7UL6IW8GO6AjyLqXM555owrCPp4DbI7g';

    if (action === 'autocomplete') {
      if (req.method !== 'POST') {
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405 
          }
        )
      }

      const { input }: GooglePlacesAutocompleteRequest = await req.json();
      
      if (!input || input.length < 3) {
        return new Response(
          JSON.stringify({ 
            status: 'INVALID_REQUEST',
            error_message: 'Input deve ter pelo menos 3 caracteres' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Chamada para Google Places Autocomplete
      const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      placesUrl.searchParams.set('input', input);
      placesUrl.searchParams.set('key', googleApiKey);
      placesUrl.searchParams.set('components', 'administrative_area:NY|administrative_area:NJ|administrative_area:PA|administrative_area:CT');
      placesUrl.searchParams.set('types', 'geocode|establishment');
      placesUrl.searchParams.set('language', 'en');
      placesUrl.searchParams.set('region', 'us');

      console.log('Calling Google Places Autocomplete:', placesUrl.toString());

      const response = await fetch(placesUrl.toString());
      const data = await response.json();

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (action === 'details') {
      if (req.method !== 'POST') {
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405 
          }
        )
      }

      const { place_id }: GooglePlacesDetailsRequest = await req.json();
      
      if (!place_id) {
        return new Response(
          JSON.stringify({ 
            status: 'INVALID_REQUEST',
            error_message: 'place_id é obrigatório' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Chamada para Google Places Details
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.set('place_id', place_id);
      detailsUrl.searchParams.set('fields', 'geometry,formatted_address,address_components');
      detailsUrl.searchParams.set('key', googleApiKey);

      console.log('Calling Google Places Details:', detailsUrl.toString());

      const response = await fetch(detailsUrl.toString());
      const data = await response.json();

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Endpoint não encontrado. Use /autocomplete ou /details' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

  } catch (error) {
    console.error('Erro na Google Places API:', error)
    
    return new Response(
      JSON.stringify({ 
        status: 'UNKNOWN_ERROR',
        error_message: 'Erro interno no servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 