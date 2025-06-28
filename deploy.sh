#!/bin/bash

# Script de Deploy Automatizado - Transfer Website
# Autor: Sistema de Deploy
# Data: $(date)

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado!"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado!"
    fi
    
    log "Docker e Docker Compose verificados ✓"
}

# Verificar se os arquivos necessários existem
check_files() {
    local required_files=("Dockerfile" "docker-compose.yml" "nginx.conf" "package.json")
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Arquivo obrigatório não encontrado: $file"
        fi
    done
    
    log "Arquivos necessários verificados ✓"
}

# Verificar variáveis de ambiente
check_env() {
    if [[ ! -f ".env" ]]; then
        warn "Arquivo .env não encontrado. Criando arquivo de exemplo..."
        cat > .env << EOF
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
EOF
        warn "Arquivo .env criado. EDITE AS VARIÁVEIS antes de continuar!"
        read -p "Pressione Enter após editar o arquivo .env..."
    fi
    
    log "Variáveis de ambiente verificadas ✓"
}

# Parar containers existentes
stop_existing() {
    log "Parando containers existentes..."
    docker-compose down 2>/dev/null || true
    
    # Remover containers órfãos
    docker container prune -f 2>/dev/null || true
    
    log "Containers existentes parados ✓"
}

# Build da aplicação
build_app() {
    log "Iniciando build da aplicação..."
    
    # Limpar cache do Docker se necessário
    if [[ "$1" == "--clean" ]]; then
        log "Limpando cache do Docker..."
        docker builder prune -f
        docker system prune -f
    fi
    
    # Build da imagem
    docker-compose build --no-cache
    
    log "Build concluído ✓"
}

# Deploy da aplicação
deploy_app() {
    log "Iniciando deploy..."
    
    # Subir os containers
    docker-compose up -d
    
    # Aguardar containers ficarem prontos
    log "Aguardando containers ficarem prontos..."
    sleep 10
    
    # Verificar se está rodando
    if docker-compose ps | grep -q "Up"; then
        log "Deploy realizado com sucesso ✓"
    else
        error "Falha no deploy. Verificar logs: docker-compose logs"
    fi
}

# Verificar health check
check_health() {
    log "Verificando health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost/health &>/dev/null; then
            log "Health check passou ✓"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    warn "Health check falhou após $max_attempts tentativas"
    return 1
}

# Mostrar status
show_status() {
    log "Status dos containers:"
    docker-compose ps
    
    echo ""
    log "Logs recentes:"
    docker-compose logs --tail=20 transfer-website
    
    echo ""
    log "Uso de recursos:"
    docker stats --no-stream transfer-website 2>/dev/null || true
}

# Mostrar informações de acesso
show_access_info() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  DEPLOY CONCLUÍDO COM SUCESSO  ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "🌐 Aplicação disponível em:"
    echo -e "   Local: ${GREEN}http://localhost${NC}"
    echo -e "   Rede:  ${GREEN}http://$(hostname -I | awk '{print $1}')${NC}"
    echo ""
    echo -e "🔍 Comandos úteis:"
    echo -e "   Logs:     ${YELLOW}docker-compose logs -f transfer-website${NC}"
    echo -e "   Status:   ${YELLOW}docker-compose ps${NC}"
    echo -e "   Parar:    ${YELLOW}docker-compose down${NC}"
    echo -e "   Restart:  ${YELLOW}docker-compose restart transfer-website${NC}"
    echo ""
    echo -e "📊 Health Check: ${GREEN}http://localhost/health${NC}"
    echo ""
}

# Função principal
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║        DEPLOY TRANSFER WEBSITE           ║"
    echo "║              Docker + Nginx              ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificações
    check_docker
    check_files
    check_env
    
    # Opções de deploy
    while true; do
        echo ""
        echo "Opções de deploy:"
        echo "1) Deploy normal"
        echo "2) Deploy com limpeza de cache"
        echo "3) Apenas rebuild"
        echo "4) Mostrar status atual"
        echo "5) Sair"
        echo ""
        read -p "Escolha uma opção (1-5): " choice
        
        case $choice in
            1)
                stop_existing
                build_app
                deploy_app
                if check_health; then
                    show_access_info
                else
                    show_status
                fi
                break
                ;;
            2)
                stop_existing
                build_app --clean
                deploy_app
                if check_health; then
                    show_access_info
                else
                    show_status
                fi
                break
                ;;
            3)
                build_app
                log "Rebuild concluído. Use 'docker-compose up -d' para deploy."
                break
                ;;
            4)
                show_status
                ;;
            5)
                log "Deploy cancelado."
                exit 0
                ;;
            *)
                warn "Opção inválida. Tente novamente."
                ;;
        esac
    done
}

# Verificar se está sendo executado como root (opcional)
if [[ $EUID -eq 0 ]]; then
    warn "Executando como root. Considere usar um usuário não-root."
fi

# Executar função principal
main "$@" 