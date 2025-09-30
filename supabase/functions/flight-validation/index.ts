// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Declarações de tipos para o ambiente Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface FlightValidationRequest {
  flight_number: string;
  airline?: string;
  date: string; // Data do voo no formato YYYY-MM-DD
  time: string; // Hora do agendamento no formato HH:MM
  booking_type: 'pickup' | 'dropoff'; // Tipo de agendamento
}

interface FlightValidationResponse {
  success: boolean;
  flight_found: boolean;
  validation_result: {
    is_valid: boolean;
    suggested_time?: string;
    suggested_date?: string;
    reason?: string;
    flight_info?: {
      flight_number: string;
      airline: string;
      departure_time: string;
      arrival_time: string;
      departure_airport: string;
      arrival_airport: string;
      terminal?: string;
      gate?: string;
      status: string;
    };
  };
  error?: string;
}

class FlightValidationService {
  accessKey: string;
  baseUrl = 'https://www.goflightlabs.com';
  supabase: any;

  constructor(accessKey: string, supabaseUrl: string, supabaseKey: string) {
    this.accessKey = accessKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append('access_key', this.accessKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    
    console.log(`🔍 Buscando voo: ${url.toString()}`);
    
    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error(`❌ Erro na API GoFlightLabs: ${response.status} - ${response.statusText}`);
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Resposta da API:`, JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error(`❌ Erro na requisição:`, error);
      throw error;
    }
  }

  // Mapeamento de prefixos para códigos IATA
  extractFlightNumber(fullFlightNumber: string): string {
    const AIRLINE_MAPPING: Record<string, string> = {
      // Brasileiras
      'LATAM': 'LA', 'GOL': 'G3', 'AZUL': 'AD', 'TAM': 'JJ',
      // Americanas
      'AMERICAN': 'AA', 'DELTA': 'DL', 'UNITED': 'UA', 'SOUTHWEST': 'WN',
      'JETBLUE': 'B6', 'FRONTIER': 'F9', 'SPIRIT': 'NK', 'ALASKA': 'AS',
      // Europeias
      'BRITISH AIRWAYS': 'BA', 'LUFTHANSA': 'LH', 'AIR FRANCE': 'AF',
      'KLM': 'KL', 'SWISS': 'LX', 'TAP': 'TP', 'RYANAIR': 'FR',
      // Asiáticas
      'JAPAN AIRLINES': 'NH', 'KOREAN AIR': 'KE', 'SINGAPORE': 'SQ',
      'THAI': 'TG', 'MALAYSIA': 'MH', 'CATHAY PACIFIC': 'CX',
      // Códigos IATA diretos
      'LA': 'LA', 'G3': 'G3', 'AD': 'AD', 'JJ': 'JJ',
      'AA': 'AA', 'DL': 'DL', 'UA': 'UA', 'WN': 'WN',
      'BA': 'BA', 'LH': 'LH', 'AF': 'AF', 'KL': 'KL'
    };
    
    const original = fullFlightNumber.toUpperCase().trim();
    
    // Se já está no formato correto (ex: LA3359, G31900)
    if (/^[A-Z]{2}\d+$/.test(original)) {
      return original;
    }
    
    // Tentar encontrar prefixo conhecido
    for (const [prefix, iataCode] of Object.entries(AIRLINE_MAPPING)) {
      if (original.startsWith(prefix)) {
        const remaining = original.substring(prefix.length);
        const numberMatch = remaining.match(/\d+/);
        const number = numberMatch ? numberMatch[0] : remaining;
        return `${iataCode}${number}`;
      }
    }
    
    // Fallback: usar como está
    return original;
  }

  adaptApiResponse(apiResponse: any): any {
    if (!apiResponse) return null;
    
    try {
      // Verificar se é o novo formato da API com campos em maiúsculas
      if (apiResponse.DATE && apiResponse.FROM && apiResponse.TO) {
        const flightDate = this.parseFlightDate(apiResponse.DATE);
        const depIata = this.extractIataCode(apiResponse.FROM);
        const arrIata = this.extractIataCode(apiResponse.TO);
        
        const scheduledDeparture = this.createISODateTime(flightDate, apiResponse.STD);
        const scheduledArrival = this.createISODateTime(flightDate, apiResponse.STA);
        
        return {
          flight_date: flightDate,
          flight_status: this.parseFlightStatus(apiResponse.STATUS),
          departure: {
            airport: apiResponse.FROM,
            iata: depIata,
            scheduled: scheduledDeparture,
            terminal: '',
            gate: ''
          },
          arrival: {
            airport: apiResponse.TO,
            iata: arrIata,
            scheduled: scheduledArrival,
            terminal: '',
            gate: ''
          },
          airline: {
            name: 'Unknown Airline',
            iata: 'UNK'
          },
          flight: {
            iata: 'UNK0000'
          }
        };
      }
      
      // Formato antigo da API
      return {
        flight_date: apiResponse.updated ? new Date(apiResponse.updated * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        flight_status: apiResponse.status || 'scheduled',
        departure: {
          airport: apiResponse.dep_name || 'Unknown Airport',
          iata: apiResponse.dep_iata || 'UNK',
          scheduled: apiResponse.dep_time || new Date().toISOString(),
          terminal: apiResponse.dep_terminal || '',
          gate: apiResponse.dep_gate || ''
        },
        arrival: {
          airport: apiResponse.arr_name || 'Unknown Airport',
          iata: apiResponse.arr_iata || 'UNK',
          scheduled: apiResponse.arr_time || new Date().toISOString(),
          terminal: apiResponse.arr_terminal || '',
          gate: apiResponse.arr_gate || ''
        },
        airline: {
          name: apiResponse.airline_name || 'Unknown Airline',
          iata: apiResponse.airline_iata || 'UNK'
        },
        flight: {
          iata: apiResponse.flight_iata || 'UNK0000'
        }
      };
    } catch (error) {
      console.error('Erro ao adaptar resposta da API:', error);
      return null;
    }
  }

  parseFlightDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }

  extractIataCode(airportStr: string): string {
    const match = airportStr.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : 'UNK';
  }

  createISODateTime(date: string, time: string): string {
    if (!time || time === '—') return '';
    try {
      const dateTime = new Date(`${date}T${time}:00.000Z`);
      return dateTime.toISOString();
    } catch (error) {
      return '';
    }
  }

  parseFlightStatus(statusStr: string): string {
    if (!statusStr) return 'scheduled';
    const status = statusStr.toLowerCase();
    if (status.includes('landed')) return 'landed';
    if (status.includes('scheduled')) return 'scheduled';
    if (status.includes('delayed')) return 'delayed';
    if (status.includes('cancelled')) return 'cancelled';
    return 'scheduled';
  }

  async getFlightInfo(flightNumber: string, date: string): Promise<any> {
    try {
      const cleanFlightNumber = this.extractFlightNumber(flightNumber);
      const params = { 
        flight_number: cleanFlightNumber,
        date: date
      };

      console.log(`🔍 Buscando voo: ${cleanFlightNumber} na data: ${date}`);

      const response = await this.makeRequest('flight', params);

      if (response?.data?.error || (response?.data && typeof response.data === 'string' && response.data.includes('Nenhum dado foi encontrado'))) {
        console.warn('⚠️ Voo não encontrado');
        return null;
      }

      if (response?.success === false && response?.data && typeof response.data === 'string') {
        if (response.data.includes('Nenhum dado foi encontrado') || 
            response.data.includes('verifique o número do voo')) {
          console.warn('⚠️ Voo não encontrado na data especificada');
          return null;
        }
      }

      if (!response?.success || !response.data) {
        console.warn('Nenhum registro válido retornado');
        return null;
      }

      let rawData;
      if (Array.isArray(response.data) && response.data.length > 0) {
        rawData = this.adaptApiResponse(response.data[0]);
      } else if (typeof response.data === 'object') {
        rawData = this.adaptApiResponse(response.data);
      }

      if (!rawData) {
        console.error('Não foi possível adaptar a resposta da API');
        return null;
      }

      return rawData;
    } catch (error) {
      console.error('Erro ao buscar informações do voo:', error);
      throw error;
    }
  }

  validateBookingTime(flightData: any, bookingTime: string, bookingDate: string, bookingType: 'pickup' | 'dropoff'): {
    is_valid: boolean;
    suggested_time?: string;
    suggested_date?: string;
    reason?: string;
  } {
    if (!flightData) {
      return {
        is_valid: false,
        reason: 'Dados do voo não encontrados'
      };
    }

    const flightDepartureTime = new Date(flightData.departure.scheduled);
    const flightArrivalTime = new Date(flightData.arrival.scheduled);
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`);

    console.log('🕐 Validação de horário:', {
      flightDeparture: flightDepartureTime.toISOString(),
      flightArrival: flightArrivalTime.toISOString(),
      bookingDateTime: bookingDateTime.toISOString(),
      bookingType
    });

    if (bookingType === 'dropoff') {
      // Para drop-off: deve ser pelo menos 1.5h antes do voo
      const minTimeBeforeFlight = new Date(flightDepartureTime.getTime() - 90 * 60 * 1000); // 1.5h antes
      
      if (bookingDateTime > flightDepartureTime) {
        return {
          is_valid: false,
          suggested_time: minTimeBeforeFlight.toTimeString().slice(0, 5),
          suggested_date: minTimeBeforeFlight.toISOString().split('T')[0],
          reason: 'O horário de agendamento deve ser antes do voo'
        };
      }
      
      if (bookingDateTime > minTimeBeforeFlight) {
        return {
          is_valid: false,
          suggested_time: minTimeBeforeFlight.toTimeString().slice(0, 5),
          suggested_date: minTimeBeforeFlight.toISOString().split('T')[0],
          reason: 'Recomendamos agendar pelo menos 1.5h antes do voo'
        };
      }
      
      return { is_valid: true };
    } else {
      // Para pickup: deve ser pelo menos 30min após o pouso
      const minTimeAfterArrival = new Date(flightArrivalTime.getTime() + 30 * 60 * 1000); // 30min após
      
      if (bookingDateTime < flightArrivalTime) {
        return {
          is_valid: false,
          suggested_time: minTimeAfterArrival.toTimeString().slice(0, 5),
          suggested_date: minTimeAfterArrival.toISOString().split('T')[0],
          reason: 'O horário de agendamento deve ser após o pouso do voo'
        };
      }
      
      if (bookingDateTime < minTimeAfterArrival) {
        return {
          is_valid: false,
          suggested_time: minTimeAfterArrival.toTimeString().slice(0, 5),
          suggested_date: minTimeAfterArrival.toISOString().split('T')[0],
          reason: 'Recomendamos agendar pelo menos 30min após o pouso'
        };
      }
      
      return { is_valid: true };
    }
  }
}

