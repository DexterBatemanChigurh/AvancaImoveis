# Avança Imóveis

Plataforma da **Avança Imóveis**: catálogo público de imóveis à venda (focado em SEO),
painel interno com login e — nas próximas fases — CRM em Kanban, visitas e dashboard.

> Documento de referência do projeto: [`docs/proposta-plataforma-avanca-imoveis.md`](docs/proposta-plataforma-avanca-imoveis.md).
> Esta base implementa a **Fundação (Fase 1)** e deixa o terreno pronto para as fases 2 e 3.

---

## Stack

Sem dependência de nenhum backend-as-a-service. O próprio Next.js é o backend
(Server Actions + rotas `/api`), e o banco é um PostgreSQL comum.

| Camada | Escolha |
|---|---|
| App | Next.js 15 (App Router, Server Actions) + TypeScript — frontend **e** backend |
| UI | React 19, Tailwind CSS, componentes próprios no padrão shadcn/ui |
| Banco | PostgreSQL dedicado via **Drizzle ORM** (`docker compose` no dev) |
| Auth | Própria: e-mail + senha (hash `scrypt`, nativo do Node) + sessão em cookie `httpOnly` na tabela `sessions`. Protege só `/admin` |
| Arquivos | Disco local, num volume persistente (`STORAGE_DIR`) + otimização de imagem com `sharp`. Fotos servidas por `/uploads`, documentos por `/admin/documentos` (exige login) |
| Mapa | Leaflet / OpenStreetMap (embed, sem chave) + geocodificação via Nominatim, com pino manual no mapa como alternativa |
| Localização | Filtro em cascata Estado → Cidade (municípios via API do IBGE) → Bairro |
| E-mail | Resend (aviso de novo lead + alertas de busca, com confirmação por e-mail) — opcional |
| Tempo real | Catálogo público se atualiza sozinho quando o admin publica/edita (Server-Sent Events) |
| Deploy | Qualquer host de Node/container + um Postgres alcançável (a definir) |

---

## Como rodar localmente

