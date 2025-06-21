## 📑 "Mapa-Guia" do projeto AZ Transfer

### 1. Visão de alto nível

```mermaid
graph LR
  subgraph Front-end (React + Vite)
    A(Home /) -->|props ctx| B(BookingWidget)
    B --> C(/booking):::page
    C --> C1(Vehicle) --> C2(Extras) --> C3(Passenger) --> C4(Payment) --> C5(Confirm)
  end

  subgraph Back-end (Supabase REST)
    D(Zones & Pricing) --> E(Quote API)
    F(Bookings)        --> G(Payments Webhook)
  end

  B -- GET quote --> E
  C4 -- POST pay --> Stripe
  Stripe -- webhook --> G
  G -- status update --> F --> FE
```

* **Front-end:** React + Tailwind; roteamento em `App.tsx`.
* **State global:** `BookingContext` guarda todas as escolhas do usuário.
* **Back-end:** Supabase/PostgreSQL com tabelas `zones`, `zone_routes`, `route_base_fares`, `bookings`.

---

### 2. Estrutura de pastas (essencial)

```
src/
├─ api/                  # chamadas fetch isoladas
│   ├─ quote.ts          # GET /pricing
│   └─ bookings.ts       # POST draft, PATCH update, etc.
├─ components/
│   ├─ BookingWidget.tsx # formulário do hero
│   ├─ Steps/
│   │   ├─ VehicleStep.tsx
│   │   ├─ ExtrasStep.tsx
│   │   ├─ PassengerStep.tsx
│   │   ├─ PaymentStep.tsx
│   │   └─ ConfirmStep.tsx
│   └─ ... (Navbar, Footer)
├─ contexts/
│   └─ BookingContext.tsx
├─ pages/
│   ├─ Index.tsx
│   ├─ booking/
│   │   ├─ BookingLayout.tsx  # wrapper com Stepper
│   │   └─ index.tsx          # redireciona para /booking/vehicle
│   ├─ contact.tsx
│   └─ (services, fleet, about)  <-- TODO
└─ utils/
    └─ zoneDetect.ts        # lat,lng → zoneId
```

---

### 3. Fluxo de dados passo a passo

| Etapa UI      | Arquivo / Hook      | Chamada                                          | Retorno / Ação                                                                 |
| ------------- | ------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Form Hero** | `BookingWidget.tsx` | `quote.get(origin, dest)`                        | `{ vehiclePrices: […] }` salva em `BookingContext` e `router.push('/booking')` |
| **Vehicle**   | `VehicleStep.tsx`   | –                                                | seleciona `context.vehicle`                                                    |
| **Extras**    | `ExtrasStep.tsx`    | –                                                | atualiza `context.extras`                                                      |
| **Passenger** | `PassengerStep.tsx` | `bookings.draft(context)` (POST)                 | recebe `bookingId`, guarda                                                     |
| **Payment**   | `PaymentStep.tsx`   | `bookings.pay(bookingId)` (PATCH → clientSecret) | Stripe Elements, confirma                                                      |
| **Confirm**   | `ConfirmStep.tsx`   | payload do webhook (Supabase `realtime`)         | status = CONFIRMED e receipt                                                   |

---

## 🔧 VISÃO DE BAIXO NÍVEL - FEATURES DETALHADAS

### 4. Feature: Sistema de Reservas (BookingWidget)

#### 4.1 Arquivo Principal: `src/components/BookingWidget.tsx`

```typescript
// Estados gerenciados por tipo de reserva
interface BookingStates {
  // One-way
  pickupAddress: string
  dropoffAddress: string
  pickupCoordinates: [number, number] | undefined
  dropoffCoordinates: [number, number] | undefined
  date: Date
  time: string
  passengers: number
  luggage: { small: number, large: number }

  // Round-trip (adiciona campos de retorno)
  returnDate: Date
  returnTime: string
  durationDays: number

  // Hourly (campos específicos)
  durationHours: number
  orderType: "airport-dropoff" | "pickup"
  departureAirport: string
  airline: string
  flightNumber: string
  noFlightInfo: boolean
}
```

