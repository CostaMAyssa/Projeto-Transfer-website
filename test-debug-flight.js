// Teste para debug dos campos de voo
console.log('🔍 Debug dos campos de voo...');
console.log('================================');

// Simular estrutura de dados que deveria chegar
const mockValidationData = {
  airline: 'LATAM',
  flightNumber: '3359',
  noFlightInfo: false,
  validationResult: {
    is_valid: false,
    reason: 'Horário muito cedo para este voo',
    suggested_time: '14:30',
    suggested_date: '2025-10-01',
    flight_info: {
      flight_number: 'LA3359',
      airline: 'LATAM',
      departure_time: '2025-10-01T16:00:00Z',
      arrival_time: '2025-10-01T18:00:00Z',
      departure_airport: 'GRU',
      arrival_airport: 'SDU',
      terminal: '2',
      gate: 'A15',
      status: 'scheduled'
    }
  }
};

console.log('\n📋 Estrutura esperada:');
console.log('   validationData:', mockValidationData);
console.log('   validationData.validationResult:', mockValidationData.validationResult);
console.log('   validationData.validationResult.is_valid:', mockValidationData.validationResult.is_valid);

console.log('\n🎯 Problemas possíveis:');
console.log('   1. Dados não estão chegando no componente');
console.log('   2. Estrutura dos dados está incorreta');
console.log('   3. Condições de renderização não estão sendo atendidas');
console.log('   4. CSS está escondendo o componente');

console.log('\n🔧 Próximos passos:');
console.log('   1. Verificar logs no console do navegador');
console.log('   2. Verificar se validationData está sendo passado corretamente');
console.log('   3. Verificar se isLoading está sendo passado corretamente');
console.log('   4. Verificar se as condições de renderização estão corretas');

console.log('\n✅ Execute o projeto e verifique os logs no console!');
