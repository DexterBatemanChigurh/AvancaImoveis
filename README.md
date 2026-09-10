# Avança Imóveis

Plataforma da **Avança Imóveis**: catálogo público de imóveis à venda (focado em SEO),
painel interno com login e — nas próximas fases — CRM em Kanban, visitas e dashboard.

> Documento de referência do projeto: [`docs/proposta-plataforma-avanca-imoveis.md`](docs/proposta-plataforma-avanca-imoveis.md).
> Esta base implementa a **Fundação (Fase 1)** e deixa o terreno pronto para as fases 2 e 3.

---

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) + TypeScript |
| UI | React 19, Tailwind CSS, componentes próprios no padrão shadcn/ui |
| Banco | PostgreSQL (Supabase) via **Drizzle ORM** |
| Auth | Supabase Auth (e-mail + senha, sem autocadastro) — protege só `/admin` |
| Arquivos | Cloudflare R2 (S3-compatível) + otimização de imagem com `sharp` |
| Mapa | Leaflet / OpenStreetMap (embed, sem chave) |
| E-mail | Resend (aviso de novo lead) — opcional |
| Deploy | Vercel |

---

## Como rodar localmente

```bash
# 1. Dependências
npm install

# 2. Ambiente
cp .env.example .env.local
#   preencha NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#   DATABASE_URL e DIRECT_URL (Supabase > Project Settings)

# 3. Banco: gera e aplica as migrations, depois popula dados de referência
npm run db:generate     # cria os SQL em src/db/migrations a partir do schema
npm run db:migrate      # aplica no banco
npm run db:seed         # etapas do funil + categorias de documento

# 4. App
npm run dev             # http://localhost:3000
```

### Criar um usuário do painel

Não há tela de cadastro. Crie os usuários no painel do Supabase
(**Authentication > Users > Add user**, com "Auto Confirm User") e insira a linha
espelho em `users`:

```sql
insert into users (id, email, name) values
  ('<uuid-do-auth-user>', 'fernanda@exemplo.com', 'Fernanda');
```

> Ver proposta §7: a recomendação é **um usuário por pessoa**. `users.role` já existe
> para papéis diferenciados no futuro.

---

## Estrutura

```
src/
├── app/
│   ├── (public)/            # catálogo aberto — SEO, sem login
│   │   ├── imoveis/         #   grade + filtros
│   │   └── imovel/[slug]/   #   página do imóvel + "Tenho interesse" + mapa
│   ├── (admin)/admin/       # painel — protegido pelo middleware
│   │   ├── page.tsx         #   dashboard
│   │   ├── imoveis/         #   lista / novo / editar   (Fase 1)
│   │   ├── crm/             #   placeholder             (Fase 2)
│   │   ├── clientes/        #   placeholder             (Fase 2)
│   │   ├── visitas/         #   placeholder             (Fase 2)
│   │   ├── proprietarios/   #   placeholder             (Fase 1/2)
│   │   └── configuracoes/   #   placeholder             (Fase 2)
│   ├── login/               # e-mail + senha (Server Action)
│   ├── auth/                # sign-out + callback (magic link opcional)
│   ├── api/leads/           # endpoint alternativo do formulário de interesse
│   ├── sitemap.ts / robots.ts
│   └── middleware.ts        # refresh de sessão + gate do /admin
├── db/
│   ├── schema/              # Drizzle — fonte da verdade do modelo de dados
│   ├── migrations/          # geradas por drizzle-kit
│   ├── index.ts             # client
│   └── seed.ts
├── features/                # regra de negócio por domínio (cresce por aqui)
│   ├── auth/                #   sessão / requireUser
│   ├── properties/          #   queries + Server Actions + zod schema
│   ├── owners/
│   ├── leads/               #   "Tenho interesse" -> lead + card + e-mail
│   └── dashboard/           #   métricas
├── components/  ui | public | admin
└── lib/         env | constants | format | slug | seo | geocode
                 supabase/ (server|client|middleware) · storage/ (r2|images)
```

### Princípios da fundação

- **Público e interno separados por route group** (`(public)` / `(admin)`), mesmo banco.
  O que decide a visibilidade é `properties.status = 'disponivel'`.
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
- [x] Filtro do catálogo (bairro, preço, quartos)
- [x] Login do painel + gate de rota
- [x] CRUD textual de imóveis + link compartilhável + contador de views
- [x] Formulário "Tenho interesse" → cria lead + card + e-mail
- [ ] **Upload e ordenação de fotos** (R2 + `sharp` já plugados em `lib/storage`)
- [ ] CRUD de proprietários (mesmo padrão do formulário de imóvel)
- [ ] Geocodificação no salvar (helper pronto em `lib/geocode.ts`)

### Fase 2 — Operação comercial
- [ ] CRM Kanban (`@dnd-kit/core`) sobre `deals` / `stages` / `activities`
- [ ] Clientes: ficha, critérios, timeline, exclusão LGPD
- [ ] Visitas + lembrete automático (cron na Vercel lendo `visits.remind_at`)
- [ ] Documentos por imóvel, em seções por categoria
- [ ] Ficha do imóvel em PDF
- [ ] Dashboard com funil e conversão

### Fase 3 — Refino
- [ ] Match imóvel ↔ lead (critérios já são estruturados em `clients`)
- [ ] Indicadores avançados
- [ ] Avaliar WhatsApp automático (API paga) e domínio próprio

---

## Decisões em aberto (alinhar com Rogério / Fernanda)

- Login individual por pessoa **vs.** logins compartilhados (recomendado: individual).
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
| `npm run db:generate` | gera migrations a partir de `src/db/schema` |
| `npm run db:migrate` | aplica migrations |
| `npm run db:seed` | popula etapas do funil e categorias de documento |
| `npm run db:studio` | Drizzle Studio (inspeção do banco) |
