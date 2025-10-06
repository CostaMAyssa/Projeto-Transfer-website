// Teste para verificar diferença de endpoints
console.log('🔍 Testando diferentes endpoints da GoFlightLabs...');
console.log('================================================');

const testEndpoints = async () => {
  const GOFLIGHTLABS_ACCESS_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiOWQzMWRjNjJmNmM0NWJiZjRlYzE5MjFhYTA5YjdiNjJmN2I2ZWZjYmMzNjIwMDNhZDAyNzgxZDE4YWEwYjU4N2Y2NzQiLCJpYXQiOjE3NTY5MjAzMTEsIm5iZiI6MTc1NjkyMDMxMSwiZXhwIjoxNzg4NDU2MzExLCJzdWIiOiIyNTgzMyIsInNjb3BlcyI6W119.S4f_59yamYhwst_YE8SnreQ1XhVmqQUWsB67yN1O3rFYRp4qWJ7PNIyUP2YRZeEQlvG8RC5i0dorDHpeiJQoKA';
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  
  console.log('📋 Testando diferentes endpoints...');
  
  // Endpoint 1: flights (que você disse que funciona)
  const endpoint1 = `https://app.goflightlabs.com/flights?access_key=${GOFLIGHTLABS_ACCESS_KEY}&flight_iata=LA3359&flight_date=${formattedDate}`;
  
  // Endpoint 2: flight (que estamos usando)
  const endpoint2 = `https://www.goflightlabs.com/flight?access_key=${GOFLIGHTLABS_ACCESS_KEY}&flight_number=LA3359&date=${formattedDate}`;
  
  console.log('🔍 Endpoint 1 (flights):', endpoint1);
  console.log('🔍 Endpoint 2 (flight):', endpoint2);
  
  try {
    // Teste endpoint 1
    console.log('\n🚀 Testando endpoint 1 (flights)...');
    const response1 = await fetch(endpoint1);
    console.log('Status:', response1.status);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Resposta endpoint 1:', JSON.stringify(data1, null, 2));
    } else {
      console.log('❌ Erro endpoint 1:', response1.statusText);
    }
    
    // Teste endpoint 2
    console.log('\n🚀 Testando endpoint 2 (flight)...');
    const response2 = await fetch(endpoint2);
    console.log('Status:', response2.status);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Resposta endpoint 2:', JSON.stringify(data2, null, 2));
    } else {
      console.log('❌ Erro endpoint 2:', response2.statusText);
    }
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
};

testEndpoints();
