#!/bin/bash

# Script para criar certificado SSL temporário (auto-assinado)
# Uso: ./ssl-temporario.sh

echo "🔒 Criando certificado SSL temporário para agenda.flowseven.online..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root (sudo)"
    exit 1
fi

# Instalar OpenSSL se não estiver instalado
if ! command -v openssl &> /dev/null; then
    echo "📦 Instalando OpenSSL..."
    apt update && apt install openssl -y
fi

# Criar diretório para certificados
mkdir -p /etc/ssl/agenda.flowseven.online

# Gerar chave privada
echo "🔑 Gerando chave privada..."
openssl genrsa -out /etc/ssl/agenda.flowseven.online/private.key 2048

# Gerar certificado auto-assinado
echo "📜 Gerando certificado auto-assinado..."
openssl req -new -x509 -key /etc/ssl/agenda.flowseven.online/private.key \
    -out /etc/ssl/agenda.flowseven.online/certificate.crt \
    -days 365 \
    -subj "/C=BR/ST=State/L=City/O=Organization/OU=OrgUnit/CN=agenda.flowseven.online"

# Instalar Nginx se não estiver instalado
if ! command -v nginx &> /dev/null; then
    echo "🌐 Instalando Nginx..."
    apt update && apt install nginx -y
fi

# Configurar Nginx com SSL
echo "⚙️ Configurando Nginx com SSL..."
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

    # Certificados SSL
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
echo "🔗 Habilitando site..."
ln -sf /etc/nginx/sites-available/agenda.flowseven.online /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Abrir portas no firewall
echo "🔥 Configurando firewall..."
ufw allow 80
ufw allow 443
ufw --force enable

# Testar configuração
echo "🧪 Testando configuração do Nginx..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx
systemctl enable nginx

# Verificar status
echo "✅ Verificando status..."
systemctl status nginx --no-pager

echo ""
echo "🎉 SSL temporário configurado com sucesso!"
echo "⚠️  ATENÇÃO: Este é um certificado auto-assinado"
echo "   O navegador mostrará um aviso de segurança"
echo "   Clique em 'Avançado' e 'Prosseguir para agenda.flowseven.online'"
echo ""
echo "🌐 Acesse: https://agenda.flowseven.online"
echo "📚 API Docs: https://agenda.flowseven.online/api/docs"
echo "👤 Login: admin@sistema.com / admin123"
echo ""
echo "💡 Para um certificado válido, execute: ./verificar-ssl.sh"
