import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtraType } from '@/types/booking';
import { Tables } from '@/integrations/supabase/types';
import { useTranslation } from 'react-i18next';

type ExtraRow = Tables<'extras'>;

export function useExtras() {
  const [rawExtras, setRawExtras] = useState<ExtraRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();

  // Buscar dados apenas uma vez
  useEffect(() => {
    fetchExtras();
  }, []);

  // Função para traduzir nomes
  const getTranslatedName = useCallback((extra: ExtraRow, language: string) => {
    // Mapeamento de traduções para extras existentes
    const translationMap: Record<string, Record<string, string>> = {
      'child-seat': {
        en: 'Child Seat',
        pt: 'Cadeirinha Infantil',
        es: 'Asiento para Niños'
      },
      'booster-seat': {
        en: 'Booster Seat',
        pt: 'Assento Elevatório',
        es: 'Asiento Elevador'
      },
      'vodka-bottle': {
        en: 'Vodka Bottle',
        pt: 'Garrafa de Vodka',
        es: 'Botella de Vodka'
      },
      'flowers': {
        en: 'Bouquet of Flowers',
        pt: 'Buquê de Flores',
        es: 'Ramo de Flores'
      },
      'alcohol-package': {
        en: 'Alcohol Package',
        pt: 'Pacote de Álcool',
        es: 'Paquete de Alcohol'
      },
      'airport-assistance': {
        en: 'Airport Assistance and Hostess Service',
        pt: 'Assistência Aeroportuária e Serviço de Hostess',
        es: 'Asistencia Aeroportuaria y Servicio de Azafata'
      },
      'bodyguard': {
        en: 'Bodyguard Service',
        pt: 'Serviço de Segurança',
        es: 'Servicio de Guardaespaldas'
      }
    };

    // Se temos tradução para este extra, usar ela
    if (translationMap[extra.id] && translationMap[extra.id][language]) {
      return translationMap[extra.id][language];
    }

    // Para novos extras do banco, verificar se tem campos de tradução
    const extraWithTranslations = extra as ExtraRow & { 
      name_en?: string; 
      name_es?: string; 
    };
    
    if (language === 'en' && extraWithTranslations.name_en) {
      return extraWithTranslations.name_en;
    }
    if (language === 'es' && extraWithTranslations.name_es) {
      return extraWithTranslations.name_es;
    }

    // Fallback para o nome padrão (português)
    return extra.name;
  }, []);

  // Função para traduzir descrições
  const getTranslatedDescription = useCallback((extra: ExtraRow, language: string) => {
    // Mapeamento de traduções para extras existentes
    const translationMap: Record<string, Record<string, string>> = {
      'child-seat': {
        en: 'Suitable for toddlers weighing 0-18 kg (approx 0 to 4 years).',
        pt: 'Adequada para crianças de 0-18 kg (aproximadamente 0 a 4 anos)',
        es: 'Adecuado para niños de 0-18 kg (aproximadamente 0 a 4 años)'
      },
      'booster-seat': {
        en: 'Suitable for children weighing 15-36 kg (approx 4 to 10 years).',
        pt: 'Adequado para crianças com peso entre 15 e 36 kg (aproximadamente 4 a 10 anos)',
        es: 'Adecuado para niños de 15-36 kg (aproximadamente 4 a 10 años)'
      },
      'vodka-bottle': {
        en: 'Absolut Vodka 0.7l Bottle',
        pt: 'Garrafa de Vodka Absolut 0,7l',
        es: 'Botella de Vodka Absolut 0,7l'
      },
      'flowers': {
        en: 'A bouquet of seasonal flowers prepared by a local florist',
        pt: 'Um buquê de flores da estação preparado por um florista local',
        es: 'Un ramo de flores de temporada preparado por un florista local'
      },
      'alcohol-package': {
        en: 'A selection of premium alcoholic beverages',
        pt: 'Uma seleção de bebidas alcoólicas premium',
        es: 'Una selección de bebidas alcohólicas premium'
      },
      'airport-assistance': {
        en: 'Professional assistance at the airport and hostess service',
        pt: 'Assistência profissional no aeroporto e serviço de recepcionista',
        es: 'Asistencia profesional en el aeropuerto y servicio de azafata'
      },
      'bodyguard': {
        en: 'Professional security personnel for your safety',
        pt: 'Pessoal de segurança profissional para sua proteção',
        es: 'Personal de seguridad profesional para su protección'
      }
    };

    // Se temos tradução para este extra, usar ela
    if (translationMap[extra.id] && translationMap[extra.id][language]) {
      return translationMap[extra.id][language];
    }

    // Para novos extras do banco, verificar se tem campos de tradução
    const extraWithTranslations = extra as ExtraRow & { 
      description_en?: string; 
      description_es?: string; 
    };
    
    if (language === 'en' && extraWithTranslations.description_en) {
      return extraWithTranslations.description_en;
    }
    if (language === 'es' && extraWithTranslations.description_es) {
      return extraWithTranslations.description_es;
    }

    // Fallback para a descrição padrão (português)
    return extra.description || '';
  }, []);

  // Re-traduzir sempre que o idioma mudar
  const extras = useMemo(() => {
    console.log('🌐 Traduzindo extras para idioma:', i18n.language);
    return rawExtras.map(extra => ({
      id: extra.id,
      name: getTranslatedName(extra, i18n.language),
      description: getTranslatedDescription(extra, i18n.language),
      price: Number(extra.price),
      quantity: 0
    }));
  }, [rawExtras, i18n.language, getTranslatedName, getTranslatedDescription]);

  const fetchExtras = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando extras do Supabase...');
      
      const { data, error } = await supabase
        .from('extras')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar extras:', error);
        setError(error.message);
        return;
      }

      console.log('✅ Extras encontrados:', data?.length || 0);
      setRawExtras(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Erro inesperado ao buscar extras:', err);
      setError('Erro ao carregar extras');
    } finally {
      setLoading(false);
    }
  };

  return {
    extras,
    loading,
    error,
    refetch: fetchExtras
  };
} 