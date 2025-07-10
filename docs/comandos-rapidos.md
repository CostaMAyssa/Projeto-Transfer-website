# Comandos Rápidos - Transfer Website

## 🚀 Deploy Rápido (Mais Usado)

```bash
# Deploy automatizado completo
./deploy.sh

# Deploy com limpeza de cache
./deploy.sh --clean
```

## 🛠️ Build Local

```bash
# Desenvolvimento
npm run dev                 # Servidor dev (porta 8080)

# Build para produção
npm run build              # Build otimizado
npm run preview            # Preview do build
```

## 🐳 Docker (Manual)

```bash
# Deploy manual
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificar status
docker-compose ps
docker-compose logs -f transfer-website
```

## 🔄 Atualizações

```bash
# Atualização completa
git pull origin main
./deploy.sh --clean

# Atualização rápida
git pull origin main
docker-compose restart transfer-website
```

## 📊 Monitoramento

```bash
# Status e logs
docker-compose ps
docker-compose logs --tail=50 transfer-website
docker stats transfer-website

# Health check
curl http://localhost/health
```

## 🚨 Troubleshooting

```bash
# Limpar tudo e reconstruir
docker-compose down
docker system prune -f
rm -rf node_modules dist/
npm install
./deploy.sh --clean

# Verificar logs de erro
docker-compose logs transfer-website | grep -i error
```

## 🔐 Variáveis de Ambiente

```bash
# Criar .env a partir do exemplo
cp env.example .env

# Verificar configuração
cat .env | grep -v "^#"
```

## 📁 Estrutura Importante

```
dist/           # Build gerado
.env            # Variáveis de ambiente
deploy.sh       # Script de deploy
docker-compose.yml
package.json
```

## ⚡ Comandos de Emergência

```bash
# Parar tudo
docker-compose down
docker stop $(docker ps -q)

# Rollback rápido
git log --oneline -5
git checkout HASH_ANTERIOR
./deploy.sh

# Backup de container
docker commit transfer-website backup-$(date +%Y%m%d)
```

---

> **Dica**: Use sempre `./deploy.sh` para deploys. É o método mais seguro e automatizado. 