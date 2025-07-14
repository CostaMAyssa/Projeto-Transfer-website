# 🔨 Instruções para Build

## 🚨 Problema Atual

O Node.js v24.3.0 não é compatível com macOS 20.6.0:
```
dyld: Symbol not found: __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE4openEPKcj
```

## 🛠️ Soluções para Build

### 1. **Instalar Node.js v18 (Recomendado)**
```bash
# Usando NVM
nvm install 18
nvm use 18

# Ou baixar diretamente
# https://nodejs.org/en/download/releases/
```

### 2. **Fazer o Build com as Mudanças**
```bash
# Limpar build anterior
rm -rf dist

# Fazer novo build
npm run build

# Ou build de desenvolvimento
npm run build:dev
```

### 3. **Testar o Build**
```bash
# Servir o novo build
python3 -m http.server 8080 -d dist

# Ou usar o script
./serve.sh
```

## 🎯 Verificar se as Mudanças foram Aplicadas

### 1. **Verificar no HTML**
```bash
# Procurar pelo novo layout
curl -s "http://localhost:8080" | grep "grid-cols-1 md:grid-cols-2 gap-6 mb-6"
```

### 2. **Verificar no Navegador**
- Acesse: http://localhost:8080
- Inspecione o formulário de busca
- Verifique as classes CSS:
  - Container: `max-w-7xl mx-auto p-8`
  - Linha 1: `grid grid-cols-1 md:grid-cols-2 gap-6 mb-6`
  - Linha 2: `grid grid-cols-1 md:grid-cols-4 gap-4 mb-6`
  - Linha 3: `grid grid-cols-1 md:grid-cols-2 gap-6`

### 3. **Testar Responsividade**
- Redimensione a janela do navegador
- Verifique se o layout se adapta corretamente
- Teste em diferentes dispositivos

## 🔄 Comandos Úteis

### **Desenvolvimento**
```bash
# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### **Backup e Restore**
```bash
# Backup do build atual
cp -r dist dist-backup

# Restore do backup
unzip -o dist.zip
```

### **Servidor Python**
```bash
# Iniciar servidor
python3 -m http.server 8080 -d dist

# Ou usar o script
./serve.sh

# Parar servidor
pkill -f "python3 -m http.server 8080"
```

## 📝 Mudanças Aplicadas

### **Arquivo**: `src/components/BookingWidget.tsx`

#### **Container Principal**
```diff
- max-w-5xl mx-auto p-6 -mt-36 relative z-10
+ max-w-7xl mx-auto p-8 -mt-36 relative z-10
```

#### **Layout Horizontal**
```diff
- <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
+ <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  {/* Pickup e Dropoff mais largos */}
+ </div>
+ <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  {/* Data, Hora, Passageiros, Botão */}
+ </div>
+ <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Bagagem */}
```

#### **Campos Melhorados**
```diff
- size={16} className="text-sm font-medium"
+ size={18} className="text-base font-medium"

- space-y-2 mb-1
+ space-y-3 mb-2

- (altura variável)
+ h-11 (padronizado)
```

## 🎨 Resultado Esperado

### **Layout Final**
1. **Linha 1**: Localizações (Pickup | Dropoff) - 2 colunas largas
2. **Linha 2**: Data | Hora | Passageiros | Botão - 4 colunas
3. **Linha 3**: Bagagem 10kg | Bagagem 23kg - 2 colunas

### **Benefícios**
- ✅ Formulário mais largo e espaçoso
- ✅ Campos de localização em destaque
- ✅ Botão integrado na segunda linha
- ✅ Layout responsivo mantido
- ✅ Altura padronizada nos campos

## 🚀 Próximos Passos

1. **Resolver problema do Node.js**
2. **Fazer build com as mudanças**
3. **Testar no navegador**
4. **Validar responsividade**
5. **Aplicar mudanças similares nos outros formulários (Round-trip, Hourly)** 