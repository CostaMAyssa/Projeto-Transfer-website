// Teste final para debug
console.log('🔍 Teste final de debug...');
console.log('=========================');

const testFinalDebug = async () => {
  console.log('🚀 Testando função flight-validation com debug completo...');
  
  const SUPABASE_URL = 'https://micpkdvtewsbtbrptuoj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY3BrZHZ0ZXdzYnRicnB0dW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTc3MzksImV4cCI6MjA2NTMzMzczOX0.ZT-ahqgL0Zc1GxAzUEYCL-uFMecnWy0L3ZBIROamtwA';
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  const testData = {
    flight_number: 'LA3359',
    date: formattedDate,
    time: '12:00',
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
    console.log('✅ Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.success && data.flight_found) {
      const flightInfo = data.validation_result.flight_info;
      console.log('\n🎯 Dados do voo:');
      console.log('   - Companhia:', flightInfo.airline);
      console.log('   - Voo:', flightInfo.flight_number);
      console.log('   - Partida:', flightInfo.departure_time);
      console.log('   - Chegada:', flightInfo.arrival_time);
      console.log('   - Aeroporto partida:', flightInfo.departure_airport);
      console.log('   - Aeroporto chegada:', flightInfo.arrival_airport);
      console.log('   - Terminal:', flightInfo.terminal);
      console.log('   - Portão:', flightInfo.gate);
      
      // Verificar se são dados mockados ou fallback
      if (flightInfo.airline === 'LATAM Airlines' && flightInfo.flight_number === 'LA3359') {
        console.log('\n✅ DADOS MOCKADOS FUNCIONANDO!');
      } else if (flightInfo.airline === 'Unknown Airline' && flightInfo.flight_number === 'UNK0000') {
        console.log('\n❌ AINDA RETORNANDO DADOS FALLBACK');
      } else {
        console.log('\n🔍 DADOS DIFERENTES:', flightInfo.airline, flightInfo.flight_number);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

testFinalDebug();
