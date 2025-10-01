// Teste direto da API GoFlightLabs para verificar se está funcionando
const testGoFlightLabs = async () => {
  // Você precisa configurar sua chave da API GoFlightLabs
  const accessKey = 'YOUR_GOFLIGHTLABS_ACCESS_KEY';
  
  if (accessKey === 'YOUR_GOFLIGHTLABS_ACCESS_KEY') {
    console.log('❌ Configure sua chave da API GoFlightLabs no arquivo .env.local');
    console.log('📝 Adicione: GOFLIGHTLABS_ACCESS_KEY=sua_chave_aqui');
    return;
  }

  const testData = {
    flight_number: 'LA3359',
    date: '2024-12-20'
  };

  try {
    console.log('🔍 Testando API GoFlightLabs diretamente...');
    console.log('📋 Dados de teste:', testData);
    
    const url = new URL('https://www.goflightlabs.com/flight');
    url.searchParams.append('access_key', accessKey);
    url.searchParams.append('flight_number', testData.flight_number);
    url.searchParams.append('date', testData.date);
    
    console.log('🌐 URL da requisição:', url.toString());
    
    const response = await fetch(url.toString());
    
    console.log('📊 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta da API GoFlightLabs:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

// Executar o teste
testGoFlightLabs();
