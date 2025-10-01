// Teste da função flight-validation deployada
const testDeployedFunction = async () => {
  const SUPABASE_URL = 'https://chvfqtutihudfnxpvfzt.supabase.co';
  
  // Você precisa da chave anônima do Supabase
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Substitua pela sua chave real
  
  if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.log('❌ Configure sua chave anônima do Supabase:');
    console.log('1. Vá para o dashboard do Supabase');
    console.log('2. Settings > API');
    console.log('3. Copie a "anon public" key');
    console.log('4. Substitua YOUR_SUPABASE_ANON_KEY neste arquivo');
    return;
  }

  const testData = {
    flight_number: 'LA3359',
    date: '2024-12-20',
    time: '14:00',
    booking_type: 'dropoff'
  };

  try {
    console.log('🚀 Testando função flight-validation deployada...');
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
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na requisição:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta da validação:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      if (result.flight_found) {
        console.log('🎉 Voo encontrado!');
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
    console.log('💡 Verifique se:');
    console.log('   - A função foi deployada corretamente');
    console.log('   - As variáveis de ambiente estão configuradas');
    console.log('   - A chave anônima está correta');
  }
};

// Executar o teste
testDeployedFunction();
