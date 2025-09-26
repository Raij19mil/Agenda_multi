# Sistema de Agendamento Multi-Tenancy

Sistema completo de agendamento de horários com suporte a múltiplos tenants, cada um com seu próprio tema e personalização.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + TailwindCSS + Vite
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Autenticação**: JWT + RBAC
- **Containerização**: Docker + Docker Compose

## 🏗️ Arquitetura Multi-Tenancy

- **Schema por Tenant**: Cada tenant possui seu próprio schema no PostgreSQL
- **Temas Dinâmicos**: Sistema de temas personalizáveis por tenant
- **Isolamento de Dados**: Dados completamente isolados entre tenants

## 👥 Níveis de Acesso

- **Superadmin**: Controla todos os tenants
- **Admin**: Controla apenas seu tenant (configurações, agenda, equipe)
- **Agente**: Acessa agenda e registra atendimentos

## 🎨 Temas Disponíveis

- **Barbearia**: Verde escuro
- **Salão de Beleza**: Rosa claro
- **Clínica**: Branco e rosa claro

## 🚀 Como Executar

### Instalação Rápida

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd agendamento-multitenancy

# Instalação automática completa
npm run setup

# Executar aplicação
npm run dev
```

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar com Docker
npm run docker:up

# Configurar banco (primeira vez)
cd backend
npm run prisma:migrate
npm run init:superadmin

# Executar aplicação
npm run dev
```

### Produção

```bash
# Build e deploy
npm run build
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação Swagger**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 👤 Credenciais Padrão

- **Email**: admin@sistema.com
- **Senha**: admin123

## 📁 Estrutura do Projeto

```
agendamento-multitenancy/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticação e autorização
│   │   ├── tenants/        # Gestão de tenants
│   │   ├── users/          # Gestão de usuários
│   │   ├── clients/        # Gestão de clientes
│   │   ├── appointments/   # Sistema de agendamentos
│   │   ├── themes/         # Sistema de temas
│   │   └── logs/           # Sistema de logs
│   └── prisma/             # Schema e migrações
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Serviços de API
│   │   ├── themes/         # Sistema de temas
│   │   └── utils/          # Utilitários
└── database/               # Scripts de banco
```

## 🔧 Configuração

1. Configure as variáveis de ambiente no arquivo `.env`
2. Execute as migrações do Prisma
3. Configure os tenants iniciais
4. Acesse a aplicação em `http://localhost:3000`

## 📱 Funcionalidades

- ✅ Cadastro de clientes
- ✅ Agenda de horários (calendário e lista)
- ✅ Histórico de atendimentos
- ✅ Dashboard com estatísticas
- ✅ Sistema de notificações
- ✅ Logs de atividade
- ✅ Temas personalizáveis
- ✅ Multi-tenancy completo
