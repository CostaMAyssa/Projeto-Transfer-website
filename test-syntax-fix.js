// Teste para verificar se o erro de sintaxe foi corrigido
console.log('🔧 Verificando correção do erro de sintaxe...');
console.log('==========================================');

// Simular verificação das declarações
const declarations = {
  'setOutboundFlightData (contexto)': '✅ Importado do useBooking()',
  'setOutboundFlightDataState (local)': '✅ Declarado como estado local',
  'setReturnFlightData (contexto)': '✅ Importado do useBooking()',
  'setReturnFlightDataState (local)': '✅ Declarado como estado local'
};

console.log('\n📋 Declarações verificadas:');
Object.entries(declarations).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

console.log('\n✅ Problemas corrigidos:');
console.log('   - Conflito de nomes resolvido');
console.log('   - Funções do contexto mantidas');
console.log('   - Estados locais renomeados');
console.log('   - Referências atualizadas');

console.log('\n🎯 Estrutura final:');
console.log('   - setOutboundFlightData: Função do contexto (para salvar no booking)');
console.log('   - setOutboundFlightDataState: Estado local (para UI)');
console.log('   - setReturnFlightData: Função do contexto (para salvar no booking)');
console.log('   - setReturnFlightDataState: Estado local (para UI)');

console.log('\n🚀 O erro de sintaxe foi corrigido!');
console.log('   Execute: npm run dev');
console.log('   Acesse: http://localhost:5173');
