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
interface FlightApiResponse {
  [key: string]: any;
}

interface FlightParams {
  flight_number?: string;
  flight_iata?: string;
  date?: string;
}

class GoFlightLabsService {
  accessKey: string;
  baseUrl = 'https://www.goflightlabs.com';
  supabase: any;
  constructor(accessKey: string, supabaseUrl: string, supabaseKey: string){
    this.accessKey = accessKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    // Adiciona access_key como primeiro parâmetro para garantir formato correto
    url.searchParams.append('access_key', this.accessKey);
    // Adiciona os demais parâmetros da requisição
    Object.entries(params).forEach(([key, value])=>{
      url.searchParams.append(key, String(value));
    });
    
    console.log(`Fazendo requisição para: ${url.toString()}`);
    
    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error(`❌ Erro na API GoFlightLabs: ${response.status} - ${response.statusText}`);
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Detalhes do erro:`, errorData);
        throw new Error(`Erro na API GoFlightLabs: ${response.status} - ${response.statusText}. Se o problema persistir, entre em contato: hello@goflightlabs.com ou considere usar AviationStack API.`);
      }
      
      const data = await response.json() as FlightApiResponse;
      console.log(`✅ Resposta da API (${endpoint}):`, JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error(`❌ Erro na requisição para ${endpoint}:`, error);
      throw error;
    }
  }
  transformFlightData(rawData: any): any {
    console.log('Dados brutos recebidos:', JSON.stringify(rawData, null, 2));
    // Verifica se os objetos necessários existem
    if (!rawData.departure || !rawData.arrival || !rawData.flight || !rawData.airline) {
      console.error('Dados de voo incompletos:', rawData);
      throw new Error('Dados de voo incompletos ou em formato inválido');
    }
    // Verifica se scheduled existe antes de criar a data
    if (!rawData.departure.scheduled) {
      console.error('Campo departure.scheduled não encontrado:', rawData.departure);
      throw new Error('Campo departure.scheduled não encontrado nos dados do voo');
    }
    // Calcula horário de embarque sugerido (1.5h antes para voos internacionais, 1h para domésticos)
    const departureTime = new Date(rawData.departure.scheduled);
    const boardingTime = new Date(departureTime.getTime() - 90 * 60 * 1000) // 1.5h antes
    ;
    return {
      flightNumber: rawData.flight.iata || rawData.flight.number || 'Unknown',
      airline: {
        name: rawData.airline.name || 'Unknown',
        iata: rawData.airline.iata || 'Unknown',
        icao: rawData.airline.icao || 'Unknown'
      },
      departure: {
        airport: {
          name: rawData.departure.airport || 'Unknown',
          iata: rawData.departure.iata || 'Unknown',
          icao: rawData.departure.icao || 'Unknown'
        },
        terminal: rawData.departure.terminal,
        gate: rawData.departure.gate,
        scheduled: rawData.departure.scheduled,
        estimated: rawData.departure.estimated,
        actual: rawData.departure.actual,
        delay: rawData.departure.delay || 0
      },
      arrival: {
        airport: {
          name: rawData.arrival.airport || 'Unknown',
          iata: rawData.arrival.iata || 'Unknown',
          icao: rawData.arrival.icao || 'Unknown'
        },
        terminal: rawData.arrival.terminal,
        gate: rawData.arrival.gate,
        baggage: rawData.arrival.baggage,
        scheduled: rawData.arrival.scheduled || 'Unknown',
        estimated: rawData.arrival.estimated,
        actual: rawData.arrival.actual,
        delay: rawData.arrival.delay || 0
      },
      status: rawData.flight_status || 'Unknown',
      aircraft: {
        type: rawData.aircraft?.iata || 'N/A',
        registration: rawData.aircraft?.registration || 'N/A'
      },
      suggestedBoardingTime: boardingTime.toISOString()
    };
  }
  // Função para adaptar o novo formato de resposta da API para o formato esperado pelo sistema
  adaptApiResponse(apiResponse: any): any {
    console.log('Adaptando resposta da API:', JSON.stringify(apiResponse, null, 2));
    if (!apiResponse) return null;
    try {
      // Verificar se é o novo formato da API com campos em maiúsculas
      if (apiResponse.DATE && apiResponse.FROM && apiResponse.TO) {
        // Novo formato da API
        const flightDate = this.parseFlightDate(apiResponse.DATE);
        
        // Extrair códigos IATA dos aeroportos
        const depIata = this.extractIataCode(apiResponse.FROM);
        const arrIata = this.extractIataCode(apiResponse.TO);
        
        // Criar horários ISO a partir dos horários fornecidos
        const scheduledDeparture = this.createISODateTime(flightDate, apiResponse.STD);
        const scheduledArrival = this.createISODateTime(flightDate, apiResponse.STA);
        const actualDeparture = apiResponse.ATD && apiResponse.ATD !== '—' ? this.createISODateTime(flightDate, apiResponse.ATD) : '';
        
        // Extrair informações da aeronave
        const aircraftInfo = this.parseAircraftInfo(apiResponse.AIRCRAFT);
        
        const adaptedData = {
          flight_date: flightDate,
          flight_status: this.parseFlightStatus(apiResponse.STATUS),
          departure: {
            airport: apiResponse.FROM,
            timezone: 'UTC',
            iata: depIata,
            icao: '',
            terminal: '',
            gate: '',
            delay: 0,
            scheduled: scheduledDeparture,
            estimated: scheduledDeparture,
            actual: actualDeparture
          },
          arrival: {
            airport: apiResponse.TO,
            timezone: 'UTC',
            iata: arrIata,
            icao: '',
            terminal: '',
            gate: '',
            baggage: '',
            delay: 0,
            scheduled: scheduledArrival,
            estimated: scheduledArrival,
            actual: ''
          },
          airline: {
            name: 'Unknown Airline',
            iata: 'UNK',
            icao: 'UNKN'
          },
          flight: {
            number: '0000',
            iata: 'UNK0000',
            icao: 'UNKN0000',
            codeshared: null
          },
          aircraft: {
            registration: aircraftInfo.registration,
            iata: aircraftInfo.type,
            icao: aircraftInfo.type,
            icao24: ''
          },
          live: {
            updated: new Date().toISOString(),
            latitude: 0,
            longitude: 0,
            altitude: 0,
            direction: 0,
            speed_horizontal: 0,
            speed_vertical: 0,
            is_ground: false
          }
        };
        
        console.log('Dados adaptados com sucesso (novo formato):', JSON.stringify(adaptedData, null, 2));
        return adaptedData;
      }
      
      // Formato antigo da API (manter compatibilidade)
      const flightDate = apiResponse.updated ? new Date(apiResponse.updated * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const now = new Date();
      const scheduledDeparture = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
      const scheduledArrival = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
      const airlineName = apiResponse.airline_name || apiResponse.airline_icao || apiResponse.airline_iata || 'Unknown Airline';
      const departureAirportName = apiResponse.dep_name || apiResponse.dep_icao || apiResponse.dep_iata || 'Unknown Airport';
      const arrivalAirportName = apiResponse.arr_name || apiResponse.arr_icao || apiResponse.arr_iata || 'Unknown Airport';
      
      const adaptedData = {
        flight_date: flightDate,
        flight_status: apiResponse.status || 'scheduled',
        departure: {
          airport: departureAirportName,
          timezone: apiResponse.dep_timezone || 'UTC',
          iata: apiResponse.dep_iata || 'UNK',
          icao: apiResponse.dep_icao || 'UNKN',
          terminal: apiResponse.dep_terminal || '',
          gate: apiResponse.dep_gate || '',
          delay: apiResponse.dep_delay || 0,
          scheduled: apiResponse.dep_time || scheduledDeparture,
          estimated: apiResponse.dep_estimated || scheduledDeparture,
          actual: apiResponse.dep_actual || ''
        },
        arrival: {
          airport: arrivalAirportName,
          timezone: apiResponse.arr_timezone || 'UTC',
          iata: apiResponse.arr_iata || 'UNK',
          icao: apiResponse.arr_icao || 'UNKN',
          terminal: apiResponse.arr_terminal || '',
          gate: apiResponse.arr_gate || '',
          baggage: apiResponse.arr_baggage || '',
          delay: apiResponse.arr_delay || 0,
          scheduled: apiResponse.arr_time || scheduledArrival,
          estimated: apiResponse.arr_estimated || scheduledArrival,
          actual: apiResponse.arr_actual || ''
        },
        airline: {
          name: airlineName,
          iata: apiResponse.airline_iata || 'UNK',
          icao: apiResponse.airline_icao || 'UNKN'
        },
        flight: {
          number: apiResponse.flight_number || '0000',
          iata: apiResponse.flight_iata || `UNK${apiResponse.flight_number || '0000'}`,
          icao: apiResponse.flight_icao || `UNKN${apiResponse.flight_number || '0000'}`,
          codeshared: null
        },
        aircraft: {
          registration: apiResponse.reg_number || '',
          iata: apiResponse.aircraft_icao || apiResponse.aircraft_iata || '',
          icao: apiResponse.aircraft_icao || '',
          icao24: apiResponse.hex || ''
        },
        live: {
          updated: apiResponse.updated ? new Date(apiResponse.updated * 1000).toISOString() : '',
          latitude: apiResponse.lat || 0,
          longitude: apiResponse.lng || 0,
          altitude: apiResponse.alt || 0,
          direction: apiResponse.dir || 0,
          speed_horizontal: apiResponse.speed || 0,
          speed_vertical: apiResponse.v_speed || 0,
          is_ground: apiResponse.is_ground !== undefined ? apiResponse.is_ground : false
        }
      };
      
      console.log('Dados adaptados com sucesso (formato antigo):', JSON.stringify(adaptedData, null, 2));
      return adaptedData;
    } catch (error) {
      console.error('Erro ao adaptar resposta da API:', error);
      return null;
    }
  }
  
  // Funções auxiliares para o novo formato da API
  parseFlightDate(dateStr: string): string {
    try {
      // Converter datas como "13 Sep 2025" para formato ISO
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Erro ao parsear data:', dateStr, error);
      return new Date().toISOString().split('T')[0];
    }
  }
  
  extractIataCode(airportStr: string): string {
    // Extrair código IATA de strings como "Nador (NDR)" ou "Barcelona (BCN)"
    const match = airportStr.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : 'UNK';
  }
  
  createISODateTime(date: string, time: string): string {
    if (!time || time === '—') return '';
    try {
      // Combinar data e hora para criar ISO datetime
      const dateTime = new Date(`${date}T${time}:00.000Z`);
      return dateTime.toISOString();
    } catch (error) {
      console.error('Erro ao criar datetime ISO:', date, time, error);
      return '';
    }
  }
  
  parseAircraftInfo(aircraftStr: string): { type: string; registration: string } {
    if (!aircraftStr) return { type: '', registration: '' };
    
    // Extrair informações da aeronave como "A320 (CN-NMR)" ou "320"
    const registrationMatch = aircraftStr.match(/\(([A-Z0-9-]+)\)/);
    const typeMatch = aircraftStr.match(/^([A-Z0-9]+)/);
    
    return {
      type: typeMatch ? typeMatch[1] : aircraftStr,
      registration: registrationMatch ? registrationMatch[1] : ''
    };
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

  // Mapeamento dinâmico de prefixos para códigos IATA
  extractFlightNumber(fullFlightNumber: string): string {
    const AIRLINE_MAPPING: Record<string, string> = {
      // Brasileiras
      'LATAM': 'LA',
      'GOL': 'G3', 
      'AZUL': 'AD',
      'TAM': 'JJ',
      
      // Americanas
      'AMERICAN': 'AA',
      'AMERICAN AIRLINES': 'AA',
      'DELTA': 'DL',
      'DELTA AIRLINES': 'DL',
      'UNITED': 'UA',
      'UNITED AIRLINES': 'UA',
      'SOUTHWEST': 'WN',
      'JETBLUE': 'B6',
      'FRONTIER': 'F9',
      'SPIRIT': 'NK',
      'ALASKA': 'AS',
      'HAWAIIAN': 'HA',
      
      // Europeias
      'BRITISH AIRWAYS': 'BA',
      'LUFTHANSA': 'LH',
      'AIR FRANCE': 'AF',
      'KLM': 'KL',
      'SWISS': 'LX',
      'AUSTRIAN': 'OS',
      'BRUSSELS': 'SN',
      'TAP': 'TP',
      'RYANAIR': 'FR',
      'EASYJET': 'U2',
      'VUELING': 'VY',
      'EUROWINGS': 'EW',
      
      // Asiáticas
      'JAPAN AIRLINES': 'NH',
      'JAL': 'NH',
      'KOREAN AIR': 'KE',
      'ASIANA': 'OZ',
      'SINGAPORE': 'SQ',
      'THAI': 'TG',
      'MALAYSIA': 'MH',
      'CATHAY PACIFIC': 'CX',
      'CHINA AIRLINES': 'CI',
      'VARIG': 'BR',
      'GARUDA': 'GA',
      'JET AIRWAYS': '9W',
      'AIR INDIA': 'AI',
      'SINGAPORE AIRLINES': 'SQ',
      'PHILIPPINE': 'PR',
      'CEBU PACIFIC': '5J',
      
      // Códigos IATA diretos
      'LA': 'LA', 'G3': 'G3', 'AD': 'AD', 'JJ': 'JJ',
      'AA': 'AA', 'DL': 'DL', 'UA': 'UA', 'WN': 'WN',
      'B6': 'B6', 'F9': 'F9', 'NK': 'NK', 'AS': 'AS', 'HA': 'HA',
      'BA': 'BA', 'LH': 'LH', 'AF': 'AF', 'KL': 'KL', 'LX': 'LX',
      'OS': 'OS', 'SN': 'SN', 'TP': 'TP', 'FR': 'FR', 'U2': 'U2',
      'VY': 'VY', 'EW': 'EW', 'NH': 'NH', 'KE': 'KE', 'OZ': 'OZ',
      'SQ': 'SQ', 'TG': 'TG', 'MH': 'MH', 'CX': 'CX', 'CI': 'CI',
      'BR': 'BR', 'GA': 'GA', '9W': '9W', 'AI': 'AI', 'PR': 'PR',
      '5J': '5J', 'S7': 'S7', 'SU': 'SU', 'FV': 'FV', 'DP': 'DP',
      'F7': 'F7', 'H2': 'H2', 'H9': 'H9', 'PC': 'PC', 'TK': 'TK',
      'MS': 'MS', 'QR': 'QR', 'EK': 'EK', 'EY': 'EY', 'SV': 'SV',
      'GF': 'GF', 'WY': 'WY', 'RJ': 'RJ', 'KU': 'KU', 'FZ': 'FZ'
    };
    
    const original = fullFlightNumber.toUpperCase().trim();
    console.log(`🔍 Processando voo original: "${original}"`);
    
    // Se já está no formato correto (ex: LA3359, G31900)
    if (/^[A-Z]{2}\d+$/.test(original)) {
      console.log(`✅ Já no formato correto: ${original}`);
      return original;
    }
    
    // Tentar encontrar prefixo conhecido
    for (const [prefix, iataCode] of Object.entries(AIRLINE_MAPPING)) {
      if (original.startsWith(prefix)) {
        const remaining = original.substring(prefix.length);
        const numberMatch = remaining.match(/\d+/);
        const number = numberMatch ? numberMatch[0] : remaining;
        const result = `${iataCode}${number}`;
        
        console.log(`✅ Prefixo encontrado: "${prefix}" -> "${iataCode}" + "${number}" = "${result}"`);
        return result;
      }
    }
    
    // Se não encontrou prefixo conhecido, tentar extrair código IATA do início
    const iataMatch = original.match(/^([A-Z]{2,3})/);
    if (iataMatch) {
      const potentialIata = iataMatch[1];
      const remaining = original.substring(potentialIata.length);
      const numberMatch = remaining.match(/\d+/);
      const number = numberMatch ? numberMatch[0] : remaining;
      const result = `${potentialIata}${number}`;
      
      console.log(`⚠️ Prefixo não mapeado, usando original: "${potentialIata}" + "${number}" = "${result}"`);
      return result;
    }
    
    // Fallback: usar como está
    console.log(`⚠️ Não foi possível processar, mantendo original: "${original}"`);
    return original;
  }

  async getFlightInfo(flightNumber: string, date?: string): Promise<any> {
    try {
      // Processar o número do voo com mapeamento dinâmico
      const cleanFlightNumber = this.extractFlightNumber(flightNumber);
      const params: any = { flight_number: cleanFlightNumber };
      if (date) params.date = date;

      const endpoint = 'flight'; // sempre usar o singular
      console.log(`Buscando voo no endpoint /${endpoint}:`, params);

      const response = await this.makeRequest(endpoint, params);
      console.log('Resposta da API (/flight):', JSON.stringify(response, null, 2));

      // caso a API retorne erro sem voo
      if (response?.data?.error || (response?.data && typeof response.data === 'string' && response.data.includes('Nenhum dado foi encontrado'))) {
        console.warn('⚠ Voo não encontrado, retornando 200 com sucesso: false');
        console.warn('Resposta da API (/flight):', JSON.stringify(response, null, 2));
        console.warn(`Processado: "${cleanFlightNumber}" (original: "${flightNumber}")`);
        return null; // vai gerar o 404 "Voo não encontrado"
      }

      // Verificar se a resposta indica que não há voo na data especificada
      if (response?.success === false && response?.data && typeof response.data === 'string') {
        if (response.data.includes('Nenhum dado foi encontrado') || 
            response.data.includes('verifique o número do voo') ||
            response.data.includes('tente novamente')) {
          console.warn('⚠ Voo não encontrado na data especificada');
          console.warn('Resposta da API (flight):', JSON.stringify(response, null, 2));
          console.warn(`Processado: "${cleanFlightNumber}" (original: "${flightNumber}")`);
          return null;
        }
      }

      // garantir que veio algo
      if (!response?.success || !response.data) {
        console.warn('Nenhum registro válido retornado');
        console.warn('Resposta da API (flight):', JSON.stringify(response, null, 2));
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

      const flightData = this.transformFlightData(rawData);
      await this.saveFlightData(rawData, flightData);

      return flightData;
    } catch (error) {
      console.error('Erro ao buscar informações do voo:', error);
      throw error;
    }
  }
  // Método para validar se a resposta da API tem o formato esperado
  validateFlightResponse(data: any): boolean {
    if (!data) return false;
    
    // Verifica se é o novo formato da API com campos em maiúsculas
    const hasNewApiFormat = data.DATE && data.FROM && data.TO && data.STD && data.STA;
    if (hasNewApiFormat) {
      console.log('Detectado novo formato da API com campos em maiúsculas');
      return true;
    }
    
    // Verifica se os campos essenciais existem no formato antigo
    const hasRequiredFields = data.departure && data.departure.scheduled && data.arrival && data.flight && data.airline;
    // Verifica se os campos essenciais existem no formato novo
    const hasNewFormatFields = (data.dep_iata || data.dep_icao) && (data.arr_iata || data.arr_icao) && (data.flight_iata || data.flight_icao || data.flight_number) && (data.airline_iata || data.airline_icao);
    
    // Se estiver no formato novo, podemos adaptar
    if (hasNewFormatFields) {
      return true;
    }
    
    if (!hasRequiredFields && !hasNewApiFormat) {
      console.error('Campos obrigatórios ausentes na resposta:', {
        hasDeparture: !!data.departure,
        hasDepartureScheduled: data.departure ? !!data.departure.scheduled : false,
        hasArrival: !!data.arrival,
        hasFlight: !!data.flight,
        hasAirline: !!data.airline,
        // Campos do formato novo
        hasDepIata: !!data.dep_iata,
        hasDepIcao: !!data.dep_icao,
        hasArrIata: !!data.arr_iata,
        hasArrIcao: !!data.arr_icao,
        hasFlightIata: !!data.flight_iata,
        hasFlightIcao: !!data.flight_icao,
        hasFlightNumber: !!data.flight_number,
        hasAirlineIata: !!data.airline_iata,
        hasAirlineIcao: !!data.airline_icao,
        // Campos do novo formato da API
        hasDATE: !!data.DATE,
        hasFROM: !!data.FROM,
        hasTO: !!data.TO,
        hasSTD: !!data.STD,
        hasSTA: !!data.STA
      });
    }
    
    return hasRequiredFields || hasNewFormatFields || hasNewApiFormat;
  }
  async getAirportSchedules(airportIata: string, type: string = 'departure'): Promise<any[]> {
    try {
      // Mesmo endpoint 'flights' para ambos os tipos
      const endpoint = 'flights';
      const params: any = {};
      // Parâmetros corretos para a API GoFlightLabs
      if (type === 'departure') {
        params.dep_iata = airportIata;
      } else {
        params.arr_iata = airportIata;
      }
      console.log(`Buscando horários do aeroporto: ${airportIata}, tipo: ${type}`);
      console.log('Parâmetros da requisição:', params);
      const response = await this.makeRequest(endpoint, params);
      console.log(`Resposta recebida da API:`, JSON.stringify(response, null, 2));
      // Processar a resposta com base no formato
      let rawFlights = [];
      // Caso 1: Resposta no formato antigo - array em data
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('Detectado formato antigo da API (array em data) para horários de aeroporto');
        // Processar cada voo no array
        for (const flight of response.data){
          if (this.validateFlightResponse(flight)) {
            // Já está no formato esperado
            rawFlights.push(flight);
          } else {
            // Tentar adaptar
            const adaptedFlight = this.adaptApiResponse(flight);
            if (adaptedFlight) rawFlights.push(adaptedFlight);
          }
        }
      } else if (Array.isArray(response) && response.length > 0) {
        console.log('Detectado formato da API como array direto para horários de aeroporto');
        // Processar cada voo no array
        for (const flight of response){
          if (this.validateFlightResponse(flight)) {
            // Já está no formato esperado
            rawFlights.push(flight);
          } else {
            // Tentar adaptar
            const adaptedFlight = this.adaptApiResponse(flight);
            if (adaptedFlight) rawFlights.push(adaptedFlight);
          }
        }
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        console.log('Detectado formato da API como objeto com propriedade data para horários de aeroporto');
        // Tentar adaptar o objeto data
        const adaptedFlight = this.adaptApiResponse(response.data);
        if (adaptedFlight) rawFlights.push(adaptedFlight);
      } else if (typeof response === 'object' && !Array.isArray(response)) {
        console.log('Detectado formato da API como objeto único para horários de aeroporto');
        // Tentar adaptar o objeto
        const adaptedFlight = this.adaptApiResponse(response);
        if (adaptedFlight) rawFlights.push(adaptedFlight);
      }
      if (rawFlights.length === 0) {
        console.warn('Nenhum voo com dados válidos encontrado');
        return [];
      }
      console.log(`Processando ${rawFlights.length} voos válidos`);
      const flights = rawFlights.map((flight: any)=>{
        try {
          return this.transformFlightData(flight);
        } catch (error) {
          console.error('Erro ao transformar dados do voo:', error);
          return null;
        }
      }).filter(Boolean);
      // Salvar horários do aeroporto no banco
      await this.saveAirportSchedules(airportIata, type, rawFlights);
      return flights;
    } catch (error) {
      console.error('Erro ao buscar horários do aeroporto:', error);
      throw error;
    }
  }
  async saveFlightData(rawData: any, transformedData: any): Promise<void> {
    try {
      const { error } = await this.supabase.from('flight_data').upsert({
        flight_number: transformedData.flightNumber,
        airline_iata: transformedData.airline.iata,
        airline_icao: transformedData.airline.icao,
        airline_name: transformedData.airline.name,
        departure_airport_iata: transformedData.departure.airport.iata,
        departure_airport_icao: transformedData.departure.airport.icao,
        departure_airport_name: transformedData.departure.airport.name,
        departure_terminal: transformedData.departure.terminal,
        departure_gate: transformedData.departure.gate,
        departure_scheduled: transformedData.departure.scheduled,
        departure_estimated: transformedData.departure.estimated,
        departure_actual: transformedData.departure.actual,
        arrival_airport_iata: transformedData.arrival.airport.iata,
        arrival_airport_icao: transformedData.arrival.airport.icao,
        arrival_airport_name: transformedData.arrival.airport.name,
        arrival_terminal: transformedData.arrival.terminal,
        arrival_gate: transformedData.arrival.gate,
        arrival_scheduled: transformedData.arrival.scheduled,
        arrival_estimated: transformedData.arrival.estimated,
        arrival_actual: transformedData.arrival.actual,
        flight_status: transformedData.status,
        aircraft_type: transformedData.aircraft?.type,
        baggage_belt: transformedData.arrival.baggage,
        delay_minutes: transformedData.departure.delay,
        raw_data: rawData
      }, {
        onConflict: 'flight_number,departure_scheduled'
      });
      if (error) {
        console.error('Erro ao salvar dados do voo:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
    }
  }
  async saveAirportSchedules(airportIata: string, type: string, flights: any[]): Promise<void> {
    try {
      const schedules = flights.map((flight: any)=>({
          airport_iata: airportIata,
          airport_icao: type === 'departure' ? flight.departure.icao : flight.arrival.icao,
          airport_name: type === 'departure' ? flight.departure.airport : flight.arrival.airport,
          schedule_type: type,
          flight_number: flight.flight.iata || flight.flight.number,
          airline_iata: flight.airline.iata,
          airline_name: flight.airline.name,
          destination_airport_iata: type === 'departure' ? flight.arrival.iata : null,
          origin_airport_iata: type === 'arrival' ? flight.departure.iata : null,
          scheduled_time: type === 'departure' ? flight.departure.scheduled : flight.arrival.scheduled,
          estimated_time: type === 'departure' ? flight.departure.estimated : flight.arrival.estimated,
          actual_time: type === 'departure' ? flight.departure.actual : flight.arrival.actual,
          terminal: type === 'departure' ? flight.departure.terminal : flight.arrival.terminal,
          gate: type === 'departure' ? flight.departure.gate : flight.arrival.gate,
          status: flight.status,
          raw_data: flight
        }));
      const { error } = await this.supabase.from('airport_schedules').upsert(schedules, {
        onConflict: 'airport_iata,flight_number,scheduled_time'
      });
      if (error) {
        console.error('Erro ao salvar horários do aeroporto:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar horários no banco:', error);
    }
  }
}
serve(async (req: Request)=>{
  console.log('🚀 Edge Function recebeu requisição:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo a requisição OPTIONS (CORS)');
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const { method, url } = req;
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    console.log('📋 Detalhes da requisição:', {
      method,
      path,
      searchParams: Object.fromEntries(urlObj.searchParams.entries())
    });
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
    const flightService = new GoFlightLabsService(accessKey, supabaseUrl, supabaseServiceKey);
    if (method === 'GET' || method === 'POST') {
      let flightNumber, airportIata, scheduleType, date;
      
      if (method === 'GET') {
        flightNumber = urlObj.searchParams.get('flight');
        airportIata = urlObj.searchParams.get('airport');
        scheduleType = urlObj.searchParams.get('type');
        date = urlObj.searchParams.get('date');
        
        console.log('📥 Parâmetros GET extraídos:', {
          flightNumber, airportIata, scheduleType, date
        });
      } else if (method === 'POST') {
        console.log('📦 Processando requisição POST...');
        const body = await req.json();
        console.log('📄 Body da requisição POST:', body);
        
        flightNumber = body.flight_number;
        airportIata = body.airport;
        scheduleType = body.type;
        date = body.date;
        
        console.log('📥 Parâmetros POST extraídos:', {
          flightNumber, airportIata, scheduleType, date
        });
      }
      // Buscar informações de um voo específico
      if (flightNumber) {
        console.log('🔍 Buscando informações do voo:', { flightNumber, date });
        
        try {
          const flightData = await flightService.getFlightInfo(flightNumber, date || undefined);
          
          console.log('✅ Dados do voo obtidos:', {
            hasData: !!flightData,
            flightNumber: flightData?.flightNumber,
            status: flightData?.status
          });
          
          if (!flightData) {
            console.log('⚠️ Voo não encontrado, retornando 200 com success: false');
            return new Response(JSON.stringify({
              success: false,
              data: null,
              error: 'Voo não encontrado'
            }), {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          
          console.log('🎉 Retornando dados do voo com sucesso');
          return new Response(JSON.stringify({
            data: flightData
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        } catch (flightError) {
          console.error('❌ Erro ao buscar voo:', {
            error: flightError,
            message: flightError instanceof Error ? flightError.message : String(flightError),
            stack: flightError instanceof Error ? flightError.stack : undefined
          });
          
          return new Response(JSON.stringify({
            error: 'Erro ao buscar informações do voo',
            message: flightError instanceof Error ? flightError.message : String(flightError)
          }), {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      // Buscar horários de um aeroporto
      if (airportIata) {
        const schedules = await flightService.getAirportSchedules(airportIata, scheduleType || 'departure');
        return new Response(JSON.stringify({
          data: schedules
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      return new Response(JSON.stringify({
        error: 'Parâmetros inválidos. Use ?flight=CODIGO ou ?airport=IATA'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    return new Response(JSON.stringify({
      error: 'Método não permitido'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro na Edge Function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      message: errorMessage
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
