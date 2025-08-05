#!/bin/bash

echo "🔥 Iniciando deploy do Firebase Hosting..."

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -ne 0 ]; then
    echo "❌ Erro no build do projeto"
    exit 1
fi

# Deploy do Firebase
echo "🚀 Fazendo deploy no Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deploy realizado com sucesso!"
    echo "🌐 Seu site está disponível em: https://gameoab-45225.web.app"
else
    echo "❌ Erro no deploy do Firebase"
    exit 1
fi