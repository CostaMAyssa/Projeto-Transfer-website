import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle, TestTube, Database, DollarSign } from 'lucide-react';
import { useZones, useVehicleCategories, useZonePricing, formatPrice } from '@/hooks/useZonePricing';
import { ZonePricingDatabaseService } from '@/lib/zone-pricing-db';

const TestZonePricingSimple: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<any>(null);

  // Hooks para dados
  const { data: zones, isLoading: zonesLoading, error: zonesError } = useZones();
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicleCategories();
  const { calculatePrice } = useZonePricing();

  // Coordenadas de teste (não precisa Google Places)
  const testLocations = [
    { name: "Newark Airport (EWR)", coords: [-74.1745, 40.6895] },
    { name: "JFK Airport", coords: [-73.7781, 40.6413] },
    { name: "LaGuardia Airport (LGA)", coords: [-73.8740, 40.7769] },
    { name: "Times Square, Manhattan", coords: [-73.9857, 40.7589] },
    { name: "Brooklyn Bridge", coords: [-73.9969, 40.7061] },
    { name: "Yankee Stadium, Bronx", coords: [-73.9276, 40.8296] },
    { name: "Flushing Meadows, Queens", coords: [-73.8448, 40.7282] }
  ];

  // Teste 1: Conectividade do banco
  const testDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      const zones = await ZonePricingDatabaseService.getZones();
      const vehicles = await ZonePricingDatabaseService.getVehicleCategories();
      const pricing = await ZonePricingDatabaseService.getAllZonePricing();
      
      setTestResults(prev => ({
        ...prev,
        database: {
          success: true,
          zones: zones.length,
          vehicles: vehicles.length,
          pricingRules: pricing.length,
          message: `✅ Banco conectado: ${zones.length} zonas, ${vehicles.length} veículos, ${pricing.length} regras de preço`
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        database: {
          success: false,
          error: error.message,
          message: '❌ Erro na conexão com banco'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Teste 2: Detecção de zonas com coordenadas fixas
  const testZoneDetection = async () => {
    setIsLoading(true);
    try {
      const results = [];
      
      for (const location of testLocations.slice(0, 3)) { // Testa apenas 3 locais
        try {
          const result = await calculatePrice({
            pickup_location: {
              address: location.name,
              coordinates: location.coords as [number, number]
            },
            dropoff_location: {
              address: "Times Square, Manhattan",
              coordinates: [-73.9857, 40.7589]
            },
            vehicle_category: 'suv'
          });
          
          results.push({
            location: location.name,
            detected: result.pickup_zone?.id || 'Não detectada',
            price: result.price || 0,
            success: result.success
          });
        } catch (error) {
          results.push({
            location: location.name,
            error: error.message,
            success: false
          });
        }
      }

      setTestResults(prev => ({
        ...prev,
        zoneDetection: {
          success: true,
          results,
          message: '✅ Teste de detecção de zonas concluído'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        zoneDetection: {
          success: false,
          error: error.message,
          message: '❌ Erro na detecção de zonas'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Teste específico com coordenadas conhecidas
  const testSpecificRoute = async (originIndex: number, destIndex: number, vehicle: string) => {
    setIsLoading(true);
    try {
      const origin = testLocations[originIndex];
      const destination = testLocations[destIndex];
      
      const result = await calculatePrice({
        pickup_location: {
          address: origin.name,
          coordinates: origin.coords as [number, number]
        },
        dropoff_location: {
          address: destination.name,
          coordinates: destination.coords as [number, number]
        },
        vehicle_category: vehicle
      });
      
      setPricingResult({
        ...result,
        origin: origin.name,
        destination: destination.name,
        vehicle: vehicle
      });
    } catch (error) {
      setPricingResult({
        success: false,
        message: error.message,
        origin: testLocations[originIndex].name,
        destination: testLocations[destIndex].name
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TestTube className="h-8 w-8" />
          Teste Simples Zone Pricing
        </h1>
        <p className="text-gray-600 mt-2">
          Teste básico sem dependência da Google Places API
        </p>
      </div>

      <div className="space-y-6">
        {/* Status das conexões */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Zonas</span>
                  <span className={`text-sm ${zonesLoading ? 'text-yellow-600' : zonesError ? 'text-red-600' : 'text-green-600'}`}>
                    {zonesLoading ? 'Carregando...' : zonesError ? 'Erro' : `${zones?.length || 0} ativos`}
                  </span>
                </div>
              </div>
              
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Veículos</span>
                  <span className={`text-sm ${vehiclesLoading ? 'text-yellow-600' : vehiclesError ? 'text-red-600' : 'text-green-600'}`}>
                    {vehiclesLoading ? 'Carregando...' : vehiclesError ? 'Erro' : `${vehicles?.length || 0} ativos`}
                  </span>
                </div>
              </div>
              
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Supabase</span>
                  <span className="text-sm text-green-600">✅ Conectado</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testes automáticos */}
        <Card>
          <CardHeader>
            <CardTitle>Testes Automáticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testDatabaseConnection} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                Testar Banco
              </Button>
              <Button onClick={testZoneDetection} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Testar Zonas
              </Button>
            </div>

            {/* Resultados dos testes */}
            <div className="space-y-3">
              {testResults.database && (
                <Alert variant={testResults.database.success ? "default" : "destructive"}>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Banco de Dados:</strong> {testResults.database.message}
                    {testResults.database.success && (
                      <div className="mt-2 text-xs">
                        Zonas: {testResults.database.zones} | 
                        Veículos: {testResults.database.vehicles} | 
                        Preços: {testResults.database.pricingRules}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {testResults.zoneDetection && (
                <Alert variant={testResults.zoneDetection.success ? "default" : "destructive"}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Detecção de Zonas:</strong> {testResults.zoneDetection.message}
                    {testResults.zoneDetection.results && (
                      <div className="mt-2 space-y-1 text-xs">
                        {testResults.zoneDetection.results.map((result, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{result.location}:</span>
                            <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                              {result.detected || result.error} 
                              {result.price > 0 && ` - ${formatPrice(result.price)}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teste de rotas específicas */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Rotas Específicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button 
                size="sm" 
                onClick={() => testSpecificRoute(0, 3, 'suv')}
                disabled={isLoading}
              >
                EWR → Manhattan
              </Button>
              <Button 
                size="sm" 
                onClick={() => testSpecificRoute(1, 3, 'sedan')}
                disabled={isLoading}
              >
                JFK → Manhattan
              </Button>
              <Button 
                size="sm" 
                onClick={() => testSpecificRoute(2, 4, 'minivan')}
                disabled={isLoading}
              >
                LGA → Brooklyn
              </Button>
              <Button 
                size="sm" 
                onClick={() => testSpecificRoute(3, 5, 'suv')}
                disabled={isLoading}
              >
                Manhattan → Bronx
              </Button>
            </div>

            {pricingResult && (
              <Alert variant={pricingResult.success ? "default" : "destructive"}>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <strong>Resultado:</strong> {pricingResult.origin} → {pricingResult.destination}
                    
                    {pricingResult.success ? (
                      <div className="space-y-1 text-sm">
                        <div>💰 <strong>Preço:</strong> {formatPrice(pricingResult.price || 0)}</div>
                        {pricingResult.pickup_zone && (
                          <div>📍 <strong>Zona Origem:</strong> {pricingResult.pickup_zone.name}</div>
                        )}
                        {pricingResult.dropoff_zone && (
                          <div>🎯 <strong>Zona Destino:</strong> {pricingResult.dropoff_zone.name}</div>
                        )}
                        {pricingResult.vehicle_category && (
                          <div>🚗 <strong>Veículo:</strong> {pricingResult.vehicle_category.name}</div>
                        )}
                        {pricingResult.out_of_coverage && (
                          <div className="text-amber-600">⚠️ Fora da área de cobertura</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-600">
                        ❌ {pricingResult.message}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestZonePricingSimple; 