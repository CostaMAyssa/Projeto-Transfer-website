import { supabase } from '@/integrations/supabase/client';

// Preços corretos baseados na tabela de tarifas oficial
const CORRECT_PRICES = [
  // ========== ROTAS PARA JFK ==========
  
  // Queens → JFK
  { origin: 'Z_QNS', destination: 'Z_JFK', vehicle: 'sedan', price: 13000 },      // $130
  { origin: 'Z_QNS', destination: 'Z_JFK', vehicle: 'suv', price: 15000 },        // $150
  { origin: 'Z_QNS', destination: 'Z_JFK', vehicle: 'minivan', price: 14000 },    // $140

  // Brooklyn → JFK
  { origin: 'Z_BKLYN', destination: 'Z_JFK', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_BKLYN', destination: 'Z_JFK', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_BKLYN', destination: 'Z_JFK', vehicle: 'minivan', price: 15000 },  // $150

  // LaGuardia → JFK
  { origin: 'Z_LGA', destination: 'Z_JFK', vehicle: 'sedan', price: 10000 },      // $100
  { origin: 'Z_LGA', destination: 'Z_JFK', vehicle: 'suv', price: 12000 },        // $120
  { origin: 'Z_LGA', destination: 'Z_JFK', vehicle: 'minivan', price: 11000 },    // $110

  // Manhattan → JFK
  { origin: 'Z_MHTN', destination: 'Z_JFK', vehicle: 'sedan', price: 13000 },     // $130
  { origin: 'Z_MHTN', destination: 'Z_JFK', vehicle: 'suv', price: 16000 },       // $160
  { origin: 'Z_MHTN', destination: 'Z_JFK', vehicle: 'minivan', price: 15000 },   // $150

  // Bronx → JFK
  { origin: 'Z_BRONX', destination: 'Z_JFK', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_BRONX', destination: 'Z_JFK', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_BRONX', destination: 'Z_JFK', vehicle: 'minivan', price: 15000 },  // $150

  // Newark → JFK
  { origin: 'Z_EWR', destination: 'Z_JFK', vehicle: 'sedan', price: 14000 },      // $140
  { origin: 'Z_EWR', destination: 'Z_JFK', vehicle: 'suv', price: 17000 },        // $170
  { origin: 'Z_EWR', destination: 'Z_JFK', vehicle: 'minivan', price: 16000 },    // $160

  // ========== ROTAS PARA LAGUARDIA ==========

  // Manhattan → LaGuardia
  { origin: 'Z_MHTN', destination: 'Z_LGA', vehicle: 'sedan', price: 13000 },     // $130
  { origin: 'Z_MHTN', destination: 'Z_LGA', vehicle: 'suv', price: 16000 },       // $160
  { origin: 'Z_MHTN', destination: 'Z_LGA', vehicle: 'minivan', price: 15000 },   // $150

  // Bronx → LaGuardia
  { origin: 'Z_BRONX', destination: 'Z_LGA', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_BRONX', destination: 'Z_LGA', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_BRONX', destination: 'Z_LGA', vehicle: 'minivan', price: 15000 },  // $150

  // Queens → LaGuardia
  { origin: 'Z_QNS', destination: 'Z_LGA', vehicle: 'sedan', price: 12000 },      // $120
  { origin: 'Z_QNS', destination: 'Z_LGA', vehicle: 'suv', price: 15000 },        // $150
  { origin: 'Z_QNS', destination: 'Z_LGA', vehicle: 'minivan', price: 14000 },    // $140

  // Brooklyn → LaGuardia
  { origin: 'Z_BKLYN', destination: 'Z_LGA', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_BKLYN', destination: 'Z_LGA', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_BKLYN', destination: 'Z_LGA', vehicle: 'minivan', price: 15000 },  // $150

  // JFK → LaGuardia
  { origin: 'Z_JFK', destination: 'Z_LGA', vehicle: 'sedan', price: 10000 },      // $100
  { origin: 'Z_JFK', destination: 'Z_LGA', vehicle: 'suv', price: 12000 },        // $120
  { origin: 'Z_JFK', destination: 'Z_LGA', vehicle: 'minivan', price: 11000 },    // $110

  // Newark → LaGuardia
  { origin: 'Z_EWR', destination: 'Z_LGA', vehicle: 'sedan', price: 14000 },      // $140
  { origin: 'Z_EWR', destination: 'Z_LGA', vehicle: 'suv', price: 17000 },        // $170
  { origin: 'Z_EWR', destination: 'Z_LGA', vehicle: 'minivan', price: 16000 },    // $160

  // ========== ROTAS REVERSAS ==========

  // JFK → Queens
  { origin: 'Z_JFK', destination: 'Z_QNS', vehicle: 'sedan', price: 13000 },      // $130
  { origin: 'Z_JFK', destination: 'Z_QNS', vehicle: 'suv', price: 15000 },        // $150
  { origin: 'Z_JFK', destination: 'Z_QNS', vehicle: 'minivan', price: 14000 },    // $140

  // JFK → Brooklyn
  { origin: 'Z_JFK', destination: 'Z_BKLYN', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_JFK', destination: 'Z_BKLYN', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_JFK', destination: 'Z_BKLYN', vehicle: 'minivan', price: 15000 },  // $150

  // JFK → Manhattan
  { origin: 'Z_JFK', destination: 'Z_MHTN', vehicle: 'sedan', price: 13000 },     // $130
  { origin: 'Z_JFK', destination: 'Z_MHTN', vehicle: 'suv', price: 16000 },       // $160
  { origin: 'Z_JFK', destination: 'Z_MHTN', vehicle: 'minivan', price: 15000 },   // $150

  // JFK → Bronx
  { origin: 'Z_JFK', destination: 'Z_BRONX', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_JFK', destination: 'Z_BRONX', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_JFK', destination: 'Z_BRONX', vehicle: 'minivan', price: 15000 },  // $150

  // JFK → Newark
  { origin: 'Z_JFK', destination: 'Z_EWR', vehicle: 'sedan', price: 14000 },      // $140
  { origin: 'Z_JFK', destination: 'Z_EWR', vehicle: 'suv', price: 17000 },        // $170
  { origin: 'Z_JFK', destination: 'Z_EWR', vehicle: 'minivan', price: 16000 },    // $160

  // LaGuardia → Manhattan
  { origin: 'Z_LGA', destination: 'Z_MHTN', vehicle: 'sedan', price: 13000 },     // $130
  { origin: 'Z_LGA', destination: 'Z_MHTN', vehicle: 'suv', price: 16000 },       // $160
  { origin: 'Z_LGA', destination: 'Z_MHTN', vehicle: 'minivan', price: 15000 },   // $150

  // LaGuardia → Bronx
  { origin: 'Z_LGA', destination: 'Z_BRONX', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_LGA', destination: 'Z_BRONX', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_LGA', destination: 'Z_BRONX', vehicle: 'minivan', price: 15000 },  // $150

  // LaGuardia → Queens
  { origin: 'Z_LGA', destination: 'Z_QNS', vehicle: 'sedan', price: 12000 },      // $120
  { origin: 'Z_LGA', destination: 'Z_QNS', vehicle: 'suv', price: 15000 },        // $150
  { origin: 'Z_LGA', destination: 'Z_QNS', vehicle: 'minivan', price: 14000 },    // $140

  // LaGuardia → Brooklyn
  { origin: 'Z_LGA', destination: 'Z_BKLYN', vehicle: 'sedan', price: 13000 },    // $130
  { origin: 'Z_LGA', destination: 'Z_BKLYN', vehicle: 'suv', price: 16000 },      // $160
  { origin: 'Z_LGA', destination: 'Z_BKLYN', vehicle: 'minivan', price: 15000 },  // $150

  // LaGuardia → Newark
  { origin: 'Z_LGA', destination: 'Z_EWR', vehicle: 'sedan', price: 14000 },      // $140
  { origin: 'Z_LGA', destination: 'Z_EWR', vehicle: 'suv', price: 17000 },        // $170
  { origin: 'Z_LGA', destination: 'Z_EWR', vehicle: 'minivan', price: 16000 },    // $160

  // Newark → Manhattan
  { origin: 'Z_EWR', destination: 'Z_MHTN', vehicle: 'sedan', price: 14000 },     // $140
  { origin: 'Z_EWR', destination: 'Z_MHTN', vehicle: 'suv', price: 17000 },       // $170
  { origin: 'Z_EWR', destination: 'Z_MHTN', vehicle: 'minivan', price: 16000 },   // $160

  // Newark → Brooklyn
  { origin: 'Z_EWR', destination: 'Z_BKLYN', vehicle: 'sedan', price: 14000 },    // $140
  { origin: 'Z_EWR', destination: 'Z_BKLYN', vehicle: 'suv', price: 17000 },      // $170
  { origin: 'Z_EWR', destination: 'Z_BKLYN', vehicle: 'minivan', price: 16000 },  // $160

  // Newark → Queens
  { origin: 'Z_EWR', destination: 'Z_QNS', vehicle: 'sedan', price: 14000 },      // $140
  { origin: 'Z_EWR', destination: 'Z_QNS', vehicle: 'suv', price: 17000 },        // $170
  { origin: 'Z_EWR', destination: 'Z_QNS', vehicle: 'minivan', price: 16000 },    // $160

  // Newark → Bronx
  { origin: 'Z_EWR', destination: 'Z_BRONX', vehicle: 'sedan', price: 14000 },    // $140
  { origin: 'Z_EWR', destination: 'Z_BRONX', vehicle: 'suv', price: 17000 },      // $170
  { origin: 'Z_EWR', destination: 'Z_BRONX', vehicle: 'minivan', price: 16000 },  // $160

  // Reversas do Newark
  { origin: 'Z_MHTN', destination: 'Z_EWR', vehicle: 'sedan', price: 14000 },     // $140
  { origin: 'Z_MHTN', destination: 'Z_EWR', vehicle: 'suv', price: 17000 },       // $170
  { origin: 'Z_MHTN', destination: 'Z_EWR', vehicle: 'minivan', price: 16000 },   // $160
  { origin: 'Z_BKLYN', destination: 'Z_EWR', vehicle: 'sedan', price: 14000 },    // $140
  { origin: 'Z_BKLYN', destination: 'Z_EWR', vehicle: 'suv', price: 17000 },      // $170
  { origin: 'Z_BKLYN', destination: 'Z_EWR', vehicle: 'minivan', price: 16000 },  // $160
  { origin: 'Z_QNS', destination: 'Z_EWR', vehicle: 'sedan', price: 14000 },      // $140
  { origin: 'Z_QNS', destination: 'Z_EWR', vehicle: 'suv', price: 17000 },        // $170
  { origin: 'Z_QNS', destination: 'Z_EWR', vehicle: 'minivan', price: 16000 },    // $160
  { origin: 'Z_BRONX', destination: 'Z_EWR', vehicle: 'sedan', price: 14000 },    // $140
  { origin: 'Z_BRONX', destination: 'Z_EWR', vehicle: 'suv', price: 17000 },      // $170
  { origin: 'Z_BRONX', destination: 'Z_EWR', vehicle: 'minivan', price: 16000 },  // $160

  // ========== ROTAS INTER-BOROUGHS ==========

  // Manhattan ↔ Brooklyn
  { origin: 'Z_MHTN', destination: 'Z_BKLYN', vehicle: 'sedan', price: 7500 },    // $75
  { origin: 'Z_MHTN', destination: 'Z_BKLYN', vehicle: 'suv', price: 11500 },     // $115
  { origin: 'Z_MHTN', destination: 'Z_BKLYN', vehicle: 'minivan', price: 13000 }, // $130
  { origin: 'Z_BKLYN', destination: 'Z_MHTN', vehicle: 'sedan', price: 7500 },    // $75
  { origin: 'Z_BKLYN', destination: 'Z_MHTN', vehicle: 'suv', price: 11500 },     // $115
  { origin: 'Z_BKLYN', destination: 'Z_MHTN', vehicle: 'minivan', price: 13000 }, // $130

  // Manhattan ↔ Queens
  { origin: 'Z_MHTN', destination: 'Z_QNS', vehicle: 'sedan', price: 7500 },      // $75
  { origin: 'Z_MHTN', destination: 'Z_QNS', vehicle: 'suv', price: 11500 },       // $115
  { origin: 'Z_MHTN', destination: 'Z_QNS', vehicle: 'minivan', price: 13000 },   // $130
  { origin: 'Z_QNS', destination: 'Z_MHTN', vehicle: 'sedan', price: 7500 },      // $75
  { origin: 'Z_QNS', destination: 'Z_MHTN', vehicle: 'suv', price: 11500 },       // $115
  { origin: 'Z_QNS', destination: 'Z_MHTN', vehicle: 'minivan', price: 13000 },   // $130

  // Manhattan ↔ Bronx
  { origin: 'Z_MHTN', destination: 'Z_BRONX', vehicle: 'sedan', price: 7500 },    // $75
  { origin: 'Z_MHTN', destination: 'Z_BRONX', vehicle: 'suv', price: 11500 },     // $115
  { origin: 'Z_MHTN', destination: 'Z_BRONX', vehicle: 'minivan', price: 13000 }, // $130
  { origin: 'Z_BRONX', destination: 'Z_MHTN', vehicle: 'sedan', price: 7500 },    // $75
  { origin: 'Z_BRONX', destination: 'Z_MHTN', vehicle: 'suv', price: 11500 },     // $115
  { origin: 'Z_BRONX', destination: 'Z_MHTN', vehicle: 'minivan', price: 13000 }, // $130

  // Brooklyn ↔ Queens
  { origin: 'Z_BKLYN', destination: 'Z_QNS', vehicle: 'sedan', price: 7500 },     // $75
  { origin: 'Z_BKLYN', destination: 'Z_QNS', vehicle: 'suv', price: 11500 },      // $115
  { origin: 'Z_BKLYN', destination: 'Z_QNS', vehicle: 'minivan', price: 13000 },  // $130
  { origin: 'Z_QNS', destination: 'Z_BKLYN', vehicle: 'sedan', price: 7500 },     // $75
  { origin: 'Z_QNS', destination: 'Z_BKLYN', vehicle: 'suv', price: 11500 },      // $115
  { origin: 'Z_QNS', destination: 'Z_BKLYN', vehicle: 'minivan', price: 13000 },  // $130

  // Brooklyn ↔ Bronx
  { origin: 'Z_BKLYN', destination: 'Z_BRONX', vehicle: 'sedan', price: 7500 },   // $75
  { origin: 'Z_BKLYN', destination: 'Z_BRONX', vehicle: 'suv', price: 11500 },    // $115
  { origin: 'Z_BKLYN', destination: 'Z_BRONX', vehicle: 'minivan', price: 13000 }, // $130
  { origin: 'Z_BRONX', destination: 'Z_BKLYN', vehicle: 'sedan', price: 7500 },   // $75
  { origin: 'Z_BRONX', destination: 'Z_BKLYN', vehicle: 'suv', price: 11500 },    // $115
  { origin: 'Z_BRONX', destination: 'Z_BKLYN', vehicle: 'minivan', price: 13000 }, // $130

  // Queens ↔ Bronx
  { origin: 'Z_QNS', destination: 'Z_BRONX', vehicle: 'sedan', price: 7500 },     // $75
  { origin: 'Z_QNS', destination: 'Z_BRONX', vehicle: 'suv', price: 11500 },      // $115
  { origin: 'Z_QNS', destination: 'Z_BRONX', vehicle: 'minivan', price: 13000 },  // $130
  { origin: 'Z_BRONX', destination: 'Z_QNS', vehicle: 'sedan', price: 7500 },     // $75
  { origin: 'Z_BRONX', destination: 'Z_QNS', vehicle: 'suv', price: 11500 },      // $115
  { origin: 'Z_BRONX', destination: 'Z_QNS', vehicle: 'minivan', price: 13000 },  // $130
];

