#!/bin/bash

# Script para configurar SSL no servidor
# Uso: ./setup-ssl.sh

echo "🔒 Configurando SSL para agenda.flowseven.online..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root (sudo)"
    exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar Nginx
echo "🌐 Instalando Nginx..."
apt install nginx -y

# Instalar Certbot
echo "🔐 Instalando Certbot..."
apt install certbot python3-certbot-nginx -y

# Parar Nginx temporariamente
echo "⏸️ Parando Nginx..."
systemctl stop nginx

# Configurar Nginx básico
echo "⚙️ Configurando Nginx..."
cat > /etc/nginx/sites-available/agenda.flowseven.online << 'EOF'
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
echo "🔗 Habilitando site..."
ln -sf /etc/nginx/sites-available/agenda.flowseven.online /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
echo "🧪 Testando configuração do Nginx..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Iniciar Nginx
echo "🚀 Iniciando Nginx..."
systemctl start nginx
systemctl enable nginx

# Obter certificado SSL
echo "🔐 Obtendo certificado SSL..."
certbot --nginx -d agenda.flowseven.online --non-interactive --agree-tos --email admin@flowseven.online

# Configurar renovação automática
echo "🔄 Configurando renovação automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx

# Verificar status
echo "✅ Verificando status dos serviços..."
systemctl status nginx --no-pager
systemctl status certbot.timer --no-pager

echo "🎉 SSL configurado com sucesso!"
echo "🌐 Acesse: https://agenda.flowseven.online"
echo "📚 API Docs: https://agenda.flowseven.online/api/docs"
