-- Script de inicialização do banco de dados
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar usuário superadmin padrão (será criado via API)
-- Este script apenas prepara o banco para receber os dados

-- Comentário: Os schemas e tabelas serão criados automaticamente pelo Prisma
-- quando as migrações forem executadas
