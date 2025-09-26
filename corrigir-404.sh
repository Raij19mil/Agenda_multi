#!/bin/bash

# Script para corrigir erro 404 em agenda.flowseven.online
# Uso: ./corrigir-404.sh

echo "🔧 Corrigindo erro 404 em agenda.flowseven.online..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root (sudo)"
    exit 1
fi

# 1. Parar containers existentes
echo "1. Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

# 2. Rebuild dos containers
echo "2. Fazendo rebuild dos containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Iniciar containers
echo "3. Iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d

# 4. Aguardar containers iniciarem
echo "4. Aguardando containers iniciarem..."
sleep 30

# 5. Verificar se containers estão rodando
echo "5. Verificando containers..."
docker-compose -f docker-compose.prod.yml ps

# 6. Verificar se as portas estão abertas
echo "6. Verificando portas..."
if ! nc -z localhost 3000; then
    echo "❌ Frontend não está rodando na porta 3000"
    echo "   Verificando logs do frontend:"
    docker-compose -f docker-compose.prod.yml logs frontend --tail=20
    exit 1
fi

if ! nc -z localhost 3001; then
    echo "❌ Backend não está rodando na porta 3001"
    echo "   Verificando logs do backend:"
    docker-compose -f docker-compose.prod.yml logs backend --tail=20
    exit 1
fi

# 7. Testar aplicação localmente
echo "7. Testando aplicação localmente..."
FRONTEND_TEST=$(curl -s -w "%{http_code}" http://localhost:3000 2>/dev/null)
if echo "$FRONTEND_TEST" | grep -q "200"; then
    echo "✅ Frontend funcionando localmente"
else
    echo "❌ Frontend não está funcionando localmente"
    echo "   Status: $(echo "$FRONTEND_TEST" | tail -c 3)"
fi

BACKEND_TEST=$(curl -s -w "%{http_code}" http://localhost:3001 2>/dev/null)
if echo "$BACKEND_TEST" | grep -q "200\|404"; then
    echo "✅ Backend funcionando localmente"
else
    echo "❌ Backend não está funcionando localmente"
    echo "   Status: $(echo "$BACKEND_TEST" | tail -c 3)"
fi

# 8. Configurar Nginx se não estiver configurado
echo "8. Configurando Nginx..."
if [ ! -f "/etc/nginx/sites-available/agenda.flowseven.online" ]; then
    echo "📝 Criando configuração do Nginx..."
    cat > /etc/nginx/sites-available/agenda.flowseven.online << 'EOF'
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name agenda.flowseven.online;
    return 301 https://$server_name$request_uri;
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    server_name agenda.flowseven.online;

    # Certificados SSL (auto-assinado temporário)
    ssl_certificate /etc/ssl/agenda.flowseven.online/certificate.crt;
    ssl_certificate_key /etc/ssl/agenda.flowseven.online/private.key;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Configurações para SPA (Single Page Application)
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
EOF
    
    # Habilitar site
    ln -sf /etc/nginx/sites-available/agenda.flowseven.online /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
fi

# 9. Criar certificado SSL se não existir
echo "9. Verificando certificado SSL..."
if [ ! -f "/etc/ssl/agenda.flowseven.online/certificate.crt" ]; then
    echo "📜 Criando certificado SSL temporário..."
    mkdir -p /etc/ssl/agenda.flowseven.online
    
    # Gerar chave privada
    openssl genrsa -out /etc/ssl/agenda.flowseven.online/private.key 2048
    
    # Gerar certificado auto-assinado
    openssl req -new -x509 -key /etc/ssl/agenda.flowseven.online/private.key \
        -out /etc/ssl/agenda.flowseven.online/certificate.crt \
        -days 365 \
        -subj "/C=BR/ST=State/L=City/O=Organization/OU=OrgUnit/CN=agenda.flowseven.online"
    
    echo "✅ Certificado SSL temporário criado"
fi

# 10. Testar e reiniciar Nginx
echo "10. Testando e reiniciando Nginx..."
if nginx -t; then
    systemctl restart nginx
    echo "✅ Nginx reiniciado com sucesso"
else
    echo "❌ Erro na configuração do Nginx"
    nginx -t
    exit 1
fi

# 11. Aguardar Nginx iniciar
echo "11. Aguardando Nginx iniciar..."
sleep 5

# 12. Testar acesso
echo "12. Testando acesso..."
echo "   Testando HTTP (deve redirecionar para HTTPS):"
HTTP_TEST=$(curl -s -w "%{http_code}" http://agenda.flowseven.online 2>/dev/null)
echo "   Status: $(echo "$HTTP_TEST" | tail -c 3)"

echo "   Testando HTTPS:"
HTTPS_TEST=$(curl -s -w "%{http_code}" https://agenda.flowseven.online 2>/dev/null)
echo "   Status: $(echo "$HTTPS_TEST" | tail -c 3)"

if echo "$HTTPS_TEST" | grep -q "200"; then
    echo "✅ HTTPS funcionando!"
    echo "   Verificando se está servindo a aplicação React..."
    if curl -s https://agenda.flowseven.online | grep -q "React\|root"; then
        echo "✅ Aplicação React sendo servida corretamente"
    else
        echo "⚠️  HTTPS funcionando mas pode não estar servindo a aplicação corretamente"
    fi
else
    echo "❌ HTTPS não está funcionando"
    echo "   Verificando logs do Nginx:"
    journalctl -u nginx --no-pager -n 10
fi

echo ""
echo "🎉 Correção concluída!"
echo "🌐 Acesse: https://agenda.flowseven.online"
echo "📚 API Docs: https://agenda.flowseven.online/api/docs"
echo "👤 Login: admin@sistema.com / admin123"
echo ""
echo "💡 Se ainda houver problemas, execute: ./diagnostico.sh"
