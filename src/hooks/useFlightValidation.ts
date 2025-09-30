import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FlightValidationRequest {
  flight_number: string;
  airline?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  booking_type: 'pickup' | 'dropoff';
}

export interface FlightInfo {
  flight_number: string;
  airline: string;
  departure_time: string;
  arrival_time: string;
  departure_airport: string;
  arrival_airport: string;
  terminal?: string;
  gate?: string;
  status: string;
}

export interface FlightValidationResult {
  is_valid: boolean;
  suggested_time?: string;
  suggested_date?: string;
  reason?: string;
  flight_info?: FlightInfo;
}

export interface FlightValidationResponse {
  success: boolean;
  flight_found: boolean;
  validation_result: FlightValidationResult;
  error?: string;
}

export interface UseFlightValidationReturn {
  validateFlight: (request: FlightValidationRequest) => Promise<FlightValidationResponse | null>;
  isLoading: boolean;
  lastValidation: FlightValidationResponse | null;
  clearValidation: () => void;
}

export function useFlightValidation(): UseFlightValidationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastValidation, setLastValidation] = useState<FlightValidationResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateFlight = useCallback(async (request: FlightValidationRequest): Promise<FlightValidationResponse | null> => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setLastValidation(null);

    try {
      console.log('🔍 Iniciando validação de voo:', request);

      const { data, error } = await supabase.functions.invoke('flight-validation', {
        body: request,
        signal: abortControllerRef.current.signal
      });

      if (error) {
        console.error('❌ Erro na validação de voo:', error);
        throw new Error(error.message || 'Erro ao validar voo');
      }

      console.log('✅ Resposta da validação:', data);
      setLastValidation(data);
      return data;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🚫 Validação cancelada');
        return null;
      }

      console.error('❌ Erro na validação:', error);
      
      const errorResponse: FlightValidationResponse = {
        success: false,
        flight_found: false,
        validation_result: {
          is_valid: false,
          reason: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      setLastValidation(errorResponse);
      return errorResponse;

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const clearValidation = useCallback(() => {
    setLastValidation(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    validateFlight,
    isLoading,
    lastValidation,
    clearValidation
  };
}

// Hook para validação com debounce
export function useFlightValidationWithDebounce(debounceMs: number = 1000) {
  const { validateFlight, isLoading, lastValidation, clearValidation } = useFlightValidation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateFlightDebounced = useCallback(async (request: FlightValidationRequest) => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Se os campos obrigatórios não estão preenchidos, não validar
    if (!request.flight_number || !request.date || !request.time) {
      return null;
    }

    return new Promise<FlightValidationResponse | null>((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        const result = await validateFlight(request);
        resolve(result);
      }, debounceMs);
    });
  }, [validateFlight]);

  const clearDebouncedValidation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    clearValidation();
  }, [clearValidation]);

  return {
    validateFlight: validateFlightDebounced,
    isLoading,
    lastValidation,
    clearValidation: clearDebouncedValidation
  };
}