#### 4.2 Integração com Google Maps
```typescript
// AddressAutocomplete.tsx - Componente de autocomplete
interface GoogleMapsIntegration {
  // Carregamento dinâmico da API
  loadGoogleMapsAPI(): void
  
  // Serviços utilizados
  AutocompleteService: GoogleAutocompleteService
  PlacesService: GooglePlacesService
  
  // Filtros geográficos
  componentRestrictions: { country: 'us' }
  types: ['geocode', 'establishment']
  
  // Filtros regionais (NY, NJ, CT, PA)
  filterByRegion(predictions: GooglePrediction[]): GooglePrediction[]
}
```

#### 4.3 Validações e Submissão
```typescript
// Validações por tipo de reserva
const validateBooking = (type: BookingType, data: BookingStates) => {
  switch(type) {
    case 'one-way':
      return validateOneWay(data)
    case 'round-trip':
      return validateRoundTrip(data)
    case 'hourly':
      return validateHourly(data)
  }
}

// Submissão unificada
const handleSubmit = (e: FormEvent) => {
  // 1. Validar dados
  // 2. Atualizar BookingContext
  // 3. Navegar para /booking
}
```

---

### 5. Feature: Sistema de Contexto Global (BookingContext)

#### 5.1 Arquivo: `src/contexts/BookingContext.tsx`

```typescript
// Estado global da aplicação
interface BookingFormData {
  // Dados básicos
  bookingType: 'one-way' | 'round-trip' | 'hourly' | 'city-tour'
  pickupLocation: { address: string; coordinates?: [number, number] }
  dropoffLocation: { address: string; coordinates?: [number, number] }
  pickupDate: Date
  pickupTime: string
  passengers: number
  luggage: { small: number; large: number }

  // Seleções do usuário
  vehicle?: VehicleType
  extras: ExtraType[]

  // Dados do passageiro
  passengerDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }

  // Dados de pagamento
  paymentDetails: {
    firstName: string
    lastName: string
    address: string
    country: string
    city: string
    postal: string
    termsAccepted: boolean
    newsletterSubscription: boolean
  }
}
```

#### 5.2 Gerenciamento de Estado
```typescript
// Ações disponíveis no contexto
interface BookingContextActions {
  // Navegação entre etapas
  currentStep: number
  nextStep(): void
  prevStep(): void
  goToStep(step: number): void

  // Atualização de dados
  setBookingType(type: BookingType): void
  setPickupLocation(location: LocationData): void
  setDropoffLocation(location: LocationData): void
  selectVehicle(vehicle: VehicleType): void
  addExtra(extra: ExtraType): void
  updateExtraQuantity(extraId: string, quantity: number): void

  // Cálculos
  calculateTotal(): { vehiclePrice: number; extrasPrice: number; total: number }

  // Finalização
  completeBooking(): void
  populateDemoData(): void  // Para testes
}
```

---

### 6. Feature: Sistema de Preços por Zona (Zone Pricing)

#### 6.1 Estrutura do Banco de Dados
```sql
-- Tabela de zonas geográficas
CREATE TABLE zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('airport_circular', 'borough_polygon')),
  coordinates JSONB NOT NULL,  -- GeoJSON
  is_active BOOLEAN DEFAULT true
);

-- Categorias de veículos
CREATE TABLE vehicle_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL
);

-- Preços por rota
CREATE TABLE zone_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_zone_id TEXT REFERENCES zones(id),
  destination_zone_id TEXT REFERENCES zones(id),
  vehicle_category_id TEXT REFERENCES vehicle_categories(id),
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true
);
```

