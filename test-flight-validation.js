// Script de teste para a função flight-validation
const testFlightValidation = async () => {
  // Substitua pelas suas credenciais reais do Supabase
  const SUPABASE_URL = 'https://your-project-ref.supabase.co';
  const SUPABASE_ANON_KEY = 'your-anon-key';
  
  const testData = {
    flight_number: 'LA3359',
    date: '2024-12-20',
    time: '14:00',
    booking_type: 'dropoff'
  };

  try {
    console.log('🔍 Testando validação de voo LA3359...');
    console.log('📋 Dados de teste:', testData);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/flight-validation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na requisição:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta da validação:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.flight_found) {
      console.log('🎉 Voo encontrado!');
      console.log('✈️ Companhia:', result.validation_result.flight_info?.airline);
      console.log('🕐 Partida:', result.validation_result.flight_info?.departure_time);
      console.log('✅ Válido:', result.validation_result.is_valid);
    } else {
      console.log('⚠️ Voo não encontrado ou erro na validação');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar o teste
testFlightValidation();
