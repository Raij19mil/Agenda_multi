# 🔒 Solução Rápida para SSL - agenda.flowseven.online

## 🚨 Problema
Erro `NET::ERR_CERT_AUTHORITY_INVALID` - Certificado SSL inválido ou não configurado.

## ⚡ Soluções Rápidas

### 1. **SSL Temporário (Imediato)**
```bash
# Execute no servidor
sudo ./ssl-temporario.sh
```
- ✅ Funciona imediatamente
- ⚠️ Navegador mostrará aviso de segurança
- 🔧 Clique em "Avançado" → "Prosseguir para agenda.flowseven.online"

### 2. **SSL Válido (Recomendado)**
```bash
# Execute no servidor
sudo ./verificar-ssl.sh
```
- ✅ Certificado válido do Let's Encrypt
- ✅ Sem avisos de segurança
- ⏱️ Pode demorar alguns minutos

### 3. **Verificação Manual**
```bash
# Verificar se o domínio aponta para o servidor
nslookup agenda.flowseven.online

# Verificar se as portas estão abertas
sudo ufw allow 80
sudo ufw allow 443

# Verificar se a aplicação está rodando
docker-compose -f docker-compose.prod.yml ps
```

## 🔍 Diagnóstico

### Verificar DNS
```bash
nslookup agenda.flowseven.online
# Deve retornar o IP do seu servidor
```

### Verificar Portas
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Verificar Aplicação
```bash
curl http://localhost:3000  # Frontend
curl http://localhost:3001  # Backend
```

## 🛠️ Troubleshooting

### Problema: Domínio não resolve
```bash
# Verificar configuração DNS
# O domínio deve apontar para o IP do servidor
```

### Problema: Portas não abertas
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```

### Problema: Aplicação não roda
```bash
# Verificar containers
docker-compose -f docker-compose.prod.yml ps

# Reiniciar se necessário
docker-compose -f docker-compose.prod.yml restart
```

### Problema: Nginx não inicia
```bash
# Verificar logs
sudo journalctl -u nginx

# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx
```

## 📋 Checklist

- [ ] Domínio apontando para o servidor correto
- [ ] Portas 80 e 443 abertas
- [ ] Aplicação rodando (portas 3000 e 3001)
- [ ] Nginx instalado e configurado
- [ ] Certificado SSL configurado
- [ ] Teste de acesso funcionando

## 🎯 Próximos Passos

1. **Execute uma das soluções acima**
2. **Teste o acesso**: https://agenda.flowseven.online
3. **Verifique se não há erros no console do navegador**
4. **Configure renovação automática** (se usando Let's Encrypt)

## 📞 Suporte

Se ainda houver problemas:

1. **Verifique os logs**: `sudo journalctl -u nginx`
2. **Teste localmente**: `curl https://agenda.flowseven.online`
3. **Verifique DNS**: `nslookup agenda.flowseven.online`
4. **Verifique firewall**: `sudo ufw status`