#### 6.2 Detecção de Zona por Coordenadas
```typescript
// src/lib/zone-pricing.ts
interface ZoneDetection {
  // Detecção por tipo de zona
  detectAirportZone(coords: [number, number]): string | null
  detectBoroughZone(coords: [number, number]): string | null
  
  // Função principal
  detectZone(coordinates: [number, number]): string | null {
    // 1. Tentar aeroportos (círculos)
    const airportZone = detectAirportZone(coordinates)
    if (airportZone) return airportZone
    
    // 2. Tentar boroughs (polígonos)
    const boroughZone = detectBoroughZone(coordinates)
    return boroughZone
  }
}

// Matriz de preços predefinida
const ZONE_PRICING_MATRIX: Record<string, number> = {
  'EWR-*': { SEDAN: 140, SUV: 170, VAN: 160 },
  'JFK-QNS': { SEDAN: 130, SUV: 150, VAN: 140 },
  'JFK-LGA': { SEDAN: 100, SUV: 120, VAN: 110 },
  // ... 21 rotas total
}
```

#### 6.3 Cálculo de Preços
```typescript
// Função principal de cálculo
const calculateZonePricing = (
  originCoords: [number, number],
  destCoords: [number, number],
  vehicleCategory: 'SEDAN' | 'SUV' | 'VAN'
): ZonePricingResult => {
  // 1. Detectar zonas
  const originZone = detectZone(originCoords)
  const destZone = detectZone(destCoords)
  
  // 2. Buscar preço na matriz
  const routeKey = `${originZone}-${destZone}`
  const price = getZonePrice(routeKey, vehicleCategory)
  
  // 3. Fallback para preço base se não encontrar
  return {
    originZone,
    destZone,
    price: price || getBasePrice(vehicleCategory),
    method: price ? 'zone_pricing' : 'base_pricing'
  }
}
```

---

### 7. Feature: Fluxo de Reserva Multi-Etapas

#### 7.1 Layout Principal: `src/pages/booking/BookingLayout.tsx`
```typescript
// Gerenciamento das 5 etapas
const BookingLayout = () => {
  const { currentStep, goToStep, bookingComplete } = useBooking()

  const steps = [
    { component: <VehicleSelection /> },      // Etapa 0
    { component: <ExtrasSelection /> },       // Etapa 1
    { component: <PassengerDetails /> },      // Etapa 2
    { component: <Payment /> },               // Etapa 3
    { component: <Confirmation /> }           // Etapa 4
  ]

  // Renderização condicional baseada no estado
  if (bookingComplete) {
    return <Confirmation />
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pt-20">
        {currentStep < 4 && (
          <BookingStepIndicator 
            currentStep={currentStep} 
            onStepClick={handleStepClick}
          />
        )}
        {steps[currentStep]?.component}
      </div>
    </>
  )
}
```

#### 7.2 Etapa 1: Seleção de Veículo
```typescript
// src/pages/booking/VehicleSelection.tsx
interface VehicleSelectionLogic {
  // Dados do contexto
  bookingData: BookingFormData
  
  // Cálculo de preços baseado em zone pricing
  calculateVehiclePrices(): VehiclePrice[] {
    const { pickupLocation, dropoffLocation } = bookingData
    
    return vehicles.map(vehicle => ({
      ...vehicle,
      price: calculateZonePricing(
        pickupLocation.coordinates,
        dropoffLocation.coordinates,
        vehicle.category
      ).price
    }))
  }
  
  // Seleção e navegação
  handleVehicleSelect(vehicle: VehicleType): void {
    selectVehicle(vehicle)
    nextStep()
  }
}
```

#### 7.3 Etapa 2: Seleção de Extras
```typescript
// src/pages/booking/ExtrasSelection.tsx
interface ExtrasManagement {
  // Extras disponíveis
  availableExtras: ExtraType[] = [
    { id: 'child-seat', name: 'Child Seat', price: 15 },
    { id: 'wifi', name: 'WiFi', price: 10 },
    { id: 'water', name: 'Water Bottles', price: 5 }
  ]
  
  // Gerenciamento de quantidades
  updateQuantity(extraId: string, quantity: number): void {
    updateExtraQuantity(extraId, quantity)
  }
  
  // Cálculo de total em tempo real
  calculateExtrasTotal(): number {
    return bookingData.extras.reduce(
      (sum, extra) => sum + (extra.price * extra.quantity), 0
    )
  }
}
```

