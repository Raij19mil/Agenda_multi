# 🔒 Solução para Problema de SSL - agenda.flowseven.online

## 🚨 Problema Identificado

O erro `NET::ERR_CERT_AUTHORITY_INVALID` indica que o certificado SSL não está configurado ou é inválido no domínio `agenda.flowseven.online`.

## 🔧 Soluções

### 1. **Solução Temporária (HTTP)**

Já configurei o sistema para usar HTTP temporariamente:

```bash
# URLs temporárias (sem SSL)
Frontend: http://agenda.flowseven.online
API: http://agenda.flowseven.online/api
```

### 2. **Solução Permanente (HTTPS com SSL)**

#### Opção A: Configuração Automática

```bash
# 1. Acesse o servidor
ssh usuario@seu-servidor

# 2. Execute o script de configuração
sudo ./setup-ssl.sh
```

#### Opção B: Configuração Manual

```bash
# 1. Instalar Nginx
sudo apt update
sudo apt install nginx -y

# 2. Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# 3. Configurar Nginx
sudo nano /etc/nginx/sites-available/agenda.flowseven.online
```

**Conteúdo do arquivo Nginx:**
```nginx
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
```

```bash
# 4. Habilitar site
sudo ln -s /etc/nginx/sites-available/agenda.flowseven.online /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 5. Testar configuração
sudo nginx -t

# 6. Reiniciar Nginx
sudo systemctl restart nginx

# 7. Obter certificado SSL
sudo certbot --nginx -d agenda.flowseven.online
```

## 🔍 Verificação

### 1. Testar HTTP (temporário)
```bash
curl http://agenda.flowseven.online
curl http://agenda.flowseven.online/api
```

### 2. Testar HTTPS (após configuração)
```bash
curl https://agenda.flowseven.online
curl https://agenda.flowseven.online/api
```

### 3. Verificar certificado
```bash
openssl s_client -connect agenda.flowseven.online:443 -servername agenda.flowseven.online
```

## 🛠️ Troubleshooting

### Problema: Certificado não é confiável
```bash
# Verificar se o domínio está apontando para o servidor correto
nslookup agenda.flowseven.online

# Verificar se as portas estão abertas
sudo ufw allow 80
sudo ufw allow 443
```

### Problema: Nginx não inicia
```bash
# Verificar logs
sudo journalctl -u nginx

# Testar configuração
sudo nginx -t

# Verificar se as portas estão em uso
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Problema: Certbot falha
```bash
# Verificar se o domínio está acessível
curl -I http://agenda.flowseven.online

# Verificar se o Nginx está rodando
sudo systemctl status nginx

# Tentar obter certificado manualmente
sudo certbot certonly --nginx -d agenda.flowseven.online
```

## 📋 Checklist de Configuração

- [ ] Domínio apontando para o servidor correto
- [ ] Portas 80 e 443 abertas no firewall
- [ ] Nginx instalado e configurado
- [ ] Certbot instalado
- [ ] Certificado SSL obtido
- [ ] Nginx configurado para HTTPS
- [ ] Aplicação rodando nas portas 3000 e 3001
- [ ] Teste de acesso funcionando

## 🔄 Renovação Automática

```bash
# Configurar renovação automática
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📞 Suporte

Se ainda houver problemas:

1. **Verificar DNS**: `nslookup agenda.flowseven.online`
2. **Verificar portas**: `sudo netstat -tlnp | grep :80`
3. **Verificar logs**: `sudo journalctl -u nginx`
4. **Verificar certificado**: `sudo certbot certificates`

## 🎯 Próximos Passos

1. **Configurar SSL** usando uma das opções acima
2. **Testar acesso** via HTTPS
3. **Configurar renovação automática**
4. **Monitorar logs** para garantir funcionamento
5. **Atualizar URLs** para HTTPS no código (se necessário)
