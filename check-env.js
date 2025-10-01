// Verificar configuração das variáveis de ambiente
console.log('🔍 Verificando configuração do ambiente...');
console.log('=====================================');

// Verificar se estamos em um ambiente Node.js
if (typeof process !== 'undefined' && process.env) {
  console.log('✅ Ambiente Node.js detectado');
  
  // Verificar variáveis do Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const goflightKey = process.env.GOFLIGHTLABS_ACCESS_KEY;
  
  console.log('\n📋 Variáveis de ambiente:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Não encontrada');
  console.log('GOFLIGHTLABS_ACCESS_KEY:', goflightKey ? '✅ Configurada' : '❌ Não encontrada');
  
  if (supabaseUrl) {
    console.log('🌐 URL do Supabase:', supabaseUrl);
  }
  
  if (!supabaseKey) {
    console.log('\n⚠️ Para testar a função, você precisa:');
    console.log('1. Criar arquivo .env.local na raiz do projeto');
    console.log('2. Adicionar: VITE_SUPABASE_ANON_KEY=sua_chave_aqui');
    console.log('3. Adicionar: GOFLIGHTLABS_ACCESS_KEY=sua_chave_aqui');
  }
  
} else {
  console.log('❌ Ambiente Node.js não detectado');
  console.log('💡 Execute: node check-env.js');
}

console.log('\n🚀 Para testar a função flight-validation:');
console.log('1. Configure as variáveis de ambiente');
console.log('2. Execute: node test-deployed-function.js');
console.log('3. Ou execute: test-curl-simple.bat');
