# 🔍 AUDITORIA COMPLETA - SISTEMA DE PREÇOS

## ❌ **PROBLEMAS IDENTIFICADOS**

### **1. DISCREPÂNCIA ENTRE DADOS MOCKADOS E TABELA DE TARIFAS**

#### **Preços nos Dados Mockados (`src/data/mockData.ts`):**
```typescript
export const vehicles: VehicleType[] = [
  {
    id: "suv",
    price: 1150,     // ❌ INCORRETO
  },
  {
    id: "sedan", 
    price: 750,      // ❌ INCORRETO
  },
  {
    id: "minivan",
    price: 1300,     // ❌ INCORRETO
  }
];
```

#### **Preços na Tabela de Tarifas (docs/tarifas.md):**
| Veículo | Preço Mínimo | Preço Máximo | Preço Médio |
|---------|---------------|---------------|-------------|
| SEDAN   | $100          | $140          | $130        |
| SUV     | $120          | $170          | $160        |
| VAN     | $110          | $160          | $150        |

#### **Preços na Matrix Zone Pricing (`src/lib/zone-pricing.ts`):**
```typescript
export const ZONE_PRICING_MATRIX = {
  'EWR-*': { SEDAN: 140, SUV: 170, VAN: 160 },
  'JFK-QNS': { SEDAN: 130, SUV: 150, VAN: 140 },
  'JFK-LGA': { SEDAN: 100, SUV: 120, VAN: 110 },
  // ... outros preços corretos
};
```

### **2. TIPOS DE VEÍCULOS INCONSISTENTES**

#### **Dados Mockados:**
- `"sedan"` → `"Sedan"`
- `"suv"` → `"SUV"` 
- `"minivan"` → `"Minivan"`

#### **Zone Pricing Matrix:**
- `"SEDAN"` (maiúsculo)
- `"SUV"` (maiúsculo)
- `"VAN"` (não "MINIVAN")

#### **Tipos Definidos (`src/types/zone-pricing.ts`):**
```typescript
export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: 'sedan',
    name: 'Sedan',
    base_price: 75000, // ❌ $750 em centavos - INCORRETO
  },
  {
    id: 'suv', 
    name: 'SUV',
    base_price: 115000, // ❌ $1150 em centavos - INCORRETO
  },
  {
    id: 'minivan',
    name: 'Minivan', // ❌ Deveria ser "VAN"
    base_price: 130000, // ❌ $1300 em centavos - INCORRETO
  }
];
```

### **3. SISTEMA HÍBRIDO CONFUSO**

O sistema atual usa **DOIS sistemas de preços diferentes**:

1. **Sistema Antigo (mockData.ts):**
   - Preços fixos muito altos ($750, $1150, $1300)
   - Usado no `BookingContext.calculateTotal()`
   - Exibido em `VehicleCard.tsx`

2. **Sistema Novo (zone-pricing.ts):**
   - Preços corretos baseados na tabela ($100-$170)
   - Usado em `ZonePricingVehicleCard.tsx`
   - Função `calculateZonePricing()`

---

## ✅ **CORREÇÕES NECESSÁRIAS**

### **1. Corrigir Dados Mockados**

```typescript
// src/data/mockData.ts - CORREÇÃO
export const vehicles: VehicleType[] = [
  {
    id: "sedan",
    name: "Sedan", 
    category: "SEDAN", // ← Padronizar maiúsculo
    price: 130, // ← Preço médio da tabela
    // ... resto igual
  },
  {
    id: "suv",
    name: "SUV",
    category: "SUV",
    price: 160, // ← Preço médio da tabela
    // ... resto igual
  },
  {
    id: "van", // ← Mudar de "minivan" para "van"
    name: "Van",
    category: "VAN", // ← Padronizar
    price: 150, // ← Preço médio da tabela
    // ... resto igual
  }
];
```

### **2. Corrigir Tipos de Veículos**

```typescript
// src/types/zone-pricing.ts - CORREÇÃO
export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: 'sedan',
    name: 'Sedan',
    base_price: 130, // ← Corrigir para valor em dólares
  },
  {
    id: 'suv',
    name: 'SUV', 
    base_price: 160,
  },
  {
    id: 'van', // ← Mudar de 'minivan'
    name: 'Van',
    base_price: 150,
  }
];
```

### **3. Unificar Sistema de Preços**

#### **Opção A: Usar apenas Zone Pricing**
- Remover preços fixos dos dados mockados
- Calcular sempre baseado em origem/destino
- Fallback para preço médio quando zona não detectada

#### **Opção B: Sistema Híbrido Inteligente**
- Preços mockados = preços médios da tabela
- Zone pricing sobrescreve quando origem/destino detectados
- Exibir sempre o preço mais preciso disponível

---

## 📊 **COMPARAÇÃO DETALHADA**

### **Preços Atuais vs Corretos:**

| Veículo | Atual (Mock) | Deveria Ser | Diferença |
|---------|--------------|-------------|-----------|
| Sedan   | $750         | $130        | -$620     |
| SUV     | $1,150       | $160        | -$990     |
| Van     | $1,300       | $150        | -$1,150   |

### **Impacto no Cliente:**
- **Preços 5-8x maiores** que o esperado
- **Perda de competitividade** no mercado
- **Confusão** entre diferentes telas do sistema

---

## 🎯 **PLANO DE CORREÇÃO**

### **Fase 1: Correções Urgentes**
1. ✅ Corrigir preços em `mockData.ts`
2. ✅ Padronizar categorias de veículos
3. ✅ Unificar sistema de preços

### **Fase 2: Integração**
1. ✅ Integrar zone pricing no BookingWidget
2. ✅ Atualizar cálculos no BookingContext
3. ✅ Testar fluxo completo

### **Fase 3: Validação**
1. ✅ Comparar com tabela de tarifas
2. ✅ Testar todas as rotas
3. ✅ Verificar edge cases

---

## 🔧 **IMPLEMENTAÇÃO RECOMENDADA**

### **Sistema Unificado:**
```typescript
// Usar zone pricing como fonte principal
const calculateVehiclePrice = async (
  origin: [number, number],
  destination: [number, number], 
  vehicleCategory: string
) => {
  // 1. Tentar zone pricing específico
  const zonePricing = await calculateZonePricing({
    pickup_location: { coordinates: origin },
    dropoff_location: { coordinates: destination },
    vehicle_category: vehicleCategory
  });
  
  if (zonePricing.success && zonePricing.price) {
    return zonePricing.price;
  }
  
  // 2. Fallback para preço médio da categoria
  const category = getVehicleCategory(vehicleCategory);
  return category?.base_price || 130;
};
```

---

## ⚠️ **RISCOS IDENTIFICADOS**

1. **Preços Incorretos:** Sistema atual pode afastar clientes
2. **Inconsistência:** Diferentes preços em diferentes telas
3. **Manutenção:** Dois sistemas paralelos são difíceis de manter
4. **Confiabilidade:** Clientes podem perder confiança no sistema

---

## 📋 **CHECKLIST DE VALIDAÇÃO**

- [ ] Preços mockados corrigidos
- [ ] Categorias padronizadas
- [ ] Zone pricing integrado
- [ ] BookingContext atualizado
- [ ] Testes de todas as rotas
- [ ] Validação com tabela oficial
- [ ] Sistema unificado funcionando 