# 🚀 Guia Universal de Deploy - VPS com Docker

Este guia ensina como configurar um sistema de deploy automatizado para qualquer projeto web (React, Vue, Angular, etc.) usando Docker e VPS.

## 📋 Pré-requisitos

### No seu computador local:
- Node.js e npm instalados
- Git configurado
- Acesso SSH à VPS

### Na VPS:
- Ubuntu 20.04+ ou similar
- Docker instalado
- Docker Swarm inicializado
- Portainer (opcional, mas recomendado)
- Traefik para SSL automático (opcional)

## 🛠️ Passo 1: Estrutura do Projeto

### 1.1 Crie a pasta de documentação
```bash
mkdir docs
cd docs
```

### 1.2 Estrutura recomendada
```
seu-projeto/
├── src/                    # Código fonte
├── public/                 # Arquivos estáticos
├── dist/                   # Build (gerado automaticamente)
├── docs/                   # Documentação e scripts
│   ├── deploy.sh          # Script de deploy
│   ├── DEPLOY_VPS.md      # Documentação detalhada
│   └── README.md          # Guia rápido
├── package.json
└── vite.config.js         # ou webpack/parcel config
```

## 🐳 Passo 2: Configurar Docker na VPS

### 2.1 Conectar na VPS
```bash
ssh root@SEU_IP_VPS
```

### 2.2 Criar Dockerfile
```bash
nano /root/Dockerfile
```

Conteúdo do Dockerfile:
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 2.3 Criar nginx.conf
```bash
nano /root/nginx.conf
```

Conteúdo do nginx.conf:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 2.4 Configurar Docker Swarm (se não estiver configurado)
```bash
docker swarm init
```

### 2.5 Criar rede overlay
```bash
docker network create --driver overlay seu-projeto-net
```

## 📄 Passo 3: Criar Stack do Portainer

### 3.1 Criar arquivo de stack
```bash
nano /root/portainer-stack.yml
```

### 3.2 Conteúdo básico da stack
```yaml
version: '3.8'
services:
  seu-projeto:
    image: seu-projeto:latest
    networks:
      - seu-projeto-net
    ports:
      - "80:80"  # Para acesso direto sem proxy
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

networks:
  seu-projeto-net:
    external: true
```

### 3.3 Stack com Traefik (SSL automático)
```yaml
version: '3.8'
services:
  seu-projeto:
    image: seu-projeto:latest
    networks:
      - traefik-net
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.seu-projeto.rule=Host(`seudominio.com`) || Host(`www.seudominio.com`)"
        - "traefik.http.routers.seu-projeto.entrypoints=websecure"
        - "traefik.http.routers.seu-projeto.tls.certresolver=letsencryptresolver"
        - "traefik.http.services.seu-projeto.loadbalancer.server.port=80"

networks:
  traefik-net:
    external: true
```

## 📝 Passo 4: Criar Script de Deploy

### 4.1 Criar script local
No seu projeto local, crie `docs/deploy.sh`:

```bash
#!/bin/bash

# 🚀 Script de Deploy Automatizado
# Uso: ./docs/deploy.sh

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ======================================
# CONFIGURAÇÕES - EDITE AQUI
# ======================================
VPS_IP="SEU_IP_VPS"
VPS_USER="root"
PROJECT_NAME="seu-projeto"
BUILD_COMMAND="npm run build"  # ou yarn build
BUILD_DIR="dist"               # ou build
# ======================================

echo -e "${BLUE}📋 Configurações:${NC}"
echo "   VPS: $VPS_USER@$VPS_IP"
echo "   Projeto: $PROJECT_NAME"

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script na raiz do projeto.${NC}"
    exit 1
fi

# 2. Ativar Node.js (se usando nvm)
if command -v nvm &> /dev/null; then
    echo -e "${YELLOW}📦 Ativando Node.js...${NC}"
    source ~/.nvm/nvm.sh
    nvm use default
fi

# 3. Instalar dependências (se necessário)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências...${NC}"
    npm install
fi

# 4. Build da aplicação
echo -e "${YELLOW}🔨 Fazendo build da aplicação...${NC}"
$BUILD_COMMAND

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Erro: Build falhou. Pasta $BUILD_DIR não encontrada.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído!${NC}"

# 5. Compactar arquivos
echo -e "${YELLOW}📦 Compactando arquivos...${NC}"
rm -f $BUILD_DIR.tar.gz
tar -czf $BUILD_DIR.tar.gz $BUILD_DIR/

echo -e "${GREEN}✅ Arquivos compactados!${NC}"

# 6. Enviar para VPS
echo -e "${YELLOW}📤 Enviando arquivos para VPS...${NC}"
scp $BUILD_DIR.tar.gz $VPS_USER@$VPS_IP:/root/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro: Falha ao enviar arquivos para VPS.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivos enviados!${NC}"

# 7. Deploy na VPS
echo -e "${YELLOW}🐳 Fazendo deploy na VPS...${NC}"
ssh $VPS_USER@$VPS_IP << EOF
    echo "📁 Extraindo arquivos..."
    cd /root
    rm -rf $BUILD_DIR
    tar -xzf $BUILD_DIR.tar.gz
    
    echo "🔨 Reconstruindo imagem Docker..."
    docker build -t $PROJECT_NAME:latest .
    
    echo "🔄 Atualizando serviço..."
    docker service update --image $PROJECT_NAME:latest $PROJECT_NAME\_$PROJECT_NAME
    
    echo "✅ Deploy concluído!"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro: Falha no deploy na VPS.${NC}"
    exit 1
fi

# 8. Verificação final
echo -e "${YELLOW}🔍 Verificando status do serviço...${NC}"
ssh $VPS_USER@$VPS_IP "docker service ps $PROJECT_NAME\_$PROJECT_NAME --format 'table {{.ID}}\t{{.Name}}\t{{.Image}}\t{{.Node}}\t{{.DesiredState}}\t{{.CurrentState}}'"

echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo -e "${BLUE}🌐 Site: https://seudominio.com${NC}"
echo -e "${YELLOW}💡 Dica: Pressione Ctrl+F5 para forçar refresh sem cache${NC}"

# 9. Limpeza local
echo -e "${YELLOW}🧹 Limpando arquivos temporários...${NC}"
rm -f $BUILD_DIR.tar.gz

echo -e "${GREEN}✨ Processo finalizado!${NC}"
```

