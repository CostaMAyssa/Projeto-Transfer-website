# Build e Deploy - Transfer Website

## 📋 Visão Geral

Este documento descreve como fazer o build e deploy do projeto Transfer Website, incluindo configurações de ambiente, comandos de build e processos de deploy.

## 🔧 Pré-requisitos

### Ambiente de Desenvolvimento
- **Node.js**: versão 18+ 
- **npm** ou **yarn**: gerenciador de pacotes
- **Git**: controle de versão

### Ambiente de Produção
- **Docker**: versão 20+
- **Docker Compose**: versão 2+
- **Nginx**: (configurado via Docker)
- **Servidor Linux**: Ubuntu/Debian recomendado

## 📦 Estrutura do Projeto

```
Projeto-Transfer-website/
├── src/                    # Código fonte React/TypeScript
├── public/                 # Arquivos estáticos
├── dist/                   # Build de produção (gerado)
├── docs/                   # Documentação
├── supabase/              # Configurações Supabase
├── package.json           # Dependências e scripts
├── vite.config.ts         # Configuração Vite
├── Dockerfile             # Imagem Docker
├── docker-compose.yml     # Orquestração containers
├── nginx.conf             # Configuração Nginx
├── deploy.sh              # Script automatizado de deploy
└── .env                   # Variáveis de ambiente
```

## 🛠️ Scripts Disponíveis

### Scripts NPM (package.json)

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (porta 8080)

# Build
npm run build           # Build para produção
npm run build:dev       # Build para desenvolvimento

# Qualidade de código
npm run lint            # Executa ESLint
npm run preview         # Preview do build localmente
```

## 🔐 Configuração de Ambiente

### 1. Variáveis de Ambiente (.env)

```bash
# Configurações da aplicação
VITE_APP_NAME=Transfer Website
VITE_APP_URL=https://seu-dominio.com

# Supabase Database
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui

# Google Maps/Places API
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=sua_chave_mapbox_aqui

# Stripe (pagamentos)
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_stripe_aqui

# API Base URL
VITE_API_BASE_URL=https://api.seu-dominio.com
```

### 2. Criação do Arquivo .env

```bash
# Copiar exemplo
cp env.example .env

# Editar variáveis
nano .env
```

## 🏗️ Processo de Build

### Build Local para Desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Verificar configurações
npm run lint

# 3. Build de desenvolvimento
npm run build:dev

# 4. Preview local
npm run preview
```

### Build para Produção

```bash
# 1. Limpar cache e node_modules (se necessário)
rm -rf node_modules package-lock.json
npm install

# 2. Build otimizado para produção
npm run build

# 3. Verificar saída em dist/
ls -la dist/
```

### Características do Build

- **Bundler**: Vite
- **Code Splitting**: Automático por dependências
- **Minificação**: CSS e JavaScript
- **Otimização**: Tree shaking e compressão
- **Saída**: Pasta `dist/`

## 🚀 Deploy

### Método 1: Deploy Automatizado (Recomendado)

```bash
# 1. Tornar script executável
chmod +x deploy.sh

# 2. Deploy normal
./deploy.sh

# 3. Deploy com limpeza de cache
./deploy.sh --clean
```

### Método 2: Deploy Manual via Docker

```bash
# 1. Parar containers existentes
docker-compose down

# 2. Build da imagem
docker-compose build --no-cache

# 3. Subir containers
docker-compose up -d

# 4. Verificar status
docker-compose ps
```

### Método 3: Deploy Direto (sem Docker)

```bash
# 1. Build da aplicação
npm run build

# 2. Servir com nginx ou servidor web
# Copiar dist/ para /var/www/html/ ou pasta do servidor
sudo cp -r dist/* /var/www/html/

# 3. Configurar nginx
sudo systemctl reload nginx
```

## 🐳 Configuração Docker

### Dockerfile
```dockerfile
# Multi-stage build para otimização
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  transfer-website:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 📊 Monitoramento e Verificação

### Health Check
```bash
# Verificar se aplicação está funcionando
curl http://localhost/health

# Ou abrir no navegador
open http://localhost
```

### Logs
```bash
# Logs em tempo real
docker-compose logs -f transfer-website

# Logs das últimas 50 linhas
docker-compose logs --tail=50 transfer-website
```

### Status dos Containers
```bash
# Status geral
docker-compose ps

# Uso de recursos
docker stats transfer-website
```

## 🔄 Comandos de Atualização

### Atualização Completa

```bash
# 1. Fazer backup (se necessário)
docker-compose down
docker commit transfer-website backup-$(date +%Y%m%d)

# 2. Puxar código atualizado
git pull origin main

# 3. Verificar mudanças no .env
diff .env env.example

# 4. Rebuild e redeploy
./deploy.sh --clean

# 5. Verificar funcionamento
curl http://localhost/health
```

### Atualização Rápida (Hot Deploy)

```bash
# 1. Pull do código
git pull origin main

# 2. Build apenas se houve mudanças no código
npm run build

# 3. Restart apenas do container
docker-compose restart transfer-website
```

### Rollback (em caso de problemas)

```bash
# 1. Voltar para commit anterior
git log --oneline -5
git checkout HASH_DO_COMMIT_ANTERIOR

# 2. Redeploy
./deploy.sh

# 3. Ou restaurar backup
docker stop transfer-website
docker run -d --name transfer-website backup-YYYYMMDD
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de build**:
   ```bash
   # Limpar cache
   rm -rf node_modules package-lock.json dist/
   npm install
   npm run build
   ```

2. **Container não sobe**:
   ```bash
   # Verificar logs
   docker-compose logs transfer-website
   
   # Verificar portas
   netstat -tulpn | grep :80
   ```

3. **Variáveis de ambiente não carregam**:
   ```bash
   # Verificar arquivo .env
   cat .env
   
   # Rebuild com --no-cache
   docker-compose build --no-cache
   ```

4. **Performance lenta**:
   ```bash
   # Verificar recursos
   docker stats
   
   # Otimizar build
   npm run build
   ```

## 📈 Otimizações de Produção

### Build Otimizado
- Code splitting automático
- Tree shaking
- Minificação de assets
- Compressão gzip (via nginx)
- Cache de assets estáticos

### Performance
- Lazy loading de componentes
- Otimização de imagens
- CDN para assets estáticos
- Service worker (se configurado)

### Segurança
- Headers de segurança (nginx)
- HTTPS obrigatório
- Variáveis de ambiente protegidas
- Sanitização de inputs

## 📝 Checklist de Deploy

### Pré-deploy
- [ ] Código testado localmente
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Backup realizado (se produção)

### Deploy
- [ ] Git pull executado
- [ ] Build realizado com sucesso
- [ ] Containers subindo corretamente
- [ ] Health check passando

### Pós-deploy
- [ ] Aplicação acessível
- [ ] Funcionalidades principais testadas
- [ ] Logs sem erros críticos
- [ ] Performance aceitável

## 🔗 Links Úteis

- **Aplicação Local**: http://localhost
- **Health Check**: http://localhost/health
- **Logs**: `docker-compose logs -f`
- **Status**: `docker-compose ps`

## 📞 Suporte

Em caso de problemas:

1. Verificar logs: `docker-compose logs`
2. Consultar documentação técnica em `docs/`
3. Verificar issues conhecidos
4. Contactar equipe de desenvolvimento

---

**Última atualização**: $(date +'%d/%m/%Y')  
**Versão da documentação**: 1.0 