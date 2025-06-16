import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { ZonePricingDatabaseService } from '@/lib/zone-pricing-db';

const InitializeZonePricing: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationResult, setInitializationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setInitializationResult(null);

    try {
      await ZonePricingDatabaseService.initializeDefaultData();
      setInitializationResult({
        success: true,
        message: 'Dados do Zone Pricing inicializados com sucesso! As 7 zonas e matriz de preços foram criadas.'
      });
    } catch (error) {
      console.error('Erro na inicialização:', error);
      setInitializationResult({
        success: false,
        message: 'Erro ao inicializar dados. Verifique o console para mais detalhes.'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Inicializar Zone Pricing
          </CardTitle>
          <CardDescription>
            Configure as 7 zonas e matriz de preços no banco de dados para o sistema de transporte.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">O que será criado:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">🗺️ Zonas (7):</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Newark Airport (EWR)</li>
                  <li>• JFK Airport</li>
                  <li>• LaGuardia Airport (LGA)</li>
                  <li>• Bronx, NY</li>
                  <li>• Brooklyn, NY</li>
                  <li>• Manhattan, NY</li>
                  <li>• Queens, NY</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🚗 Categorias (3):</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Sedan - $750 (3 pax)</li>
                  <li>• SUV - $1,150 (6 pax)</li>
                  <li>• Minivan - $1,300 (7 pax)</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Matriz de preços:</strong> Serão criadas {7 * 7 * 3} = 147 combinações de preços 
                (origem × destino × categoria), inicialmente usando os preços base.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleInitialize}
              disabled={isInitializing}
              className="w-full"
              size="lg"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inicializando...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Inicializar Dados
                </>
              )}
            </Button>

            {initializationResult && (
              <Alert variant={initializationResult.success ? "default" : "destructive"}>
                {initializationResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {initializationResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p><strong>Nota:</strong> Se os dados já existirem no banco, nada será sobrescrito.</p>
            <p><strong>Segurança:</strong> Esta operação é segura e pode ser executada múltiplas vezes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitializeZonePricing; 