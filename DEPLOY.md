# 🚀 Deploy em Produção - agenda.flowseven.online

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Acesso ao servidor onde será hospedado
- Domínio configurado: `agenda.flowseven.online`

## 🔧 Configuração do Servidor

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` no diretório raiz do projeto:

```env
# Database
POSTGRES_DB=agendamento_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=senha_super_segura_aqui
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# JWT
JWT_SECRET=sua_chave_jwt_super_secreta_aqui

# Application
BACKEND_PORT=3001
FRONTEND_PORT=3000
FRONTEND_URL=https://agenda.flowseven.online
```

### 2. Configurar Nginx (Recomendado)

Crie um arquivo `nginx.conf`:

```nginx
server {
    listen 80;
    server_name agenda.flowseven.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name agenda.flowseven.online;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🐳 Deploy com Docker

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd agendamento-multitenancy
```

### 2. Configurar Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

### 3. Build e Deploy

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Executar em background
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Inicializar Banco de Dados

```bash
# Executar migrações
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate

# Criar superadmin
docker-compose -f docker-compose.prod.yml exec backend npm run init:superadmin
```

## 🔍 Verificação do Deploy

### 1. Verificar Containers

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 2. Testar Endpoints

```bash
# Frontend
curl https://agenda.flowseven.online

# Backend API
curl https://agenda.flowseven.online/api/auth/profile

# Swagger
curl https://agenda.flowseven.online/api/docs
```

### 3. Verificar Logs

```bash
# Logs do backend
docker-compose -f docker-compose.prod.yml logs backend

# Logs do frontend
docker-compose -f docker-compose.prod.yml logs frontend

# Logs do banco
docker-compose -f docker-compose.prod.yml logs postgres
```

## 🔄 Atualizações

### 1. Atualizar Código

```bash
# Pull das mudanças
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Backup do Banco

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres agendamento_db > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres agendamento_db < backup.sql
```

## 🛠️ Comandos Úteis

### Gerenciar Containers

```bash
# Parar todos os serviços
docker-compose -f docker-compose.prod.yml down

# Reiniciar um serviço específico
docker-compose -f docker-compose.prod.yml restart backend

# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Manutenção do Banco

```bash
# Acessar banco
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres agendamento_db

# Executar migrações
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate

# Reset do banco (CUIDADO!)
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:reset
```

## 🔒 Segurança

### 1. Configurar Firewall

```bash
# Permitir apenas portas necessárias
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 2. Configurar SSL

```bash
# Usar Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d agenda.flowseven.online
```

### 3. Backup Automático

Crie um script de backup:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
PROJECT_DIR="/path/to/agendamento-multitenancy"

# Backup do banco
docker-compose -f $PROJECT_DIR/docker-compose.prod.yml exec -T postgres pg_dump -U postgres agendamento_db > $BACKUP_DIR/backup_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz $PROJECT_DIR

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +7 -delete
```

## 📊 Monitoramento

### 1. Health Check

```bash
# Verificar saúde dos containers
docker-compose -f docker-compose.prod.yml ps

# Verificar uso de recursos
docker stats
```

### 2. Logs

```bash
# Configurar rotação de logs
sudo nano /etc/docker/daemon.json

{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 🆘 Troubleshooting

### Problema: Site não carrega

```bash
# Verificar se os containers estão rodando
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
docker-compose -f docker-compose.prod.yml logs frontend
```

### Problema: API não responde

```bash
# Verificar logs do backend
docker-compose -f docker-compose.prod.yml logs backend

# Verificar conexão com banco
docker-compose -f docker-compose.prod.yml exec backend npm run prisma:studio
```

### Problema: Banco não conecta

```bash
# Verificar logs do postgres
docker-compose -f docker-compose.prod.yml logs postgres

# Testar conexão
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT 1;"
```

## 📞 Suporte

Para problemas específicos:
1. Verificar logs dos containers
2. Verificar configuração do nginx
3. Verificar variáveis de ambiente
4. Verificar conectividade de rede
