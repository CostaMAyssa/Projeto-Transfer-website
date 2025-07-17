#!/bin/bash

# 🚀 Script de Deploy Simples - Transfer Website
# Uso: ./deploy-simple.sh

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy simples..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ======================================
# CONFIGURAÇÕES - EDITE AQUI
# ======================================
VPS_IP="31.97.142.131"
VPS_USER="root"
PROJECT_NAME="transfer-website"
BUILD_DIR="dist"
SITE_DIR="/root/site-transfer-website"
# ======================================

echo -e "${BLUE}📋 Configurações:${NC}"
echo "   VPS: $VPS_USER@$VPS_IP"
echo "   Projeto: $PROJECT_NAME"
echo "   Diretório do site: $SITE_DIR"

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script na raiz do projeto.${NC}"
    exit 1
fi

# 2. Verificar se o build existe
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}📦 Build não encontrado. Fazendo build...${NC}"
    source ~/.nvm/nvm.sh
    nvm use default
    npm run build
fi

echo -e "${GREEN}✅ Build verificado!${NC}"

# 3. Compactar arquivos
echo -e "${YELLOW}📦 Compactando arquivos...${NC}"
rm -f $BUILD_DIR.tar.gz
tar -czf $BUILD_DIR.tar.gz $BUILD_DIR/

echo -e "${GREEN}✅ Arquivos compactados!${NC}"

# 4. Mostrar informações de deploy
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  BUILD CONCLUÍDO COM SUCESSO  ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "📦 Arquivo gerado: ${GREEN}$BUILD_DIR.tar.gz${NC}"
echo -e "📁 Tamanho: ${GREEN}$(du -h $BUILD_DIR.tar.gz | cut -f1)${NC}"
echo ""
echo -e "🔧 Próximos passos para deploy:${NC}"
echo -e "   1. Enviar arquivo para VPS:"
echo -e "      ${YELLOW}scp $BUILD_DIR.tar.gz $VPS_USER@$VPS_IP:/root/${NC}"
echo ""
echo -e "   2. Deploy na VPS:"
echo -e "      ${YELLOW}ssh $VPS_USER@$VPS_IP${NC}"
echo -e "      ${YELLOW}cd /root${NC}"
echo -e "      ${YELLOW}rm -rf $SITE_DIR${NC}"
echo -e "      ${YELLOW}mkdir -p $SITE_DIR${NC}"
echo -e "      ${YELLOW}tar -xzf $BUILD_DIR.tar.gz -C /root${NC}"
echo -e "      ${YELLOW}cp -r $BUILD_DIR/* $SITE_DIR/${NC}"
echo -e "      ${YELLOW}docker service update --force transfer-website_transfer-website${NC}"
echo ""
echo -e "🌐 Ou usar o script automatizado:"
echo -e "   ${YELLOW}./deploy.sh${NC}"
echo ""

# 5. Perguntar se quer fazer deploy automático
read -p "Deseja fazer deploy automático agora? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📤 Enviando arquivos para VPS...${NC}"
    scp $BUILD_DIR.tar.gz $VPS_USER@$VPS_IP:/root/
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro: Falha ao enviar arquivos para VPS.${NC}"
        echo -e "${YELLOW}💡 Verifique:${NC}"
        echo -e "   - Conexão SSH com a VPS"
        echo -e "   - IP e usuário corretos"
        echo -e "   - Chave SSH configurada"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Arquivos enviados!${NC}"
    
    echo -e "${YELLOW}🐳 Fazendo deploy na VPS...${NC}"
    ssh $VPS_USER@$VPS_IP << EOF
        echo "📁 Preparando diretório do site..."
        cd /root
        rm -rf $SITE_DIR
        mkdir -p $SITE_DIR
        
        echo "📦 Extraindo arquivos..."
        tar -xzf $BUILD_DIR.tar.gz
        
        echo "📋 Copiando arquivos para o diretório do site..."
        cp -r $BUILD_DIR/* $SITE_DIR/
        
        echo "🔧 Ajustando permissões..."
        chmod -R 755 $SITE_DIR
        
        echo "🔄 Atualizando serviço Docker..."
        docker service update --force transfer-website_transfer-website
        
        echo "✅ Deploy concluído!"
        echo "🌐 Site disponível em: https://app.aztransfergroup.com"
EOF
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro: Falha no deploy na VPS.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
    echo -e "${BLUE}🌐 Site: https://app.aztransfergroup.com${NC}"
else
    echo -e "${YELLOW}📋 Deploy manual. Use os comandos mostrados acima.${NC}"
fi

# 6. Limpeza local
echo -e "${YELLOW}🧹 Limpando arquivos temporários...${NC}"
rm -f $BUILD_DIR.tar.gz

echo -e "${GREEN}✨ Processo finalizado!${NC}" 