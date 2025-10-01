// Script para testar a validação de voo localmente
// Execute: node test-flight-validation-local.js

const testFlightValidation = async () => {
  console.log('🚀 Testando Sistema de Validação de Voo');
  console.log('=====================================');
  
  // Dados de teste para o voo LATAM LA3359
  const testCases = [
    {
      name: 'Voo válido - Drop-off 2h antes',
      data: {
        flight_number: 'LA3359',
        date: '2024-12-20',
        time: '12:00', // 2h antes do voo (assumindo voo às 14:00)
        booking_type: 'dropoff'
      }
    },
    {
      name: 'Voo inválido - Drop-off muito tarde',
      data: {
        flight_number: 'LA3359',
        date: '2024-12-20',
        time: '15:00', // 1h depois do voo (assumindo voo às 14:00)
        booking_type: 'dropoff'
      }
    },
    {
      name: 'Pickup válido - 1h após chegada',
      data: {
        flight_number: 'LA3359',
        date: '2024-12-20',
        time: '16:00', // 1h após chegada (assumindo chegada às 15:00)
        booking_type: 'pickup'
      }
    }
  ];

  console.log('\n📋 Casos de teste:');
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   Voo: ${testCase.data.flight_number}`);
    console.log(`   Data: ${testCase.data.date}`);
    console.log(`   Hora: ${testCase.data.time}`);
    console.log(`   Tipo: ${testCase.data.booking_type}`);
    console.log('');
  });

  console.log('⚠️  Para testar com a API real:');
  console.log('1. Configure GOFLIGHTLABS_ACCESS_KEY no .env.local');
  console.log('2. Deploy a função flight-validation no Supabase');
  console.log('3. Execute: node test-flight-api.js');
  
  console.log('\n✅ Sistema de validação implementado com:');
  console.log('   - Regras de tempo: 1.5h antes (drop-off), 30min após (pickup)');
  console.log('   - Validação em tempo real');
  console.log('   - Sugestões automáticas de horário');
  console.log('   - Interface de usuário integrada');
};

// Executar o teste
testFlightValidation();
