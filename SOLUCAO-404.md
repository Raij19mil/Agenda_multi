# 🔧 Solução para Erro 404 - agenda.flowseven.online

## 🚨 Problema
Erro "404 page not found" ao acessar https://agenda.flowseven.online

## ⚡ Soluções Rápidas

### 1. **Correção Automática (Recomendado)**
```bash
# Execute no servidor
sudo ./corrigir-404.sh
```
- ✅ Rebuild completo dos containers
- ✅ Configuração automática do Nginx
- ✅ Certificado SSL temporário
- ✅ Teste completo do sistema

### 2. **Diagnóstico Manual**
```bash
# Execute no servidor
./diagnostico.sh
```
- 🔍 Verifica todos os componentes
- 📋 Mostra status detalhado
- 🐛 Identifica problemas específicos

### 3. **Correção Manual Passo a Passo**

#### Passo 1: Verificar Containers
```bash
# Verificar se estão rodando
docker-compose -f docker-compose.prod.yml ps

# Se não estiverem, iniciar
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs se houver problemas
docker-compose -f docker-compose.prod.yml logs
```

#### Passo 2: Verificar Portas
```bash
# Verificar se as portas estão abertas
netstat -tlnp | grep :3000  # Frontend
netstat -tlnp | grep :3001  # Backend

# Testar localmente
curl http://localhost:3000  # Frontend
curl http://localhost:3001  # Backend
```

#### Passo 3: Verificar Nginx
```bash
# Verificar se está rodando
systemctl status nginx

# Verificar configuração
nginx -t

# Reiniciar se necessário
systemctl restart nginx
```

## 🔍 Causas Comuns do Erro 404

### 1. **Containers não estão rodando**
- **Sintoma**: Nginx retorna 502 Bad Gateway
- **Solução**: `docker-compose -f docker-compose.prod.yml up -d`

### 2. **Nginx não está configurado**
- **Sintoma**: Nginx retorna página padrão
- **Solução**: Configurar proxy para localhost:3000

### 3. **Frontend não está servindo arquivos estáticos**
- **Sintoma**: 404 em todas as rotas
- **Solução**: Rebuild do container frontend

### 4. **React Router não configurado para SPA**
- **Sintoma**: 404 em rotas específicas (ex: /dashboard)
- **Solução**: Configurar `try_files` no Nginx

### 5. **Certificado SSL inválido**
- **Sintoma**: Erro de certificado + 404
- **Solução**: Configurar SSL correto

## 🛠️ Troubleshooting Detalhado

### Verificar Logs dos Containers
```bash
# Logs do frontend
docker-compose -f docker-compose.prod.yml logs frontend

# Logs do backend
docker-compose -f docker-compose.prod.yml logs backend

# Logs do Nginx
journalctl -u nginx
```

### Verificar Configuração do Nginx
```bash
# Verificar se o site está configurado
ls -la /etc/nginx/sites-enabled/

# Verificar configuração
cat /etc/nginx/sites-available/agenda.flowseven.online

# Testar configuração
nginx -t
```

### Verificar Aplicação Local
```bash
# Testar frontend diretamente
curl -v http://localhost:3000

# Testar backend diretamente
curl -v http://localhost:3001

# Verificar se está servindo arquivos estáticos
curl -v http://localhost:3000/index.html
```

## 📋 Checklist de Verificação

- [ ] DNS apontando para o servidor correto
- [ ] Containers Docker rodando
- [ ] Portas 3000 e 3001 abertas
- [ ] Nginx instalado e rodando
- [ ] Site configurado no Nginx
- [ ] Certificado SSL configurado
- [ ] Frontend servindo arquivos estáticos
- [ ] Backend respondendo na API
- [ ] Teste de acesso funcionando

## 🎯 Próximos Passos

1. **Execute o diagnóstico**: `./diagnostico.sh`
2. **Execute a correção**: `sudo ./corrigir-404.sh`
3. **Teste o acesso**: https://agenda.flowseven.online
4. **Verifique se não há erros no console do navegador**

## 🆘 Se Ainda Não Funcionar

### Verificar DNS
```bash
nslookup agenda.flowseven.online
# Deve retornar o IP do seu servidor
```

### Verificar Firewall
```bash
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### Verificar Recursos do Servidor
```bash
# Verificar uso de memória
free -h

# Verificar uso de CPU
top

# Verificar espaço em disco
df -h
```

### Rebuild Completo
```bash
# Parar tudo
docker-compose -f docker-compose.prod.yml down

# Remover volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose.prod.yml down -v

# Rebuild completo
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Execute `./diagnostico.sh` e envie o resultado
2. Verifique logs: `docker-compose -f docker-compose.prod.yml logs`
3. Teste conectividade: `curl -v https://agenda.flowseven.online`
