#!/bin/bash

# Script para servir a aplicação Transfer Website

echo "🚀 Iniciando servidor Transfer Website..."
echo "📁 Servindo arquivos da pasta dist/"
echo "🌐 Acesse: http://localhost:8080"
echo "⏹️  Para parar: Ctrl+C"
echo ""

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

# Verificar se a pasta dist existe
if [ ! -d "dist" ]; then
    echo "❌ Erro: Pasta dist não encontrada!"
    echo "💡 Execute um build primeiro ou restaure a partir do dist.zip"
    exit 1
fi

# Verificar se a porta 8080 está em uso
if lsof -i :8080 >/dev/null 2>&1; then
    echo "⚠️  Porta 8080 já está em uso. Parando processo anterior..."
    pkill -f "python3 -m http.server 8080"
    sleep 2
fi

# Iniciar o servidor
echo "✅ Servidor iniciado com sucesso!"
python3 -m http.server 8080 -d dist 