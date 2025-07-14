#!/bin/bash

# Script para aplicar as mudanças de layout do formulário Transfer Website

echo "🔧 Aplicando mudanças de layout no Transfer Website..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "src/components/BookingWidget.tsx" ]; then
    echo "❌ Erro: Arquivo BookingWidget.tsx não encontrado!"
    echo "💡 Certifique-se de estar na pasta raiz do projeto"
    exit 1
fi

echo "✅ Arquivo BookingWidget.tsx encontrado"

# Verificar se o Node.js está funcionando
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js não encontrado no PATH"
    echo "💡 Certifique-se de que o Node.js está instalado e configurado"
    echo "📋 Para instalar: brew install node ou nvm install 18"
    echo ""
    echo "🎯 ALTERNATIVA: Acesse o preview das mudanças em:"
    echo "   http://localhost:8080/preview.html"
    echo ""
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Testar se o Node.js está funcionando corretamente
echo "🧪 Testando Node.js..."
if ! node -e "console.log('OK')" &> /dev/null; then
    echo "❌ Node.js não está funcionando corretamente"
    echo "💡 Possível problema de compatibilidade"
    echo "📋 Tente: nvm install 18 && nvm use 18"
    echo ""
    echo "🎯 ALTERNATIVA: Acesse o preview das mudanças em:"
    echo "   http://localhost:8080/preview.html"
    echo ""
    exit 1
fi

echo "✅ Node.js funcionando corretamente"
echo ""

# Fazer backup do build atual
echo "💾 Fazendo backup do build atual..."
if [ -d "dist" ]; then
    cp -r dist dist-backup-$(date +%Y%m%d-%H%M%S)
    echo "✅ Backup criado"
else
    echo "⚠️  Pasta dist não encontrada, restaurando do zip..."
    unzip -o dist.zip
fi

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf dist

# Fazer novo build
echo "🔨 Fazendo novo build..."
if npm run build; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build"
    echo "💡 Restaurando backup..."
    if [ -d "dist-backup-"* ]; then
        cp -r dist-backup-* dist
        echo "✅ Backup restaurado"
    else
        unzip -o dist.zip
        echo "✅ Build restaurado do zip"
    fi
    exit 1
fi

# Verificar se o build foi criado
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build não foi criado corretamente"
    echo "💡 Restaurando backup..."
    unzip -o dist.zip
    exit 1
fi

# Copiar o preview para o novo build
cp index-preview.html dist/preview.html

echo ""
echo "🎉 MUDANÇAS APLICADAS COM SUCESSO!"
echo ""
echo "🌐 Acesse:"
echo "   - Site principal: http://localhost:8080"
echo "   - Preview: http://localhost:8080/preview.html"
echo ""
echo "🔍 Para verificar se as mudanças foram aplicadas:"
echo "   - Abra o site principal"
echo "   - Vá para a aba 'Por hora'"
echo "   - Observe o layout mais largo e organizado"
echo ""
echo "✨ Benefícios aplicados:"
echo "   📏 Formulário mais largo (max-w-7xl)"
echo "   🎯 Layout em 4 linhas organizadas"
echo "   📐 Altura padronizada (h-11)"
echo "   🎨 Ícones maiores (18px)"
echo "   📝 Fonte maior (text-base)"
echo "   🎛️ Todos os componentes visíveis (sem scroll)"
echo ""

# Limpeza de backups antigos (manter só os 3 mais recentes)
echo "🧹 Limpando backups antigos..."
ls -t dist-backup-* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null
echo "✅ Limpeza concluída"
echo ""
echo "🚀 Pronto! As mudanças estão ativas." 