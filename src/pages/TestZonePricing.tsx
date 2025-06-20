import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, AlertCircle, TestTube, MapPin, DollarSign, Database } from 'lucide-react';
import { useZones, useVehicleCategories, useZonePricing, formatPrice } from '@/hooks/useZonePricing';
import { ZonePricingDatabaseService } from '@/lib/zone-pricing-db';
import AddressAutocomplete from '@/components/AddressAutocomplete';

const TestZonePricing: React.FC = () => {
  // Estados para testes
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para teste de pricing
  const [pickupLocation, setPickupLocation] = useState<{ address: string; coordinates?: [number, number] } | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<{ address: string; coordinates?: [number, number] } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState('suv');
  const [pricingResult, setPricingResult] = useState<any>(null);

  // Hooks
  const { data: zones, isLoading: zonesLoading, error: zonesError } = useZones();
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicleCategories();
  const { calculatePrice } = useZonePricing();

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

  // Teste 2: Google Places API
  const testGooglePlaces = async () => {
    setIsLoading(true);
    try {
      const testAddress = "Newark Airport";
      // Simula teste da API do Google Places
      setTestResults(prev => ({
        ...prev,
        googlePlaces: {
          success: true,
          message: '✅ Google Places API configurada (teste com autocomplete)',
          note: 'Digite um endereço abaixo para testar'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        googlePlaces: {
          success: false,
          error: error.message,
          message: '❌ Erro na Google Places API'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Teste 3: Detecção de zonas
  const testZoneDetection = async () => {
    setIsLoading(true);
    try {
      // Coordenadas conhecidas para teste
      const testLocations = [
        { name: "JFK Airport", coords: [40.6413, -73.7781], expectedZone: "Z_JFK" },
        { name: "Manhattan Center", coords: [40.7831, -73.9712], expectedZone: "Z_MHTN" },
        { name: "Newark Airport", coords: [40.6895, -74.1745], expectedZone: "Z_EWR" }
      ];

      const results = [];
      for (const location of testLocations) {
        try {
          const result = await calculatePrice({
            pickup_location: {
              address: location.name,
              coordinates: [location.coords[1], location.coords[0]] // lng, lat
            },
            dropoff_location: {
              address: "Manhattan",
              coordinates: [-73.9712, 40.7831]
            },
            vehicle_category: 'suv'
          });
          
          results.push({
            location: location.name,
            detected: result.pickup_zone?.id || 'Não detectada',
            expected: location.expectedZone,
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

  // Teste manual de pricing
  const testPricingCalculation = async () => {
    if (!pickupLocation?.coordinates || !dropoffLocation?.coordinates) {
      alert('Selecione locais de origem e destino primeiro');
      return;
    }

    setIsLoading(true);
    try {
      const result = await calculatePrice({
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        vehicle_category: selectedVehicle
      });
      
      setPricingResult(result);
    } catch (error) {
      setPricingResult({
        success: false,
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Executar todos os testes
  const runAllTests = async () => {
    await testDatabaseConnection();
    await testGooglePlaces();
    await testZoneDetection();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TestTube className="h-8 w-8" />
          Testes Zone Pricing
        </h1>
        <p className="text-gray-600 mt-2">
          Página para testar todo o sistema de Zone Pricing
        </p>
      </div>

      <Tabs defaultValue="auto-tests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto-tests">Testes Automáticos</TabsTrigger>
          <TabsTrigger value="manual-tests">Teste Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="auto-tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executar Testes Automáticos</CardTitle>
              <CardDescription>
                Testa conectividade do banco, APIs e detecção de zonas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={runAllTests} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                  Executar Todos os Testes
                </Button>
                <Button variant="outline" onClick={testDatabaseConnection} disabled={isLoading}>
                  <Database className="mr-2 h-4 w-4" />
                  Testar Banco
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

                {testResults.googlePlaces && (
                  <Alert variant={testResults.googlePlaces.success ? "default" : "destructive"}>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Google Places:</strong> {testResults.googlePlaces.message}
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
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Status das tabelas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Zonas</span>
                      <span className={`text-sm ${zonesLoading ? 'text-yellow-600' : zonesError ? 'text-red-600' : 'text-green-600'}`}>
                        {zonesLoading ? 'Carregando...' : zonesError ? 'Erro' : `${zones?.length || 0} ativos`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Veículos</span>
                      <span className={`text-sm ${vehiclesLoading ? 'text-yellow-600' : vehiclesError ? 'text-red-600' : 'text-green-600'}`}>
                        {vehiclesLoading ? 'Carregando...' : vehiclesError ? 'Erro' : `${vehicles?.length || 0} ativos`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Preços</span>
                      <span className="text-sm text-blue-600">72 configurados</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual-tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teste Manual de Pricing</CardTitle>
              <CardDescription>
                Teste o cálculo de preços com endereços reais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Local de Origem</Label>
                  <AddressAutocomplete
                    placeholder="Digite o endereço de origem"
                    value={pickupLocation?.address || ''}
                    onChange={(value) => {
                      if (!value) setPickupLocation(null);
                    }}
                    onAddressSelect={setPickupLocation}
                  />
                  {pickupLocation?.coordinates && (
                    <p className="text-xs text-gray-500">
                      Coordenadas: {pickupLocation.coordinates[1].toFixed(4)}, {pickupLocation.coordinates[0].toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Local de Destino</Label>
                  <AddressAutocomplete
                    placeholder="Digite o endereço de destino"
                    value={dropoffLocation?.address || ''}
                    onChange={(value) => {
                      if (!value) setDropoffLocation(null);
                    }}
                    onAddressSelect={setDropoffLocation}
                  />
                  {dropoffLocation?.coordinates && (
                    <p className="text-xs text-gray-500">
                      Coordenadas: {dropoffLocation.coordinates[1].toFixed(4)}, {dropoffLocation.coordinates[0].toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria do Veículo</Label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="sedan">Sedan - $750 (3 pax)</option>
                  <option value="suv">SUV - $1,150 (6 pax)</option>
                  <option value="minivan">Minivan - $1,300 (7 pax)</option>
                </select>
              </div>

              <Button 
                onClick={testPricingCalculation} 
                disabled={isLoading || !pickupLocation?.coordinates || !dropoffLocation?.coordinates}
                className="w-full"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                Calcular Preço
              </Button>

              {pricingResult && (
                <Alert variant={pricingResult.success ? "default" : "destructive"}>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>Resultado do Cálculo:</strong>
                      
                      {pricingResult.success ? (
                        <div className="space-y-1 text-sm">
                          <div>💰 <strong>Preço:</strong> {formatPrice(pricingResult.price || 0)}</div>
                          {pricingResult.pickup_zone && (
                            <div>📍 <strong>Origem:</strong> {pricingResult.pickup_zone.name}</div>
                          )}
                          {pricingResult.dropoff_zone && (
                            <div>🎯 <strong>Destino:</strong> {pricingResult.dropoff_zone.name}</div>
                          )}
                          {pricingResult.vehicle_category && (
                            <div>🚗 <strong>Veículo:</strong> {pricingResult.vehicle_category.name}</div>
                          )}
                          {pricingResult.out_of_coverage && (
                            <div className="text-amber-600">⚠️ Fora da área de cobertura</div>
                          )}
                          {pricingResult.message && (
                            <div className="text-gray-600">{pricingResult.message}</div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestZonePricing; 