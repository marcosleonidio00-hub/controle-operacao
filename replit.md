# Controle da Operação

## Overview

Sistema de gestão operacional completo para agência de viagens. Unifica múltiplos projetos antes espalhados em planilhas em uma plataforma web centralizada com controle de acesso por usuário.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/controle-operacao)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Session-based (express-session + connect-pg-simple)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **Build**: esbuild (CJS bundle)

## Features

### Authentication & Authorization
- Login com email OU username + senha
- Roles: `master` (dono do sistema), `admin`, `user`
- Admin/Master têm acesso total
- Usuários comuns têm acesso apenas aos fluxos permitidos

### Fluxo de Dados
- Lista de pedidos com busca e filtros
- Registro manual de pedidos
- Importação de CSV (separador configurável: `;` ou `,`)
- Colunas CSV esperadas: numero_do_pedido, fornecedor, produto, data_inicio, loc_booking, custo_emissao, pax_total, agencia, emitido_por

### Fluxo de Cancelamento
- Lista com stats (pendentes, resolvidos, erros de emissão, erros de conferência)
- Registro de cancelamentos com motivo
- Atualização de status e data de solução
- Envio de e-mail de notificação (requer SMTP configurado)

### Fluxo de Emissão
- Definição de metas diárias por usuário (admin/master)
- Gráficos de desempenho (meta vs realizado) com Recharts
- Admins/Masters veem todos os usuários; usuários comuns veem apenas seus dados

### Gestão de Usuários (admin/master)
- Criar/editar/desativar usuários
- Definir role e permissões por fluxo
- Login com email ou username

## Structure

```text
artifacts/
├── api-server/          # Express API backend
│   └── src/
│       ├── routes/      # auth, users, orders, cancellations, goals
│       └── middlewares/ # auth middleware
├── controle-operacao/   # React + Vite frontend
│   └── src/
│       ├── pages/       # login, dashboard, fluxo-dados, fluxo-cancelamento, fluxo-emissao, admin-usuarios
│       ├── hooks/       # use-auth.tsx
│       └── components/  # layout.tsx + shadcn UI
lib/
├── api-spec/            # OpenAPI spec + Orval config
├── api-client-react/    # Generated React Query hooks
├── api-zod/             # Generated Zod schemas
└── db/
    └── src/schema/      # users, orders, cancellations, goals
```

## Master User

- **Email**: marcosleonidio00@gmail.com
- **Username**: marcosmaster
- **Senha**: Admin@2025
- **Role**: master

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
- `SESSION_SECRET` — Secret para sessão (tem fallback padrão)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Para envio de e-mails de cancelamento (opcional)

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API. Sessão por cookie usando PostgreSQL como store.
Dependências extras: bcryptjs, express-session, connect-pg-simple, nodemailer

### `artifacts/controle-operacao` (`@workspace/controle-operacao`)

React + Vite frontend com shadcn/ui, recharts, framer-motion, react-hook-form.
Usa hooks gerados por Orval para chamar a API.

### `lib/db` (`@workspace/db`)

Schema Drizzle com 4 tabelas: users, orders, cancellations, goals.
Run `pnpm --filter @workspace/db run push` para sincronizar schema.
