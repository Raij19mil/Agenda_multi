#!/bin/bash

# Script de diagnóstico para agenda.flowseven.online
# Uso: ./diagnostico.sh

echo "🔍 Diagnóstico completo do sistema..."

# 1. Verificar DNS
echo "1. Verificando DNS..."
DNS_RESULT=$(nslookup agenda.flowseven.online 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
if [ -z "$DNS_RESULT" ]; then
    echo "❌ DNS não está resolvendo"
else
    echo "✅ DNS resolvendo para: $DNS_RESULT"
fi

# 2. Verificar conectividade
echo "2. Verificando conectividade..."
if curl -s -o /dev/null -w "%{http_code}" http://agenda.flowseven.online | grep -q "200\|301\|302"; then
    echo "✅ HTTP funcionando"
else
    echo "❌ HTTP não está funcionando"
fi

if curl -s -o /dev/null -w "%{http_code}" https://agenda.flowseven.online | grep -q "200\|301\|302"; then
    echo "✅ HTTPS funcionando"
else
    echo "❌ HTTPS não está funcionando"
fi

# 3. Verificar containers Docker
echo "3. Verificando containers Docker..."
if command -v docker &> /dev/null; then
    echo "Containers rodando:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Verificar se os containers estão rodando
    if docker ps | grep -q "agendamento_frontend"; then
        echo "✅ Frontend container rodando"
    else
        echo "❌ Frontend container não está rodando"
    fi
    
    if docker ps | grep -q "agendamento_backend"; then
        echo "✅ Backend container rodando"
    else
        echo "❌ Backend container não está rodando"
    fi
else
    echo "❌ Docker não está instalado"
fi

# 4. Verificar portas locais
echo "4. Verificando portas locais..."
if nc -z localhost 3000; then
    echo "✅ Porta 3000 (frontend) aberta"
    echo "   Testando frontend local:"
    curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:3000
else
    echo "❌ Porta 3000 (frontend) não está aberta"
fi

if nc -z localhost 3001; then
    echo "✅ Porta 3001 (backend) aberta"
    echo "   Testando backend local:"
    curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:3001
else
    echo "❌ Porta 3001 (backend) não está aberta"
fi

# 5. Verificar Nginx
echo "5. Verificando Nginx..."
if command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx está rodando"
        
        # Verificar configuração
        if nginx -t 2>/dev/null; then
            echo "✅ Configuração do Nginx válida"
        else
            echo "❌ Configuração do Nginx inválida"
            echo "   Erros:"
            nginx -t 2>&1 | sed 's/^/   /'
        fi
        
        # Verificar se o site está configurado
        if [ -f "/etc/nginx/sites-available/agenda.flowseven.online" ]; then
            echo "✅ Site configurado no Nginx"
        else
            echo "❌ Site não configurado no Nginx"
        fi
    else
        echo "❌ Nginx não está rodando"
    fi
else
    echo "❌ Nginx não está instalado"
fi

# 6. Verificar logs
echo "6. Verificando logs recentes..."
if command -v journalctl &> /dev/null; then
    echo "   Logs do Nginx (últimas 5 linhas):"
    journalctl -u nginx --no-pager -n 5 | sed 's/^/   /'
fi

# 7. Verificar certificado SSL
echo "7. Verificando certificado SSL..."
if [ -f "/etc/letsencrypt/live/agenda.flowseven.online/fullchain.pem" ]; then
    echo "✅ Certificado Let's Encrypt encontrado"
    echo "   Verificando validade:"
    openssl x509 -in /etc/letsencrypt/live/agenda.flowseven.online/fullchain.pem -text -noout | grep "Not After" | sed 's/^/   /'
elif [ -f "/etc/ssl/agenda.flowseven.online/certificate.crt" ]; then
    echo "✅ Certificado auto-assinado encontrado"
else
    echo "❌ Nenhum certificado SSL encontrado"
fi

# 8. Teste de API
echo "8. Testando API..."
API_RESPONSE=$(curl -s -w "%{http_code}" https://agenda.flowseven.online/api 2>/dev/null)
if echo "$API_RESPONSE" | grep -q "200\|404\|401"; then
    echo "✅ API respondendo (código: $(echo "$API_RESPONSE" | tail -c 3))"
else
    echo "❌ API não está respondendo"
fi

# 9. Teste de frontend
echo "9. Testando frontend..."
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" https://agenda.flowseven.online 2>/dev/null)
if echo "$FRONTEND_RESPONSE" | grep -q "200"; then
    echo "✅ Frontend respondendo"
    if echo "$FRONTEND_RESPONSE" | grep -q "index.html\|React"; then
        echo "✅ Frontend servindo aplicação React"
    else
        echo "⚠️  Frontend respondendo mas pode não estar servindo a aplicação corretamente"
    fi
else
    echo "❌ Frontend não está respondendo (código: $(echo "$FRONTEND_RESPONSE" | tail -c 3))"
fi

echo ""
echo "📋 Resumo do diagnóstico:"
echo "   - DNS: $([ -n "$DNS_RESULT" ] && echo "✅ OK" || echo "❌ FALHA")"
echo "   - HTTP: $(curl -s -o /dev/null -w "%{http_code}" http://agenda.flowseven.online 2>/dev/null | grep -q "200\|301\|302" && echo "✅ OK" || echo "❌ FALHA")"
echo "   - HTTPS: $(curl -s -o /dev/null -w "%{http_code}" https://agenda.flowseven.online 2>/dev/null | grep -q "200\|301\|302" && echo "✅ OK" || echo "❌ FALHA")"
echo "   - Frontend: $(nc -z localhost 3000 2>/dev/null && echo "✅ OK" || echo "❌ FALHA")"
echo "   - Backend: $(nc -z localhost 3001 2>/dev/null && echo "✅ OK" || echo "❌ FALHA")"
echo "   - Nginx: $(systemctl is-active --quiet nginx 2>/dev/null && echo "✅ OK" || echo "❌ FALHA")"
