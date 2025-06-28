# 🚀 Deploy Transfer Website - Guia Rápido

## 📦 Arquivos Criados para Deploy

- **`Dockerfile`** - Configuração do container
- **`docker-compose.yml`** - Orquestração dos serviços
- **`nginx.conf`** - Configuração do servidor web
- **`deploy.sh`** - Script automatizado de deploy
- **`.dockerignore`** - Otimização do build

## ⚡ Deploy Rápido

### 1. Na sua VPS:

```bash
# Fazer upload dos arquivos ou clonar repositório
git clone https://github.com/seu-usuario/transfer-website.git
cd transfer-website

# Executar script de deploy
./deploy.sh
```

### 2. Via Portainer:

1. Acesse Portainer: `http://ip-da-vps:9000`
2. Vá em **Stacks** → **Add Stack**
3. Cole o conteúdo do `docker-compose.yml`
4. Configure as variáveis de ambiente
5. Deploy!

## 🔧 Variáveis de Ambiente Obrigatórias

Crie um arquivo `.env` com:

```env
VITE_APP_NAME=Transfer Website
VITE_APP_URL=https://seu-dominio.com
VITE_MAPBOX_ACCESS_TOKEN=sua_chave_mapbox
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

## 🌐 Acesso

- **Local:** `http://localhost:8080`
- **Rede:** `http://ip-da-vps:8080`
- **Health Check:** `http://ip-da-vps:8080/health`

## 📊 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f transfer-website

# Status
docker-compose ps

# Reiniciar
docker-compose restart transfer-website

# Parar
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 🆘 Problemas Comuns

### Container não inicia
```bash
docker-compose logs transfer-website
```

### Porta em uso
```bash
# Mudar porta no docker-compose.yml
ports:
  - "3000:80"  # ao invés de 8080:80
```

### Erro de build
```bash
docker system prune -f
docker-compose up -d --build
```

## 🔒 Produção

Para produção, configure:

1. **Proxy Reverso** (Nginx/Traefik)
2. **SSL/HTTPS** (Certbot/Let's Encrypt)
3. **Firewall** (UFW)
4. **Monitoramento** (logs, métricas)
5. **Backup** automático

Consulte `DEPLOY_GUIDE.md` para instruções completas.

---

**Status:** ✅ Pronto para deploy 