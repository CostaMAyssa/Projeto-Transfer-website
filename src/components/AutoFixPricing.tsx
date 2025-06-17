import { useEffect, useState } from 'react';
import { fixAllPricing, testPricing } from '@/lib/fix-pricing';

const AutoFixPricing = () => {
  const [status, setStatus] = useState<string>('');
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const runFix = async () => {
      if (isFixed) return;

      try {
        setStatus('🔍 Verificando preços atuais...');
        
        // Primeiro testa se os preços estão corretos
        const testResult = await testPricing();
        
        if (testResult.success) {
          setStatus('✅ Preços já estão corretos!');
          setIsFixed(true);
          return;
        }

        setStatus('🔧 Preços incorretos detectados. Corrigindo...');
        
        // Executa a correção
        const fixResult = await fixAllPricing();
        
        if (fixResult.success) {
          setStatus(`✅ Correção concluída! ${fixResult.updated} rotas atualizadas`);
          
          // Testa novamente para confirmar
          setTimeout(async () => {
            const finalTest = await testPricing();
            if (finalTest.success) {
              setStatus('🎉 Sistema 100% funcional! Preços corretos aplicados.');
            } else {
              setStatus('⚠️ Correção aplicada, mas ainda há inconsistências.');
            }
            setIsFixed(true);
          }, 2000);
        } else {
          setStatus('❌ Erro na correção de preços');
        }

      } catch (error) {
        console.error('Erro na correção automática:', error);
        setStatus('❌ Erro na correção automática');
      }
    };

    // Executa após 2 segundos para dar tempo da página carregar
    const timer = setTimeout(runFix, 2000);
    
    return () => clearTimeout(timer);
  }, [isFixed]);

  if (!status) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
      <div className="text-sm font-medium">
        {status}
      </div>
    </div>
  );
};

export default AutoFixPricing; 