serve(async (req: Request): Promise<Response> => {
  console.log('🚀 Flight Validation Function recebeu requisição:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar variáveis de ambiente
    const accessKey = Deno.env.get('GOFLIGHTLABS_ACCESS_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!accessKey) {
      throw new Error('GOFLIGHTLABS_ACCESS_KEY não configurada');
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis do Supabase não configuradas');
    }

    const flightService = new FlightValidationService(accessKey, supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const body: FlightValidationRequest = await req.json();
      
      console.log('📋 Dados recebidos:', body);
      
      const { flight_number, airline, date, time, booking_type } = body;
      
      if (!flight_number || !date || !time || !booking_type) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Parâmetros obrigatórios: flight_number, date, time, booking_type'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Buscar dados do voo
        const flightData = await flightService.getFlightInfo(flight_number, date);
        
        if (!flightData) {
          return new Response(JSON.stringify({
            success: true,
            flight_found: false,
            validation_result: {
              is_valid: false,
              reason: 'Voo não encontrado. Verifique o número do voo e a data.'
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Validar horário de agendamento
        const validation = flightService.validateBookingTime(flightData, time, date, booking_type);
        
        const response: FlightValidationResponse = {
          success: true,
          flight_found: true,
          validation_result: {
            ...validation,
            flight_info: {
              flight_number: flightData.flight.iata,
              airline: flightData.airline.name,
              departure_time: flightData.departure.scheduled,
              arrival_time: flightData.arrival.scheduled,
              departure_airport: flightData.departure.airport,
              arrival_airport: flightData.arrival.airport,
              terminal: flightData.departure.terminal,
              gate: flightData.departure.gate,
              status: flightData.flight_status
            }
          }
        };

        console.log('✅ Resposta de validação:', response);
        
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (flightError) {
        console.error('❌ Erro ao validar voo:', flightError);
        
        return new Response(JSON.stringify({
          success: false,
          error: 'Erro ao buscar informações do voo',
          message: flightError instanceof Error ? flightError.message : String(flightError)
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      error: 'Método não permitido. Use POST.'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro na Flight Validation Function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
