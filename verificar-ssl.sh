#!/bin/bash

# Script para verificar e configurar SSL para agenda.flowseven.online
# Uso: ./verificar-ssl.sh

echo "🔍 Verificando configuração SSL para agenda.flowseven.online..."

# Verificar se o domínio está resolvendo
echo "1. Verificando DNS..."
DNS_RESULT=$(nslookup agenda.flowseven.online 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
if [ -z "$DNS_RESULT" ]; then
    echo "❌ Domínio agenda.flowseven.online não está resolvendo"
    echo "   Configure o DNS para apontar para este servidor"
    exit 1
else
    echo "✅ DNS resolvendo para: $DNS_RESULT"
fi

# Verificar se as portas estão abertas
echo "2. Verificando portas..."
if ! nc -z localhost 80; then
    echo "❌ Porta 80 não está aberta"
    echo "   Execute: sudo ufw allow 80"
    exit 1
else
    echo "✅ Porta 80 aberta"
fi

if ! nc -z localhost 443; then
    echo "⚠️  Porta 443 não está aberta (normal se SSL não estiver configurado)"
    echo "   Execute: sudo ufw allow 443"
else
    echo "✅ Porta 443 aberta"
fi

# Verificar se Nginx está instalado
echo "3. Verificando Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx não está instalado"
    echo "   Execute: sudo apt install nginx -y"
    exit 1
else
    echo "✅ Nginx instalado"
fi

# Verificar se Certbot está instalado
echo "4. Verificando Certbot..."
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot não está instalado"
    echo "   Execute: sudo apt install certbot python3-certbot-nginx -y"
    exit 1
else
    echo "✅ Certbot instalado"
fi

# Verificar se a aplicação está rodando
echo "5. Verificando aplicação..."
if ! nc -z localhost 3000; then
    echo "❌ Frontend não está rodando na porta 3000"
    echo "   Execute: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
else
    echo "✅ Frontend rodando na porta 3000"
fi

if ! nc -z localhost 3001; then
    echo "❌ Backend não está rodando na porta 3001"
    echo "   Execute: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
else
    echo "✅ Backend rodando na porta 3001"
fi

# Configurar Nginx se não estiver configurado
echo "6. Configurando Nginx..."
if [ ! -f "/etc/nginx/sites-available/agenda.flowseven.online" ]; then
    echo "📝 Criando configuração do Nginx..."
    sudo tee /etc/nginx/sites-available/agenda.flowseven.online > /dev/null << 'EOF'
server {
    listen 80;
    server_name agenda.flowseven.online;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    # Habilitar site
    sudo ln -sf /etc/nginx/sites-available/agenda.flowseven.online /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Testar e reiniciar Nginx
    sudo nginx -t && sudo systemctl restart nginx
    echo "✅ Nginx configurado"
else
    echo "✅ Nginx já configurado"
fi

# Verificar se já existe certificado SSL
echo "7. Verificando certificado SSL..."
if [ -f "/etc/letsencrypt/live/agenda.flowseven.online/fullchain.pem" ]; then
    echo "✅ Certificado SSL já existe"
    echo "   Verificando validade..."
    if openssl x509 -in /etc/letsencrypt/live/agenda.flowseven.online/fullchain.pem -text -noout | grep -q "Not After"; then
        echo "✅ Certificado válido"
    else
        echo "❌ Certificado inválido"
        echo "   Execute: sudo certbot renew"
    fi
else
    echo "⚠️  Certificado SSL não encontrado"
    echo "   Tentando obter certificado..."
    
    # Obter certificado SSL
    sudo certbot --nginx -d agenda.flowseven.online --non-interactive --agree-tos --email admin@flowseven.online
    
    if [ $? -eq 0 ]; then
        echo "✅ Certificado SSL obtido com sucesso"
    else
        echo "❌ Falha ao obter certificado SSL"
        echo "   Verifique se o domínio está apontando para este servidor"
        echo "   Verifique se as portas 80 e 443 estão abertas"
        exit 1
    fi
fi

# Testar acesso HTTPS
echo "8. Testando acesso HTTPS..."
if curl -s -o /dev/null -w "%{http_code}" https://agenda.flowseven.online | grep -q "200"; then
    echo "✅ HTTPS funcionando"
else
    echo "❌ HTTPS não está funcionando"
    echo "   Verifique os logs: sudo journalctl -u nginx"
    exit 1
fi

# Configurar renovação automática
echo "9. Configurando renovação automática..."
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
echo "✅ Renovação automática configurada"

echo ""
echo "🎉 SSL configurado com sucesso!"
echo "🌐 Acesse: https://agenda.flowseven.online"
echo "📚 API Docs: https://agenda.flowseven.online/api/docs"
echo "👤 Login: admin@sistema.com / admin123"
