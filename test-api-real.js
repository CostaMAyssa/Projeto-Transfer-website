// Teste para verificar se a API está retornando dados reais
console.log('🔍 Testando API de voos...');
console.log('==========================');

const testFlightAPI = async () => {
  console.log('🚀 Testando função flight-validation com voo real...');
  
  const SUPABASE_URL = 'https://micpkdvtewsbtbrptuoj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY3BrZHZ0ZXdzYnRicnB0dW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTc3MzksImV4cCI6MjA2NTMzMzczOX0.ZT-ahqgL0Zc1GxAzUEYCL-uFMecnWy0L3ZBIROamtwA';
  
  const testData = {
    flight_number: 'LA3359',
    date: '2025-01-15',
    time: '14:00',
    booking_type: 'dropoff'
  };
  
  console.log('📋 Dados de teste:', testData);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/flight-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Resposta da API:', JSON.stringify(data, null, 2));
    
    if (data.success && data.flight_found) {
      console.log('🎉 Voo encontrado!');
      console.log('   - Companhia:', data.validation_result.flight_info?.airline);
      console.log('   - Voo:', data.validation_result.flight_info?.flight_number);
      console.log('   - Partida:', data.validation_result.flight_info?.departure_time);
      console.log('   - Chegada:', data.validation_result.flight_info?.arrival_time);
    } else {
      console.log('❌ Voo não encontrado ou erro na API');
      console.log('   - Success:', data.success);
      console.log('   - Flight found:', data.flight_found);
      console.log('   - Error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro ao chamar API:', error.message);
  }
};

testFlightAPI();