### 4.2 Tornar executável
```bash
chmod +x docs/deploy.sh
```

## ⚙️ Passo 5: Configurar Build Commands

### Para React (Vite)
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Para React (Create React App)
```json
// package.json
{
  "scripts": {
    "build": "react-scripts build"
  }
}
```

### Para Vue
```json
// package.json
{
  "scripts": {
    "build": "vue-cli-service build"
  }
}
```

### Para Angular
```json
// package.json
{
  "scripts": {
    "build": "ng build --prod"
  }
}
```

## 🔧 Passo 6: Deploy Inicial na VPS

### 6.1 Primeira imagem Docker
```bash
# Na VPS
cd /root
docker build -t seu-projeto:latest .
```

### 6.2 Criar serviço inicial
```bash
# Opção 1: Deploy simples
docker service create \
  --name seu-projeto_seu-projeto \
  --publish 80:80 \
  --network seu-projeto-net \
  seu-projeto:latest

# Opção 2: Via Portainer Stack
# Use o arquivo portainer-stack.yml criado anteriormente
```

## 📚 Passo 7: Criar Documentação

### 7.1 Criar README.md
```bash
# No seu projeto local
touch docs/README.md
```

### 7.2 Criar documentação detalhada
```bash
touch docs/DEPLOY_VPS.md
```

## 🚀 Passo 8: Uso do Sistema

### 8.1 Deploy automático
```bash
# Na raiz do seu projeto
./docs/deploy.sh
```

### 8.2 Deploy manual (se necessário)
```bash
# Build local
npm run build

# Compactar
tar -czf dist.tar.gz dist/

# Enviar
scp dist.tar.gz root@SEU_IP:/root/

# Deploy na VPS
ssh root@SEU_IP "cd /root && rm -rf dist && tar -xzf dist.tar.gz && docker build -t seu-projeto:latest . && docker service update --image seu-projeto:latest seu-projeto_seu-projeto"
```

## 🔍 Comandos de Verificação

### Status do serviço
```bash
ssh root@SEU_IP "docker service ps seu-projeto_seu-projeto"
```

### Logs do serviço
```bash
ssh root@SEU_IP "docker service logs seu-projeto_seu-projeto --tail 20"
```

### Arquivos no container
```bash
ssh root@SEU_IP "docker exec \$(docker ps -q --filter 'name=seu-projeto') ls -la /usr/share/nginx/html/"
```

## 🛠️ Troubleshooting

### Container não atualiza
```bash
ssh root@SEU_IP "docker service update --force seu-projeto_seu-projeto"
```

### Problemas de cache
- Pressionar `Ctrl+F5` no navegador
- Abrir em aba anônima/privada
- Limpar cache do navegador

### Verificar se build está correto
```bash
# Local
ls -la dist/
# ou
ls -la build/
```

### Verificar conexão SSH
```bash
ssh -v root@SEU_IP
```

## 📋 Checklist de Configuração

### ✅ No projeto local:
- [ ] Pasta `docs/` criada
- [ ] Script `deploy.sh` criado e configurado
- [ ] Permissões de execução definidas (`chmod +x`)
- [ ] Variáveis do script editadas (IP, projeto, etc.)

### ✅ Na VPS:
- [ ] Docker instalado
- [ ] Docker Swarm inicializado
- [ ] Dockerfile criado
- [ ] nginx.conf criado
- [ ] Rede overlay criada
- [ ] Stack do Portainer configurada (opcional)

### ✅ Deploy:
- [ ] Primeira imagem Docker criada
- [ ] Serviço inicial criado
- [ ] Teste do deploy automático
- [ ] Verificação de funcionamento

## 🔒 Segurança

### SSH sem senha (recomendado)
```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t rsa -b 4096

# Copiar chave para VPS
ssh-copy-id root@SEU_IP

# Testar conexão sem senha
ssh root@SEU_IP
```

### Configurar firewall
```bash
# Na VPS
ufw enable
ufw allow ssh
ufw allow 80
ufw allow 443
```

## 🎯 Adaptações por Framework

### React com Vite
- Build dir: `dist`
- Build command: `npm run build`

### React com CRA
- Build dir: `build`
- Build command: `npm run build`

### Vue CLI
- Build dir: `dist`
- Build command: `npm run build`

### Angular
- Build dir: `dist/nome-projeto`
- Build command: `ng build --prod`

### Next.js (SSG)
- Build dir: `out`
- Build command: `npm run build && npm run export`

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker service logs seu-projeto_seu-projeto`
2. Teste SSH: `ssh root@SEU_IP`
3. Verifique build local: `npm run build`
4. Force update: `docker service update --force seu-projeto_seu-projeto`

---

**Criado:** 16/07/2025  
**Versão:** 1.0.0  
**Compatível com:** React, Vue, Angular, e outros SPAs 