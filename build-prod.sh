#!/bin/bash

# Script de build para produção
# Uso: ./build-prod.sh

echo "🚀 Iniciando build para produção..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

# Build das imagens
echo "🔨 Fazendo build das imagens..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar containers
echo "🚀 Iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar containers iniciarem
echo "⏳ Aguardando containers iniciarem..."
sleep 30

# Verificar se containers estão rodando
echo "🔍 Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

# Executar migrações do banco
echo "🗄️ Executando migrações do banco..."
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate

# Criar superadmin
echo "👤 Criando superadmin..."
docker-compose -f docker-compose.prod.yml exec backend npm run init:superadmin

# Verificar logs
echo "📋 Verificando logs..."
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "✅ Build concluído!"
echo ""
echo "🔧 Se houver erro 404:"
echo "   sudo ./corrigir-404.sh"
echo ""
echo "🔍 Para diagnóstico completo:"
echo "   ./diagnostico.sh"
echo ""
echo "🔒 Configuração de SSL:"
echo "1. SSL Temporário (auto-assinado): sudo ./ssl-temporario.sh"
echo "2. SSL Válido (Let's Encrypt): sudo ./verificar-ssl.sh"
echo "3. Manual: Siga as instruções em SOLUCAO-SSL.md"
echo ""
echo "🌐 Após configurar SSL:"
echo "   Frontend: https://agenda.flowseven.online"
echo "   API: https://agenda.flowseven.online/api"
echo "   Docs: https://agenda.flowseven.online/api/docs"
echo "   Login: admin@sistema.com / admin123"
