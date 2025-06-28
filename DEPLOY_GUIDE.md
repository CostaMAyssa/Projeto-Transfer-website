# Guia de Deploy - Transfer Website no Portainer

## 📋 Pré-requisitos

1. **VPS configurada** com Docker e Portainer instalados
2. **Domínio configurado** apontando para o IP da VPS
3. **Acesso SSH** à VPS
4. **Portainer** rodando na VPS

## 🚀 Passos para Deploy

### 1. Preparar o Código na VPS

```bash
# Conectar via SSH na VPS
ssh usuario@ip-da-vps

# Criar diretório para o projeto
mkdir -p /opt/transfer-website
cd /opt/transfer-website

# Clonar ou fazer upload do código
# Opção 1: Via Git
git clone https://github.com/seu-usuario/seu-repositorio.git .

# Opção 2: Via SCP (do seu computador local)
# scp -r /caminho/para/projeto/* usuario@ip-da-vps:/opt/transfer-website/
```

### 2. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env na VPS
nano .env
```

Adicione as seguintes variáveis (ajuste conforme necessário):

```env
# Configurações da aplicação
VITE_APP_NAME=Transfer Website
VITE_APP_URL=https://seu-dominio.com

# Supabase (se estiver usando)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui

# Google Maps/Places API
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps_aqui

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=sua_chave_mapbox_aqui

# Stripe (se estiver usando)
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_stripe_aqui

# API Base URL
VITE_API_BASE_URL=https://api.seu-dominio.com
```

### 3. Ajustar docker-compose.yml

Edite o arquivo `docker-compose.yml` e ajuste:

```yaml
version: '3.8'

services:
  transfer-website:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: transfer-website
    restart: unless-stopped
    ports:
      - "8080:80"  # Ajuste a porta conforme necessário
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    networks:
      - transfer-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  transfer-network:
    driver: bridge
```

### 4. Deploy via Portainer

#### Opção A: Via Portainer UI (Recomendado)

1. **Acesse o Portainer** no seu navegador: `http://ip-da-vps:9000`

2. **Vá para Stacks** → **Add Stack**

3. **Configure o Stack:**
   - **Name:** `transfer-website`
   - **Build method:** `Repository`
   - **Repository URL:** URL do seu repositório Git
   - **Reference:** `main` ou `master`
   - **Compose path:** `docker-compose.yml`

4. **Adicione as variáveis de ambiente** na seção "Environment variables"

5. **Deploy** clicando em "Deploy the stack"

#### Opção B: Via Docker Compose (Linha de comando)

```bash
# Na VPS, no diretório do projeto
cd /opt/transfer-website

# Build e deploy
docker-compose up -d --build

# Verificar logs
docker-compose logs -f transfer-website

# Verificar status
docker-compose ps
```

### 5. Configurar Proxy Reverso (Nginx/Traefik)

#### Com Nginx (se não estiver usando Traefik):

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Com Traefik (se estiver usando):

As labels no docker-compose.yml já estão configuradas para Traefik.

### 6. Configurar SSL/HTTPS

#### Com Certbot (para Nginx):

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Comandos Úteis

### Gerenciamento do Container

```bash
# Ver logs em tempo real
docker-compose logs -f transfer-website

# Reiniciar o serviço
docker-compose restart transfer-website

# Rebuild da imagem
docker-compose up -d --build transfer-website

# Parar todos os serviços
docker-compose down

# Remover volumes e rebuild completo
docker-compose down -v
docker-compose up -d --build
```

### Monitoramento

```bash
# Ver uso de recursos
docker stats transfer-website

# Ver informações do container
docker inspect transfer-website

# Entrar no container
docker exec -it transfer-website sh

# Health check manual
curl http://localhost:8080/health
```

## 🛠️ Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker-compose logs transfer-website

# Verificar se a porta está em uso
netstat -tulpn | grep :8080

# Rebuild forçado
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### Erro de build

```bash
# Limpar cache do Docker
docker builder prune -f

# Build manual para debug
docker build -t transfer-website .

# Verificar dependências
docker run --rm -it node:18-alpine npm --version
```

### Problemas de rede

```bash
# Verificar redes Docker
docker network ls

# Inspecionar rede
docker network inspect transfer-website_transfer-network

# Testar conectividade
docker exec -it transfer-website ping google.com
```

## 📊 Monitoramento e Logs

### Configurar logrotate

```bash
sudo nano /etc/logrotate.d/docker-transfer-website
```

```
/var/lib/docker/containers/*/*-json.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    postrotate
        /usr/bin/docker kill --signal=USR1 transfer-website 2>/dev/null || true
    endscript
}
```

### Health Check Endpoint

O container expõe um endpoint de health check em `/health` que retorna:
- Status 200 se tudo estiver funcionando
- Resposta: "healthy"

## 🔒 Segurança

### Firewall (UFW)

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 9000/tcp # Portainer (opcional, pode ser restrito por IP)
sudo ufw enable
```

### Backup

```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

# Criar backup do código
tar -czf $BACKUP_DIR/transfer-website-$DATE.tar.gz /opt/transfer-website

# Backup do banco de dados (se aplicável)
# docker exec postgres pg_dump -U user database > $BACKUP_DIR/db-$DATE.sql

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "transfer-website-*.tar.gz" -mtime +7 -delete
```

## 🎯 Próximos Passos

1. **Configurar monitoramento** (Prometheus + Grafana)
2. **Implementar CI/CD** (GitHub Actions + Webhook)
3. **Configurar backup automático**
4. **Implementar rate limiting**
5. **Configurar WAF** (Web Application Firewall)

---

## 📞 Suporte

Em caso de problemas:

1. Verificar logs: `docker-compose logs -f`
2. Verificar health check: `curl http://localhost:8080/health`
3. Verificar recursos: `docker stats`
4. Verificar conectividade de rede
5. Consultar documentação do Portainer

**Status do Deploy:** ✅ Pronto para produção 