#### 7.4 Etapa 3: Detalhes do Passageiro
```typescript
// src/pages/booking/PassengerDetails.tsx
interface PassengerDetailsForm {
  // Validação de formulário
  validateForm(data: PassengerDetails): ValidationResult {
    const errors: string[] = []
    
    if (!data.firstName) errors.push('First name is required')
    if (!data.email || !isValidEmail(data.email)) errors.push('Valid email is required')
    if (!data.phone) errors.push('Phone number is required')
    
    return { isValid: errors.length === 0, errors }
  }
  
  // Submissão e criação de draft
  handleSubmit(data: PassengerDetails): void {
    if (validateForm(data).isValid) {
      setPassengerDetails(data)
      // TODO: Criar booking draft no backend
      nextStep()
    }
  }
}
```

#### 7.5 Etapa 4: Pagamento
```typescript
// src/pages/booking/Payment.tsx (placeholder atual)
interface PaymentIntegration {
  // TODO: Integração com Stripe
  initializeStripe(): void
  createPaymentIntent(amount: number): Promise<ClientSecret>
  confirmPayment(clientSecret: string): Promise<PaymentResult>
  
  // Dados de billing
  billingDetails: {
    name: string
    address: AddressDetails
    email: string
  }
}
```

#### 7.6 Etapa 5: Confirmação
```typescript
// src/pages/booking/Confirmation.tsx
interface BookingConfirmation {
  // Dados da reserva finalizada
  reservationId: string
  bookingDetails: BookingFormData
  totalPaid: number
  
  // Ações pós-confirmação
  sendConfirmationEmail(): void
  generateReceipt(): void
  resetBookingFlow(): void
}
```

---

### 8. Feature: Sistema de Navegação e Roteamento

#### 8.1 Configuração de Rotas: `src/App.tsx`
```typescript
// Estrutura de rotas da aplicação
const AppRoutes = () => (
  <Routes>
    {/* Rotas principais */}
    <Route path="/" element={<Index />} />
    <Route path="/booking" element={<BookingLayout />} />
    <Route path="/contact" element={<Contact />} />
    
    {/* Rotas específicas */}
    <Route path="/city-tours/:tourId" element={<CityTourDetails />} />
    <Route path="/azbooking" element={<AzBooking />} />
    
    {/* Rotas placeholder (TODO) */}
    <Route path="/partners" element={<PlaceholderPage />} />
    <Route path="/blog" element={<PlaceholderPage />} />
    
    {/* Rotas de desenvolvimento (remover em produção) */}
    <Route path="/test-autocomplete" element={<TestAutocomplete />} />
    <Route path="/test-zone-pricing" element={<TestZonePricing />} />
    <Route path="/initialize-zone-pricing" element={<InitializeZonePricing />} />
    
    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
)
```

