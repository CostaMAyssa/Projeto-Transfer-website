# 🧪 Teste Rápido do Pagamento (Sem Configurar Stripe)

## ✅ **Como Testar Agora:**

### **1. Use EXATAMENTE este cartão de teste:**
- **Número**: `4242424242424242` (sem espaços)
- **Nome**: Qualquer nome
- **Mês**: `12`
- **Ano**: `2025`
- **CVV**: `123`

### **2. Preencha os dados obrigatórios:**
- **Nome**: Seu nome
- **Sobrenome**: Seu sobrenome  
- **Endereço**: Qualquer endereço
- **País**: `US`
- **Cidade**: Qualquer cidade
- **CEP**: Qualquer CEP

### **3. O que vai acontecer:**
- ✅ Se usar o cartão correto: **Simulação de pagamento bem-sucedido**
- ❌ Se usar outro cartão: **Erro pedindo cartão de teste**

## 🔍 **Logs que você verá no console:**
```
💳 Iniciando processamento de pagamento...
💰 Total calculado: 150
📋 Enviando dados para Stripe: {...}
⚠️ Edge Function não disponível, simulando pagamento para desenvolvimento...
🧪 Simulação de pagamento bem-sucedida
```

## 🎯 **Resultado Esperado:**
- Toast verde: "💳 Pagamento Simulado com Sucesso!"
- Redirecionamento para página de confirmação
- Reserva salva no contexto

## 🚀 **Para Configurar Stripe Real (Depois):**

### **1. Instalar Docker:**
```bash
# No macOS (se não tiver Homebrew)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Docker
brew install --cask docker

# Abrir Docker Desktop
open /Applications/Docker.app
```

### **2. Configurar Supabase Local:**
```bash
# Iniciar Supabase local
supabase start

# Configurar chave do Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_sua_chave_aqui

# Deploy da função
supabase functions deploy process-payment
```

### **3. Obter Chaves do Stripe:**
1. Criar conta em [stripe.com](https://stripe.com)
2. Ir para **Developers > API Keys**
3. Copiar **Secret Key** (sk_test_...)

## ⚠️ **Problemas Comuns:**

### **"Cartão de Teste Necessário"**
- ✅ Use exatamente: `4242424242424242`

### **"Erro no Pagamento"**
- ✅ Verifique se preencheu todos os campos obrigatórios
- ✅ Aceite os termos e condições

### **Edge Function não funciona**
- ✅ Normal! A simulação vai funcionar
- ✅ Para Stripe real, configure Docker + Supabase

## 🎉 **Teste Agora:**

1. Acesse `localhost:8080`
2. Preencha origem e destino
3. Selecione um veículo  
4. Vá para pagamento
5. Use cartão: `4242424242424242`
6. Preencha dados e clique "Book Now"
7. Veja a simulação funcionar! 🚀 