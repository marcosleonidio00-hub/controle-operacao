# Controle da Operação — Guia de Referência

## Como usar em novas conversas
Cole este arquivo inteiro no início do chat. Ele dá ao agente o contexto completo do sistema para editar qualquer parte e republicar.

---

## Credenciais do Usuário Master
- **Email:** marcosleonidio00@gmail.com
- **Senha:** Admin@2025
- **Role:** master (acesso total)

---

## Estrutura do Projeto

```
workspace/
├── artifacts/
│   ├── controle-operacao/     → Frontend (React + Vite)
│   └── api-server/            → Backend (Express + Node.js)
├── lib/
│   ├── db/                    → Banco de dados (Drizzle ORM + PostgreSQL)
│   └── api-spec/              → Especificação OpenAPI (contrato frontend/backend)
```

---

## Frontend — artifacts/controle-operacao/src/

| O que editar                        | Arquivo                                      |
|-------------------------------------|----------------------------------------------|
| Tela de login                       | `pages/LoginPage.tsx`                        |
| Navegação / sidebar                 | `components/Sidebar.tsx` ou `App.tsx`        |
| Fluxo de Dados (pedidos)            | `pages/OrdersPage.tsx`                       |
| Fluxo de Cancelamento               | `pages/CancellationsPage.tsx`                |
| Fluxo de Emissão / Metas            | `pages/GoalsPage.tsx`                        |
| Gerenciamento de usuários           | `pages/UsersPage.tsx`                        |
| Autenticação / sessão               | `hooks/use-auth.tsx`                         |
| Chamadas à API                      | `lib/api-client-react/src/custom-fetch.ts`   |
| Cores, tema, estilos globais        | `index.css` ou `tailwind.config.js`          |

---

## Backend — artifacts/api-server/src/

| O que editar                        | Arquivo                                      |
|-------------------------------------|----------------------------------------------|
| Configuração principal do servidor  | `app.ts`                                     |
| Inicialização + seed do banco       | `index.ts`                                   |
| Login / logout / sessão             | `routes/auth.ts`                             |
| Pedidos (Fluxo de Dados)            | `routes/orders.ts`                           |
| Cancelamentos                       | `routes/cancellations.ts`                    |
| Metas / gráficos                    | `routes/goals.ts`                            |
| Gerenciamento de usuários           | `routes/users.ts`                            |

---

## Banco de Dados — lib/db/src/

| O que editar                        | Arquivo                                      |
|-------------------------------------|----------------------------------------------|
| Tabela de usuários                  | `schema/users.ts`                            |
| Tabela de pedidos                   | `schema/orders.ts`                           |
| Tabela de cancelamentos             | `schema/cancellations.ts`                    |
| Tabela de metas                     | `schema/goals.ts`                            |
| Conexão com o banco                 | `index.ts`                                   |

Para aplicar mudanças no schema ao banco:
```
pnpm --filter @workspace/db run push
```

---

## Fluxos e Permissões

| Fluxo                  | Permissão no banco          | Quem acessa              |
|------------------------|-----------------------------|--------------------------|
| Fluxo de Dados         | `perm_fluxo_dados`          | master, admin, user*     |
| Fluxo de Cancelamento  | `perm_fluxo_cancelamento`   | master, admin, user*     |
| Fluxo de Emissão       | `perm_fluxo_emissao`        | master, admin, user*     |

*users: somente se a permissão estiver ativa

---

## Roles
- **master** → acesso total, gerencia tudo
- **admin** → acesso a fluxos + usuários do próprio grupo
- **user** → acesso somente aos fluxos permitidos

---

## Tecnologias Usadas
- **Frontend:** React, Vite, Tailwind CSS, TanStack Query, Recharts
- **Backend:** Express.js, express-session, bcryptjs, nodemailer
- **Banco:** PostgreSQL (Replit Database), Drizzle ORM
- **Sessão:** Cookie com express-session (connect-pg-simple)
- **CSV import:** papaparse (separador configurável: , ou ;)

---

## Como republicar após editar
1. Faça as alterações pedidas ao agente
2. Se mudou o schema do banco, peça: *"aplique as mudanças no banco"*
3. Para publicar: *"republique o app"* ou clique em **Publish** no Replit

---

## Contexto para o Agente (cole junto com suas instruções)
> Este é um sistema chamado "Controle da Operação" para uma agência de viagens.
> Usa React+Vite no frontend, Express no backend, PostgreSQL com Drizzle ORM.
> Autenticação por sessão/cookie. Roles: master > admin > user.
> O arquivo SISTEMA.md na raiz do projeto contém o mapa completo de arquivos.
