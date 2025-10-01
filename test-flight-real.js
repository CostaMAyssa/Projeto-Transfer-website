// Teste direto da função flight-validation com credenciais hardcoded
const testFlightReal = async () => {
  console.log('🚀 Testando função flight-validation com voo LATAM LA3359');
  console.log('=======================================================');
  
  // Credenciais do seu projeto Supabase (do arquivo .env)
  const SUPABASE_URL = 'https://micpkdvtewsbtbrptuoj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY3BrZHZ0ZXdzYnRicnB0dW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTc3MzksImV4cCI6MjA2NTMzMzczOX0.ZT-ahqgL0Zc1GxAzUEYCL-uFMecnWy0L3ZBIROamtwA';
  
  const testData = {
    flight_number: 'LA3359',
    date: '2024-12-20',
    time: '14:00',
    booking_type: 'dropoff'
  };

  try {
    console.log('📋 Dados de teste:', testData);
    console.log('🌐 URL:', `${SUPABASE_URL}/functions/v1/flight-validation`);
    
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
      console.log('\n💡 Possíveis causas:');
      console.log('   - Chave anônima incorreta');
      console.log('   - Função não deployada corretamente');
      console.log('   - Variáveis de ambiente não configuradas na função');
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta da validação:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      if (result.flight_found) {
        console.log('\n🎉 Voo encontrado!');
        console.log('✈️ Companhia:', result.validation_result.flight_info?.airline);
        console.log('🕐 Partida:', result.validation_result.flight_info?.departure_time);
        console.log('✅ Válido:', result.validation_result.is_valid);
        
        if (!result.validation_result.is_valid) {
          console.log('⚠️ Problema no agendamento:', result.validation_result.reason);
          if (result.validation_result.suggested_time) {
            console.log('💡 Hora sugerida:', result.validation_result.suggested_time);
          }
        }
      } else {
        console.log('⚠️ Voo não encontrado:', result.validation_result.reason);
      }
    } else {
      console.log('❌ Erro na validação:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar o teste
testFlightReal();
