Perfeito! Agora tenho todas as informações necessárias. Vou criar o plano de implementação completo.


[1 tool called]

# Plano de Implementação: Sistema de Validação Inteligente de Agendamento

## Resumo das Especificações
- ✅ **Escopo**: Todos os tipos de booking (one-way, round-trip, hourly)
- ✅ **Tempo mínimo**: 1.5h antes do voo para drop-off, 30min após pouso para pickup
- ✅ **Comportamento**: Sugerir automaticamente data/hora correta
- ✅ **Voo não encontrado**: Mostrar mensagem "não encontrado"
- ✅ **Interface**: Mensagem abaixo dos campos de voo
- ✅ **Integração**: Validação em tempo real + dados salvos no contexto

## Plano Detalhado de Implementação

### **Fase 1: Estrutura de Dados e Tipos**

**1.1 Atualizar tipos de booking**
- Adicionar campos de voo em `BookingFormData` para one-way e round-trip
- Criar interface `FlightInfo` para dados retornados pela API
- Adicionar campos de validação no contexto

**1.2 Criar hook de validação de voo**
- `useFlightValidation` para gerenciar estado da validação
- Função para chamar API de voos
- Lógica de comparação de horários

### **Fase 2: Integração com API de Voo**

**2.1 Criar serviço de validação**
- Função para chamar `flight-data` Edge Function
- Tratamento de erros (voo não encontrado)
- Transformação de dados para validação

**2.2 Implementar lógica de validação**
- Comparar data/hora do formulário vs dados do voo
- Calcular horário sugerido baseado no tipo (pickup/drop-off)
- Detectar se é aeroporto baseado no endereço

### **Fase 3: Interface do Usuário**

**3.1 Atualizar BookingWidget**
- Adicionar campos de voo para one-way e round-trip
- Implementar validação em tempo real
- Mostrar mensagens de validação abaixo dos campos

**3.2 Atualizar páginas de booking**
- Adicionar campos de voo nas páginas existentes
- Integrar validação com formulários
- Mostrar informações do voo encontrado

### **Fase 4: Contexto e Estado**

**4.1 Atualizar BookingContext**
- Adicionar campos de voo no estado
- Implementar funções de atualização
- Salvar dados do voo para uso posterior

**4.2 Integrar validação**
- Conectar validação com contexto
- Atualizar dados automaticamente quando válidos
- Manter sincronização entre campos

### **Fase 5: Regras de Negócio**

**5.1 Implementar regras de tempo**
- Drop-off: 1.5h antes do voo
- Pickup: 30min após pouso
- Detectar tipo baseado no endereço

**5.2 Sugestões automáticas**
- Calcular horário ideal baseado no voo
- Atualizar campos automaticamente
- Mostrar justificativa da sugestão

### **Fase 6: Tratamento de Erros**

**6.1 Voo não encontrado**
- Mostrar mensagem clara
- Permitir continuar sem validação
- Opção de tentar novamente

**6.2 Erros de API**
- Fallback para validação manual
- Logs detalhados para debug
- Mensagens amigáveis ao usuário

## Estrutura de Arquivos a Serem Criados/Modificados

### **Novos Arquivos:**
- `src/hooks/useFlightValidation.ts`
- `src/services/flightValidationService.ts`
- `src/components/FlightValidationMessage.tsx`
- `src/utils/flightValidationUtils.ts`

### **Arquivos a Modificar:**
- `src/types/booking.ts` - Adicionar campos de voo
- `src/contexts/BookingContext.tsx` - Integrar validação
- `src/components/BookingWidget.tsx` - Adicionar campos e validação
- `src/pages/booking/` - Atualizar páginas de booking
- `src/components/RideSummary.tsx` - Mostrar dados do voo

## Cronograma de Implementação

**Semana 1:**
- Fase 1: Estrutura de dados e tipos
- Fase 2: Integração com API

**Semana 2:**
- Fase 3: Interface do usuário
- Fase 4: Contexto e estado

**Semana 3:**
- Fase 5: Regras de negócio
- Fase 6: Tratamento de erros
- Testes e refinamentos

## Considerações Técnicas

### **Performance:**
- Debounce na validação em tempo real (500ms)
- Cache de resultados de voo para evitar chamadas desnecessárias
- Validação assíncrona sem bloquear UI

### **UX/UI:**
- Loading states durante validação
- Mensagens claras e acionáveis
- Sugestões visuais destacadas
- Fallback gracioso para erros

### **Manutenibilidade:**
- Código modular e testável
- Configuração centralizada de regras
- Logs detalhados para debug
- Documentação clara

---

**Posso prosseguir com a implementação deste plano?** 

O plano está estruturado para ser implementado de forma incremental, permitindo testar cada fase antes de prosseguir. Cada fase tem entregas claras e pode ser validada independentemente.