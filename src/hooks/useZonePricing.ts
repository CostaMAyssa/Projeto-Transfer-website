import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PricingCalculationRequest,
  PricingCalculationResponse,
  VehicleCategory,
  Zone,
  formatPrice,
  calculateZonePricing as calculateZonePricingLocal
} from '@/lib/zone-pricing';
import { ZonePricingDatabaseService } from '@/lib/zone-pricing-db';

// Re-export formatPrice for easy access
export { formatPrice };

/**
 * Hook para cálculo de preços usando Zone Pricing
 */
export function useZonePricing() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<PricingCalculationResponse | null>(null);

  /**
   * Calcula o preço de uma viagem
   */
  const calculatePrice = useCallback(async (
    request: PricingCalculationRequest
  ): Promise<PricingCalculationResponse> => {
    setIsCalculating(true);
    
    try {
      // Tenta usar a Edge Function primeiro
      try {
        const { data, error } = await supabase.functions.invoke('calculate-pricing', {
          body: request
        });

        if (error) {
          console.warn('Erro na Edge Function, usando cálculo local:', error);
          throw error;
        }

        const result = data as PricingCalculationResponse;
        setLastCalculation(result);
        return result;
      } catch (edgeFunctionError) {
        console.warn('Edge Function não disponível, usando cálculo local:', edgeFunctionError);
        
        // Fallback para cálculo local (mas agora usando dados do banco se disponível)
        const result = await calculateZonePricingLocal(request);
        setLastCalculation(result);
        return result;
      }
    } catch (error) {
      console.error('Erro no cálculo de preços:', error);
      const errorResult: PricingCalculationResponse = {
        success: false,
        message: 'Erro no cálculo de preços. Tente novamente.',
        out_of_coverage: false
      };
      setLastCalculation(errorResult);
      return errorResult;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return {
    calculatePrice,
    isCalculating,
    lastCalculation,
    formatPrice,
    clearLastCalculation: () => setLastCalculation(null)
  };
}

/**
 * Hook para buscar categorias de veículos do banco (com fallback)
 */
export function useVehicleCategories() {
  return useQuery({
    queryKey: ['vehicle-categories'],
    queryFn: async (): Promise<VehicleCategory[]> => {
      return await ZonePricingDatabaseService.getVehicleCategories();
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: 1,
  });
}

/**
 * Hook para buscar zonas do banco (com fallback)
 */
export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async (): Promise<Zone[]> => {
      return await ZonePricingDatabaseService.getZones();
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: 1,
  });
}

/**
 * Hook para cálculo automático de preço baseado em localizações
 */
export function useAutoPricing(
  pickupLocation: { address: string; coordinates?: [number, number] } | null,
  dropoffLocation: { address: string; coordinates?: [number, number] } | null,
  vehicleCategory: string | null,
  enabled: boolean = true
) {
  const { calculatePrice } = useZonePricing();

  return useQuery({
    queryKey: ['auto-pricing', pickupLocation, dropoffLocation, vehicleCategory],
    queryFn: async (): Promise<PricingCalculationResponse> => {
      if (!pickupLocation?.coordinates || !dropoffLocation?.coordinates || !vehicleCategory) {
        throw new Error('Dados insuficientes para cálculo');
      }

      return calculatePrice({
        pickup_location: {
          address: pickupLocation.address,
          coordinates: pickupLocation.coordinates
        },
        dropoff_location: {
          address: dropoffLocation.address,
          coordinates: dropoffLocation.coordinates
        },
        vehicle_category: vehicleCategory
      });
    },
    enabled: enabled && 
             !!pickupLocation?.coordinates && 
             !!dropoffLocation?.coordinates && 
             !!vehicleCategory,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  });
}

/**
 * Hook utilitário para verificar se uma coordenada está na área de cobertura
 */
export function useCoverageCheck() {
  const { data: zones } = useZones();

  const checkCoverage = useCallback((latitude: number, longitude: number): boolean => {
    if (!zones) return false;

    // Verifica se está dentro da área geral de cobertura (NY, NJ, PA, CT)
    const generalBounds = {
      minLat: 39.0, // Sul da Pensilvânia
      maxLat: 42.0, // Norte de NY
      minLng: -76.0, // Oeste da Pensilvânia
      maxLng: -71.0  // Leste de Connecticut
    };

    return latitude >= generalBounds.minLat && 
           latitude <= generalBounds.maxLat && 
           longitude >= generalBounds.minLng && 
           longitude <= generalBounds.maxLng;
  }, [zones]);

  return {
    checkCoverage,
    zones
  };
}

/**
 * Hook para inicializar dados do banco (útil para admin)
 */
export function useInitializeZonePricing() {
  return useQuery({
    queryKey: ['initialize-zone-pricing'],
    queryFn: async () => {
      await ZonePricingDatabaseService.initializeDefaultData();
      return true;
    },
    enabled: false, // Só executa quando chamado manualmente
    retry: false,
  });
} 