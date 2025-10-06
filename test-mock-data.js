// Teste direto dos dados mockados
console.log('🔍 Testando dados mockados diretamente...');
console.log('========================================');

const testMockData = () => {
  const date = '2025-10-05';
  
  const mockData = {
    flight_date: date,
    flight_status: 'scheduled',
    departure: {
      airport: 'Aeroporto Internacional de Guarulhos',
      iata: 'GRU',
      scheduled: new Date(`${date}T14:00:00Z`).toISOString(),
      terminal: '2',
      gate: 'A15'
    },
    arrival: {
      airport: 'Aeroporto Santos Dumont',
      iata: 'SDU', 
      scheduled: new Date(`${date}T16:30:00Z`).toISOString(),
      terminal: '1',
      gate: 'B8'
    },
    airline: {
      name: 'LATAM Airlines',
      iata: 'LA'
    },
    flight: {
      iata: 'LA3359'
    }
  };
  
  console.log('📋 Dados mockados:', JSON.stringify(mockData, null, 2));
  
  // Simular a resposta final
  const response = {
    success: true,
    flight_found: true,
    validation_result: {
      is_valid: true,
      flight_info: {
        flight_number: mockData.flight.iata,
        airline: mockData.airline.name,
        departure_time: mockData.departure.scheduled,
        arrival_time: mockData.arrival.scheduled,
        departure_airport: mockData.departure.airport,
        arrival_airport: mockData.arrival.airport,
        terminal: mockData.departure.terminal,
        gate: mockData.departure.gate,
        status: mockData.flight_status
      }
    }
  };
  
  console.log('\n✅ Resposta final esperada:');
  console.log(JSON.stringify(response, null, 2));
  
  console.log('\n🎯 Informações do voo:');
  console.log('   - Companhia:', response.validation_result.flight_info.airline);
  console.log('   - Voo:', response.validation_result.flight_info.flight_number);
  console.log('   - Partida:', new Date(response.validation_result.flight_info.departure_time).toLocaleString());
  console.log('   - Chegada:', new Date(response.validation_result.flight_info.arrival_time).toLocaleString());
  console.log('   - Terminal:', response.validation_result.flight_info.terminal);
  console.log('   - Portão:', response.validation_result.flight_info.gate);
};

testMockData();
