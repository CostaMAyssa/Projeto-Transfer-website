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
    console.log('🔍 Traduzindo nome:', extra.name, 'para idioma:', language);
    
    // Para extras do banco, verificar se tem campos de tradução
    if (language === 'en' && extra.name_en) {
      console.log('✅ Usando name_en:', extra.name_en);
      return extra.name_en;
    }
    if (language === 'es' && extra.name_es) {
      console.log('✅ Usando name_es:', extra.name_es);
      return extra.name_es;
    }

    // Fallback para o nome padrão (português)
    console.log('⚠️ Usando fallback (português):', extra.name);
    return extra.name;
  }, []);

  // Função para traduzir descrições
  const getTranslatedDescription = useCallback((extra: ExtraRow, language: string) => {
    console.log('🔍 Traduzindo descrição:', extra.name, 'para idioma:', language);
    
    // Para extras do banco, verificar se tem campos de tradução
    if (language === 'en' && extra.description_en) {
      console.log('✅ Usando description_en:', extra.description_en);
      return extra.description_en;
    }
    if (language === 'es' && extra.description_es) {
      console.log('✅ Usando description_es:', extra.description_es);
      return extra.description_es;
    }

    // Fallback para a descrição padrão (português)
    console.log('⚠️ Usando fallback descrição (português):', extra.description);
    return extra.description || '';
  }, []);

  // Re-traduzir sempre que o idioma mudar
  const extras = useMemo(() => {
    console.log('🌐 Traduzindo extras para idioma:', i18n.language);
    console.log('📋 Raw extras disponíveis:', rawExtras.map(e => e.name));
    
    const translatedExtras = rawExtras.map(extra => {
      const translatedExtra = {
        id: extra.id,
        name: getTranslatedName(extra, i18n.language),
        description: getTranslatedDescription(extra, i18n.language),
        price: Number(extra.price),
        quantity: 0
      };
      
      console.log('📝 Extra traduzido:', {
        id: extra.id,
        originalName: extra.name,
        translatedName: translatedExtra.name,
        language: i18n.language
      });
      
      return translatedExtra;
    });
    
    console.log('✅ Total de extras traduzidos:', translatedExtras.length);
    return translatedExtras;
  }, [rawExtras, i18n.language, getTranslatedName, getTranslatedDescription]);

  const fetchExtras = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando extras do Supabase...');
      
      const { data, error } = await supabase
        .from('extras')
        .select('id, name, description, price, created_at, name_en, name_es, description_en, description_es')
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar extras:', error);
        setError(error.message);
        return;
      }

      console.log('✅ Extras encontrados:', data?.length || 0);
      console.log('📊 Dados completos dos extras:', data);
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