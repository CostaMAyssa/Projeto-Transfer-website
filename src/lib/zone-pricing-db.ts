import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  Zone,
  VehicleCategory,
  ZonePricing,
  PricingCalculationRequest,
  PricingCalculationResponse,
  ZoneDetectionResult,
  ZONE_TOLERANCE_METERS,
  PREDEFINED_ZONES,
  VEHICLE_CATEGORIES
} from '@/types/zone-pricing';

// Tipos do banco
type DbZone = Database['public']['Tables']['zones']['Row'];
type DbVehicleCategory = Database['public']['Tables']['vehicle_categories']['Row'];
type DbZonePricing = Database['public']['Tables']['zone_pricing']['Row'];

/**
 * Serviço para gerenciar dados de Zone Pricing no banco
 */
export class ZonePricingDatabaseService {
  
  /**
   * Busca todas as zonas ativas do banco
   */
  static async getZones(): Promise<Zone[]> {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.warn('Erro ao buscar zonas do banco:', error);
        // Fallback para dados predefinidos
        return PREDEFINED_ZONES.map(pz => ({
          ...pz,
          type: pz.type as 'circular' | 'polygonal'
        }));
      }

      return data.map(zone => ({
        id: zone.id,
        name: zone.name,
        description: zone.description || '',
        type: zone.type,
        center_lat: zone.center_lat,
        center_lng: zone.center_lng,
        radius_meters: zone.radius_meters,
        geojson: zone.geojson,
        coverage_area: zone.coverage_area,
        created_at: zone.created_at,
        updated_at: zone.updated_at
      }));
    } catch (error) {
      console.error('Erro inesperado ao buscar zonas:', error);
      // Fallback para dados predefinidos
      return PREDEFINED_ZONES.map(pz => ({
        ...pz,
        type: pz.type as 'circular' | 'polygonal'
      }));
    }
  }

  /**
   * Busca todas as categorias de veículos ativas do banco
   */
  static async getVehicleCategories(): Promise<VehicleCategory[]> {
    try {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.warn('Erro ao buscar categorias do banco:', error);
        // Fallback para dados predefinidos
        return VEHICLE_CATEGORIES;
      }

      return data.map(category => ({
        id: category.id,
        name: category.name,
        capacity: category.capacity,
        base_price: category.base_price,
        description: category.description,
        features: Array.isArray(category.features) ? category.features as string[] : []
      }));
    } catch (error) {
      console.error('Erro inesperado ao buscar categorias:', error);
      // Fallback para dados predefinidos
      return VEHICLE_CATEGORIES;
    }
  }

  /**
   * Busca preço específico para uma rota
   */
  static async getZonePricing(
    originZoneId: string,
    destinationZoneId: string,
    vehicleCategoryId: string
  ): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('zone_pricing')
        .select('price')
        .eq('origin_zone_id', originZoneId)
        .eq('destination_zone_id', destinationZoneId)
        .eq('vehicle_category_id', vehicleCategoryId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn('Preço específico não encontrado, usando preço base');
        return null;
      }

      return data.price;
    } catch (error) {
      console.error('Erro ao buscar preço específico:', error);
      return null;
    }
  }

  /**
   * Busca todos os preços por zona
   */
  static async getAllZonePricing(): Promise<ZonePricing[]> {
    try {
      const { data, error } = await supabase
        .from('zone_pricing')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.warn('Erro ao buscar preços do banco:', error);
        return [];
      }

      return data.map(pricing => ({
        id: pricing.id,
        origin_zone_id: pricing.origin_zone_id,
        destination_zone_id: pricing.destination_zone_id,
        vehicle_category_id: pricing.vehicle_category_id,
        price: pricing.price,
        is_active: pricing.is_active,
        created_at: pricing.created_at,
        updated_at: pricing.updated_at
      }));
    } catch (error) {
      console.error('Erro inesperado ao buscar preços:', error);
      return [];
    }
  }

  /**
   * Inicializa o banco com dados padrão se estiver vazio
   */
  static async initializeDefaultData(): Promise<void> {
    try {
      // Verifica se já existem zonas
      const { data: existingZones } = await supabase
        .from('zones')
        .select('id')
        .limit(1);

      if (existingZones && existingZones.length > 0) {
        console.log('Dados já existem no banco, não inicializando');
        return;
      }

      console.log('Inicializando dados padrão no banco...');

      // Inserir zonas
      const zonesToInsert = PREDEFINED_ZONES.map(zone => ({
        id: zone.id,
        name: zone.name,
        description: zone.description,
        type: zone.type,
        center_lat: zone.center_lat,
        center_lng: zone.center_lng,
        radius_meters: zone.radius_meters,
        coverage_area: zone.coverage_area,
        is_active: true
      }));

      const { error: zonesError } = await supabase
        .from('zones')
        .insert(zonesToInsert);

      if (zonesError) {
        console.error('Erro ao inserir zonas:', zonesError);
        return;
      }

      // Inserir categorias de veículos
      const categoriesToInsert = VEHICLE_CATEGORIES.map(category => ({
        id: category.id,
        name: category.name,
        capacity: category.capacity,
        base_price: category.base_price,
        description: category.description,
        features: category.features as unknown as Record<string, unknown>,
        is_active: true
      }));

      const { error: categoriesError } = await supabase
        .from('vehicle_categories')
        .insert(categoriesToInsert);

      if (categoriesError) {
        console.error('Erro ao inserir categorias:', categoriesError);
        return;
      }

      // Inserir preços base (matriz completa)
      const pricingToInsert: Array<Database['public']['Tables']['zone_pricing']['Insert']> = [];
      
      for (const origin of PREDEFINED_ZONES) {
        for (const destination of PREDEFINED_ZONES) {
          for (const category of VEHICLE_CATEGORIES) {
            pricingToInsert.push({
              origin_zone_id: origin.id,
              destination_zone_id: destination.id,
              vehicle_category_id: category.id,
              price: category.base_price,
              is_active: true
            });
          }
        }
      }

      const { error: pricingError } = await supabase
        .from('zone_pricing')
        .insert(pricingToInsert);

      if (pricingError) {
        console.error('Erro ao inserir preços:', pricingError);
        return;
      }

      console.log('✅ Dados padrão inicializados com sucesso!');
    } catch (error) {
      console.error('Erro inesperado ao inicializar dados:', error);
    }
  }

  /**
   * Atualiza preço de uma rota específica (para uso no admin)
   */
  static async updateZonePrice(
    originZoneId: string,
    destinationZoneId: string,
    vehicleCategoryId: string,
    newPrice: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('zone_pricing')
        .update({ price: newPrice, updated_at: new Date().toISOString() })
        .eq('origin_zone_id', originZoneId)
        .eq('destination_zone_id', destinationZoneId)
        .eq('vehicle_category_id', vehicleCategoryId);

      if (error) {
        console.error('Erro ao atualizar preço:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar preço:', error);
      return false;
    }
  }
}

/**
 * Hook personalizado para usar dados do banco com fallback
 */
export function useZonePricingFromDB() {
  return {
    initializeData: ZonePricingDatabaseService.initializeDefaultData,
    getZones: ZonePricingDatabaseService.getZones,
    getVehicleCategories: ZonePricingDatabaseService.getVehicleCategories,
    getZonePricing: ZonePricingDatabaseService.getZonePricing,
    updateZonePrice: ZonePricingDatabaseService.updateZonePrice
  };
} 