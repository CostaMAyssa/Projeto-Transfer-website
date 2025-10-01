// Teste com data de hoje e voo mais comum
const testFlightToday = async () => {
  console.log('🚀 Testando função flight-validation com data de hoje');
  console.log('====================================================');
  
  const SUPABASE_URL = 'https://micpkdvtewsbtbrptuoj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pY3BrZHZ0ZXdzYnRicnB0dW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTc3MzksImV4cCI6MjA2NTMzMzczOX0.ZT-ahqgL0Zc1GxAzUEYCL-uFMecnWy0L3ZBIROamtwA';
  
  // Data de hoje
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const testCases = [
    {
      name: 'LATAM LA3359 - Data de hoje',
      data: {
        flight_number: 'LA3359',
        date: todayStr,
        time: '14:00',
        booking_type: 'dropoff'
      }
    },
    {
      name: 'GOL G31900 - Data de hoje',
      data: {
        flight_number: 'G31900',
        date: todayStr,
        time: '14:00',
        booking_type: 'dropoff'
      }
    },
    {
      name: 'AZUL AD4001 - Data de hoje',
      data: {
        flight_number: 'AD4001',
        date: todayStr,
        time: '14:00',
        booking_type: 'dropoff'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testando: ${testCase.name}`);
    console.log('Dados:', testCase.data);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/flight-validation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });

      console.log('📊 Status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resposta:', JSON.stringify(result, null, 2));
        
        if (result.success && result.flight_found) {
          console.log('🎉 VOO ENCONTRADO!');
          console.log('✈️ Companhia:', result.validation_result.flight_info?.airline);
          console.log('🕐 Partida:', result.validation_result.flight_info?.departure_time);
          console.log('✅ Válido:', result.validation_result.is_valid);
          break; // Parar no primeiro voo encontrado
        } else {
          console.log('⚠️ Voo não encontrado:', result.validation_result.reason);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erro:', errorText);
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }
};

// Executar o teste
testFlightToday();