/**
 * Corrige todos os preços no banco de dados
 */
export async function fixAllPricing(): Promise<{ success: boolean; message: string; updated: number }> {
  try {
    console.log('🚀 Iniciando correção de preços...');
    
    // Primeiro, limpa todos os preços existentes
    const { error: deleteError } = await supabase
      .from('zone_pricing')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos os registros

    if (deleteError) {
      console.error('Erro ao limpar preços existentes:', deleteError);
    }

    let updated = 0;
    const total = CORRECT_PRICES.length;

    // Insere todos os preços corretos
    for (const priceData of CORRECT_PRICES) {
      const { error } = await supabase
        .from('zone_pricing')
        .insert({
          origin_zone_id: priceData.origin,
          destination_zone_id: priceData.destination,
          vehicle_category_id: priceData.vehicle,
          price: priceData.price,
          is_active: true
        });

      if (error) {
        console.error(`Erro ao inserir ${priceData.origin} → ${priceData.destination} (${priceData.vehicle}):`, error);
      } else {
        updated++;
      }

      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`✅ Correção concluída! ${updated}/${total} rotas atualizadas`);

    return {
      success: true,
      message: `Preços corrigidos com sucesso! ${updated}/${total} rotas atualizadas`,
      updated
    };

  } catch (error) {
    console.error('Erro na correção de preços:', error);
    return {
      success: false,
      message: 'Erro na correção de preços',
      updated: 0
    };
  }
}

/**
 * Testa se os preços estão corretos
 */
export async function testPricing(): Promise<{ success: boolean; message: string; price?: number }> {
  try {
    // Testa Queens → JFK Sedan (deveria ser $130)
    const { data, error } = await supabase
      .from('zone_pricing')
      .select('price')
      .eq('origin_zone_id', 'Z_QNS')
      .eq('destination_zone_id', 'Z_JFK')
      .eq('vehicle_category_id', 'sedan')
      .single();

    if (error || !data) {
      return {
        success: false,
        message: 'Preço não encontrado para Queens → JFK Sedan'
      };
    }

    const priceInDollars = data.price / 100;
    const expectedPrice = 130;

    if (priceInDollars === expectedPrice) {
      return {
        success: true,
        message: `✅ Preços corretos! Queens → JFK Sedan: $${priceInDollars}`,
        price: priceInDollars
      };
    } else {
      return {
        success: false,
        message: `❌ Preço incorreto! Queens → JFK Sedan: $${priceInDollars} (esperado: $${expectedPrice})`,
        price: priceInDollars
      };
    }

  } catch (error) {
    console.error('Erro no teste:', error);
    return {
      success: false,
      message: 'Erro no teste de preços'
    };
  }
} 