#### 8.2 Navbar com Navegação Inteligente
```typescript
// src/components/Navbar.tsx
interface NavbarBehavior {
  // Comportamento baseado na página
  isHomePage: boolean
  scrolled: boolean
  
  // Classes dinâmicas
  navbarClasses: string = isHomePage 
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#111111]' : 'bg-transparent'
      }`
    : 'fixed top-0 left-0 right-0 z-50 bg-[#111111]'
  
  // Links de navegação
  navigationLinks: NavLink[] = [
    { path: '/', label: 'nav.home' },
    { path: '/services', label: 'nav.services' },  // TODO: implementar
    { path: '/fleet', label: 'nav.fleet' },        // TODO: implementar
    { path: '/partners', label: 'nav.partners' },  // Placeholder
    { path: '/blog', label: 'nav.blog' },          // Placeholder
    { path: '/about', label: 'nav.about' },        // TODO: implementar
    { path: '/contact', label: 'nav.contact' }     // ✅ Implementado
  ]
}
```

---

### 9. Feature: Internacionalização (i18n)

#### 9.1 Configuração: `src/i18n/index.ts`
```typescript
// Configuração do react-i18next
const i18nConfig = {
  resources: {
    en: { translation: enTranslations },
    pt: { translation: ptTranslations },
    es: { translation: esTranslations }
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
}

// Uso nos componentes
const { t } = useTranslation()
// t('nav.home') -> "Home" | "Início" | "Inicio"
```

#### 9.2 Seletor de Idioma
```typescript
// src/components/LanguageSelector.tsx
interface LanguageSelectorVariants {
  desktop: {
    trigger: 'flag + text'
    dropdown: 'full list'
  }
  mobile: {
    trigger: 'flag only'
    dropdown: 'compact list'
  }
}
```

---

### 10. Feature: Sistema de Notificações

#### 10.1 Toast Notifications
```typescript
// Usando shadcn/ui toast system
import { useToast } from "@/hooks/use-toast"

interface ToastUsage {
  // Sucesso
  toast({
    title: "Vehicle selected",
    description: `You've selected the ${vehicle.name}`,
  })
  
  // Erro
  toast({
    title: "Error",
    description: "Please fill in all required fields",
    variant: "destructive"
  })
  
  // Booking completo
  toast({
    title: "Booking complete!",
    description: `Your reservation ID is ${generatedId}`,
  })
}
```

---

### 11. Pontos críticos & TODO

| Área                      | O que falta / Ajustar                                  | Onde                    | Prioridade |
| ------------------------- | ------------------------------------------------------ | ----------------------- | ---------- |
| **Remover Moovs externo** | Desativar `<Navbar> Book Now` link                     | `components/Navbar.tsx` | 🔴         |
| **Detectar zona**         | Função `zoneDetect.ts` chamando PostgREST `ST_DWithin` | `api/quote.ts`          | 🔴         |
| **Quote API**             | Endpoint `/pricing?origin&dest&vehicle`                | Supabase Edge Function  | 🔴         |
| **Breadcrumb / Stepper**  | Mostrar etapas e progresso                             | `BookingLayout.tsx`     | 🟠         |
| **Stripe webhook**        | Edge Function `stripeWebhook.ts` atualiza `bookings`   | `supabase/functions/`   | 🟠         |
| **Pages vazias**          | Criar `/services`, `/fleet`, `/about` ou remover links | `pages/`                | 🟡         |
| **Cleanup dev routes**    | Comentar `/test-*` e `/initialize-zone-pricing`        | `App.tsx`               | 🟡         |

---

### 12. Roadmap de implementação

| Semana | Entregas-chave                                                                            |
| ------ | ----------------------------------------------------------------------------------------- |
| **1**  | • Quote API funcional<br>• zoneDetect implementado<br>• Navbar sem link externo           |
| **2**  | • Fluxo Stripe completo (Payment Step + Webhook)<br>• Recebimento de status em tempo real |
| **3**  | • Breadcrumb + validações UX mobile<br>• Páginas informativas faltantes                   |
| **4**  | • Limpeza de rotas dev<br>• Deploy preview + testes de conversão GA4                      |

---

### 13. Guia rápido para novos devs ("cursor")

1. **`pnpm dev`** – roda front local em `localhost:8080`.
2. **Arquivo de entrada:** `src/App.tsx` (veja rotas).
3. **Contexto global:** antes de mexer em steps, leia `BookingContext.tsx`.
4. **API mocks:** tudo em `src/api/`; trocar baseURL em `.env.local`.
5. **DB & migrations:** `supabase/migrations`; rodar `supabase db push`.
6. **Testar preço:** `http://localhost:54321/rest/v1/rpc/get_pricing?origin=BKN&dest=EWR&vehicle=SEDAN`.
7. **Deploy:** Vercel (front) + Supabase (back). Variáveis em Dashboard.

---

### 14. Artefatos anexos (pedir se precisar)

| Arquivo            | Conteúdo                            |
| ------------------ | ----------------------------------- |
| `openapi.yaml`     | Documentação dos endpoints internos |
| `seed-zones.sql`   | 7 zonas + 21 rotas + 63 tarifas     |
| `stripeWebhook.ts` | Edge Function pronta (Supabase)     |
| `n8n-flow.json`    | Script que popula o banco via REST  |

