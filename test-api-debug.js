// Teste para debug da API
console.log('🔍 Debug da API GoFlightLabs...');
console.log('================================');

const testAPIDebug = async () => {
  console.log('🚀 Testando API GoFlightLabs diretamente...');
  
  const GOFLIGHTLABS_ACCESS_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiOWQzMWRjNjJmNmM0NWJiZjRlYzE5MjFhYTA5YjdiNjJmN2I2ZWZjYmMzNjIwMDNhZDAyNzgxZDE4YWEwYjU4N2Y2NzQiLCJpYXQiOjE3NTY5MjAzMTEsIm5iZiI6MTc1NjkyMDMxMSwiZXhwIjoxNzg4NDU2MzExLCJzdWIiOiIyNTgzMyIsInNjb3BlcyI6W119.S4f_59yamYhwst_YE8SnreQ1XhVmqQUWsB67yN1O3rFYRp4qWJ7PNIyUP2YRZeEQlvG8RC5i0dorDHpeiJQoKA';
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  const apiUrl = `https://app.goflightlabs.com/flights?access_key=${GOFLIGHTLABS_ACCESS_KEY}&flight_iata=LA3359&flight_date=${formattedDate}`;
  
  console.log('📋 URL da API:', apiUrl);
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Resposta da GoFlightLabs:', JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('🎉 Dados reais encontrados!');
      console.log('   - Voo:', data.data[0].flight?.iata);
      console.log('   - Companhia:', data.data[0].airline?.name);
      console.log('   - Partida:', data.data[0].departure?.scheduled);
      console.log('   - Chegada:', data.data[0].arrival?.scheduled);
    } else {
      console.log('❌ Nenhum dado encontrado na API GoFlightLabs');
      console.log('   - Status:', data.status);
      console.log('   - Data:', data.data);
    }
    
  } catch (error) {
    console.error('❌ Erro ao chamar GoFlightLabs:', error.message);
  }
};

testAPIDebug();