Pré-requisito: **Docker** (para o Postgres). Sem Docker, veja
["Postgres sem Docker"](#postgres-sem-docker) abaixo.

```bash
# 1. Dependências
npm install

# 2. Ambiente
cp .env.example .env.local
#   os valores padrão já apontam para o Postgres do docker-compose

# 3. Sobe o banco
npm run db:up            # docker compose up -d db  (Postgres em localhost:5432)

# 4. Cria as tabelas e popula dados de referência
npm run db:migrate       # aplica src/db/migrations
npm run db:seed          # etapas do funil + categorias de documento

# 5. Cria o primeiro usuário do painel
npm run user:create -- --email voce@exemplo.com --name "Seu Nome"
#   imprime a senha gerada (ou passe --password "algo")

# 6. App
npm run dev              # http://localhost:3000  → /login
```

### Criar / atualizar usuários

Não há tela de cadastro (proposta §7 — recomendação é **um usuário por pessoa**):

```bash
npm run user:create -- --email fernanda@avanca.com --name "Fernanda"
npm run user:create -- --email rogerio@avanca.com  --name "Rogério" --password "trocar-depois"
```

Rodar de novo com o mesmo e-mail **redefine a senha** desse usuário.
`users.role` já existe para papéis diferenciados no futuro.

### Postgres sem Docker

Suba um Postgres qualquer (instalado localmente, VPS, ou um gerenciado como
Neon/Railway) e ajuste `DATABASE_URL` no `.env.local`. O resto dos passos é igual.
Para Postgres local via apt:

```bash
sudo apt install -y postgresql
sudo -u postgres psql -c "create role avanca login password 'avanca'; create database avanca owner avanca;"
```

---

## Estrutura

```
src/
├── app/
│   ├── (public)/            # catálogo aberto — SEO, sem login
│   │   ├── imoveis/         #   grade + filtros
│   │   └── imovel/[slug]/   #   página do imóvel + "Tenho interesse" + mapa
│   ├── (admin)/admin/       # painel — gate no middleware + requireUser()
│   │   ├── page.tsx         #   dashboard
│   │   ├── imoveis/         #   lista / novo / editar   (Fase 1)
│   │   ├── crm/             #   placeholder             (Fase 2)
│   │   ├── clientes/        #   placeholder             (Fase 2)
│   │   ├── visitas/         #   placeholder             (Fase 2)
│   │   ├── proprietarios/   #   placeholder             (Fase 1/2)
│   │   └── configuracoes/   #   placeholder             (Fase 2)
│   ├── login/               # e-mail + senha (Server Action -> createSession)
│   ├── auth/sign-out/       # POST -> destroySession
│   ├── api/leads/           # endpoint alternativo do formulário de interesse
│   ├── api/municipios/      # proxy do IBGE (filtro de cidade)
│   ├── api/events/          # SSE — avisa o catálogo público quando algo muda
│   ├── uploads/[...path]/   # serve fotos (rota pública)
│   ├── (admin)/admin/documentos/[...path]/  # serve documentos (exige login)
│   ├── sitemap.ts / robots.ts
│   └── middleware.ts        # gate leve do /admin (só checa o cookie)
├── db/
│   ├── schema/              # Drizzle — fonte da verdade do modelo de dados
│   ├── migrations/          # geradas por drizzle-kit
│   ├── index.ts             # client
│   └── seed.ts
├── features/                # regra de negócio por domínio (cresce por aqui)
│   ├── auth/                #   getSessionUser / requireUser
│   ├── properties/          #   queries + Server Actions + zod schema
│   ├── owners/
│   ├── leads/               #   "Tenho interesse" -> lead + card + e-mail
│   └── dashboard/           #   métricas
├── components/  ui | public | admin
└── lib/
    ├── auth/                # constants (cookie) · password (scrypt) · session (cookie+DB)
    ├── storage/             # local (disco) · images (sharp) · url (chaves/URLs)
    ├── rate-limit.ts        # throttling e limite de conexões em memória (login, leads, alertas, SSE)
    └── env · constants · format · slug · seo · geocode · ibge · events · request-ip
scripts/create-user.ts       # CLI de criação de usuário
docker-compose.yml           # Postgres de desenvolvimento
```

### Princípios da fundação

- **Público e interno separados por route group** (`(public)` / `(admin)`), mesmo banco.
  O que decide a visibilidade é `properties.status = 'disponivel'`.
- **Auth própria, sem serviço externo.** Senha em `scrypt` (biblioteca padrão do Node),
  sessão opaca em cookie `httpOnly` com o hash guardado em `sessions`. O middleware só
  checa a *presença* do cookie (roda no Edge, sem banco); a validação real é do
  `requireUser()` no layout de `/admin`.
- **Proprietário e documentos nunca são carregados** nas queries públicas
  (ver `features/properties/queries.ts`).
- **`features/` isola a regra de negócio** das telas — cada domínio novo entra como
  uma pasta, sem inchar as páginas.
- **Env validado no boot** (`lib/env.ts`, Zod). Recursos opcionais (R2, e-mail) são
  detectados por `features.*` e degradam com elegância se não configurados.
- **Tema claro/escuro** via CSS custom properties em `globals.css`.

---

## Roadmap

### Fase 1 — Fundação  *(esta base)*
- [x] Modelo de dados completo (todas as entidades da proposta)
- [x] Catálogo público + página do imóvel + SEO (sitemap, OG, JSON-LD)
- [x] Filtro do catálogo (estado, cidade — via IBGE —, bairro, tipo, preço, quartos, banheiros, vagas) + paginação
- [x] Autenticação própria (senha + sessão) + gate de `/admin` + limite de tentativas de login
- [x] CRUD textual de imóveis + link compartilhável + contador de views (1 por IP)
- [x] Upload, ordenação e capa de fotos (disco local + `sharp`), com lightbox em tela cheia na página do imóvel
- [x] Geocodificação automática no salvar (Nominatim, com pino manual no mapa como alternativa)
- [x] Formulário "Tenho interesse" → cria lead + card + e-mail (com limite de envios por IP)
- [x] Alertas de busca por e-mail, com confirmação (double opt-in) e cancelamento
- [x] Catálogo público atualiza sozinho quando o admin publica/edita (SSE)
- [ ] CRUD de proprietários (mesmo padrão do formulário de imóvel)
- [ ] Tela de troca de senha do próprio usuário
- [ ] Papéis de acesso diferenciados (`users.role` existe; hoje todo mundo tem o mesmo acesso, por decisão do negócio)

### Fase 2 — Operação comercial
- [ ] CRM Kanban (`@dnd-kit/core`) sobre `deals` / `stages` / `activities`
- [ ] Clientes: ficha, critérios, timeline, exclusão LGPD
- [ ] Visitas + lembrete automático (job lendo `visits.remind_at`)
- [ ] Documentos por imóvel, em seções por categoria
- [ ] Ficha do imóvel em PDF
- [ ] Dashboard com funil e conversão

### Fase 3 — Refino
- [ ] Match imóvel ↔ lead (critérios já são estruturados em `clients`)
- [ ] Indicadores avançados
- [ ] Avaliar WhatsApp automático (API paga) e domínio próprio

---

## Decisões em aberto (alinhar com Rogério / Fernanda)

- Onde hospedar o app e o Postgres em produção.
- Registrar domínio próprio agora, pelo SEO.
- Lista final de categorias de documento.
- Se trabalham com contrato de **captação exclusiva** (campos já existem, opcionais).

---

## Scripts

| Comando | O quê |
|---|---|
| `npm run dev` | ambiente de desenvolvimento |
| `npm run build` / `npm start` | build de produção |
| `npm run lint` / `npm run typecheck` | qualidade |
| `npm run db:up` / `npm run db:down` | sobe / derruba o Postgres do docker-compose |
| `npm run db:generate` | gera migrations a partir de `src/db/schema` |
| `npm run db:migrate` | aplica migrations |
| `npm run db:seed` | popula etapas do funil e categorias de documento |
| `npm run db:studio` | Drizzle Studio (inspeção do banco) |
| `npm run user:create -- --email … --name …` | cria/atualiza usuário do painel |
