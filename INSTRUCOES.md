# 🚀 Instruções de Uso - Sistema de Agendamento Multi-Tenancy

## 📋 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- Git

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd agendamento-multitenancy
```

### 2. Instalação automática (recomendado)
```bash
npm run setup
```

### 3. Instalação manual
```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

## 🐳 Executando com Docker

### 1. Iniciar os serviços
```bash
npm run docker:up
```

### 2. Parar os serviços
```bash
npm run docker:down
```

### 3. Rebuild dos containers
```bash
npm run docker:build
```

## 🚀 Executando em Desenvolvimento

### 1. Iniciar banco de dados
```bash
npm run docker:up
```

### 2. Configurar banco de dados (primeira vez)
```bash
cd backend
npm run prisma:migrate
npm run init:superadmin
```

### 3. Executar aplicação
```bash
# Em um terminal
npm run dev:backend

# Em outro terminal
npm run dev:frontend
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação Swagger**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 👤 Credenciais Padrão

### Super Administrador
- **Email**: admin@sistema.com
- **Senha**: admin123

## 🎨 Temas Disponíveis

1. **Barbearia** - Verde escuro
2. **Salão de Beleza** - Rosa claro  
3. **Clínica** - Branco e rosa claro
4. **Padrão** - Azul

## 📱 Funcionalidades

### Para Super Administradores
- ✅ Gerenciar todos os tenants
- ✅ Gerenciar usuários de todos os tenants
- ✅ Visualizar logs de atividade
- ✅ Configurar temas globais

### Para Administradores
- ✅ Gerenciar usuários do seu tenant
- ✅ Gerenciar clientes
- ✅ Gerenciar agendamentos
- ✅ Configurar tema do tenant
- ✅ Visualizar estatísticas

### Para Agentes
- ✅ Visualizar agenda
- ✅ Registrar atendimentos
- ✅ Gerenciar clientes
- ✅ Visualizar estatísticas básicas

## 🔧 Configuração de Ambiente

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/agendamento_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `tenants` - Dados dos tenants
- `users` - Usuários do sistema
- `clients` - Clientes dos tenants
- `appointments` - Agendamentos
- `activity_logs` - Logs de atividade

### Multi-tenancy
- Cada tenant possui seu próprio schema no PostgreSQL
- Isolamento completo de dados entre tenants
- Temas personalizáveis por tenant

## 🚀 Deploy em Produção

### 1. Build da aplicação
```bash
npm run build
```

### 2. Deploy com Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Configurar variáveis de ambiente
- Atualizar `.env` com dados de produção
- Configurar banco de dados de produção
- Configurar Redis de produção

## 🔍 Troubleshooting

### Problema: Erro de conexão com banco
```bash
# Verificar se o PostgreSQL está rodando
docker ps

# Reiniciar containers
npm run docker:down
npm run docker:up
```

### Problema: Erro de migração
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Problema: Frontend não carrega
```bash
cd frontend
npm install
npm run dev
```

## 📝 Scripts Disponíveis

- `npm run dev` - Executa frontend e backend em desenvolvimento
- `npm run build` - Build da aplicação para produção
- `npm run docker:up` - Inicia containers Docker
- `npm run docker:down` - Para containers Docker
- `npm run setup` - Instalação completa do projeto
- `npm run init` - Inicializa banco de dados e cria superadmin

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs dos containers: `docker logs <container-name>`
2. Verifique a documentação da API: http://localhost:3001/api/docs
3. Consulte os logs da aplicação no console

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
