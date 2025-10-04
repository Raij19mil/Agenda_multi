# Relatório de Desconexões entre Frontend e Backend

## 1. Temas (Themes) – Endpoint divergente

**Problema:**
- Frontend usa `POST /themes/tenant/current` para atualizar o tema do tenant.
- Backend implementa `POST /themes/tenant/:tenantId` para atualizar o tema de um tenant específico.

**Impacto:**
O frontend nunca consegue atualizar o tema, pois o endpoint chamado não existe no backend.

**Como corrigir:**
- Alinhar o frontend para usar o endpoint correto, ou adicionar no backend o endpoint `/themes/tenant/current`.

---

## 2. Autenticação – Falta de refresh token e perfil

**Problema:**
- Frontend usa `/auth/refresh` para renovar token, mas backend não implementa esse endpoint.

**Impacto:**
O usuário pode ser deslogado ao expirar o token, pois não há como renovar.

**Como corrigir:**
- Adicionar endpoint `/auth/refresh` no backend e implementar a lógica de renovação de token.

---

## 3. Estrutura dos Dados – Campos divergentes

**Problema:**
- O frontend espera campos com nomes ou formatos diferentes dos retornados pelo backend.

**Impacto:**
Erros de renderização, dados não exibidos corretamente.

**Como corrigir:**
- Padronizar DTOs e tipos entre frontend e backend.

---

## 4. Tenants – Permissões e endpoints

**Problema:**
- Frontend pode tentar criar/editar tenants sem ser SUPERADMIN.
- Backend só permite SUPERADMIN criar/editar tenants.

**Impacto:**
Usuários comuns recebem erro 403 sem feedback claro.

**Como corrigir:**
- No frontend, esconder/desabilitar botões para usuários não autorizados.
- No backend, retornar mensagens de erro claras.

---

## 5. Agendamentos e Clientes – Filtros e buscas

**Problema:**
- Frontend usa filtros e buscas, mas backend pode não implementar todos os filtros esperados.

**Impacto:**
Busca ou filtragem não funciona corretamente.

**Como corrigir:**
- No backend, implementar todos os filtros e parâmetros de busca esperados pelo frontend.

---

## 6. Rotas protegidas – Falta de tratamento de 401/403

**Problema:**
- O frontend pode não tratar corretamente respostas 401/403.

**Impacto:**
Usuário fica "travado" sem saber o que fazer.

**Como corrigir:**
- No frontend, adicionar lógica para redirecionar ao login ou mostrar mensagem ao receber 401/403.

---

## 7. Uploads, arquivos e outros fluxos não mapeados

Se houver uploads, downloads ou outros fluxos, verifique se os endpoints, headers e formatos estão alinhados.

---

## Resumo dos patches sugeridos

- Corrija endpoints divergentes (ex: temas).
- Implemente endpoints ausentes (ex: refresh token).
- Padronize nomes e formatos de dados.
- Ajuste permissões e feedback de erro.
- Implemente todos os filtros e buscas necessários.
- Trate erros de autenticação no frontend.

---

Se desejar, posso gerar patches exatos para cada caso listado acima.