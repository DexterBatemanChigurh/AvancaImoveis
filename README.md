# Avança Imóveis

Plataforma completa da **Avança Imóveis** (Frutal, MG): catálogo público de imóveis
voltado a SEO, painel interno com CRM, clientes, visitas, propostas, vendas e
documentos — tudo num único projeto Next.js, sem depender de nenhum
backend-as-a-service para dados (o Supabase entra só como Storage de arquivo).

> Documento original de proposta (histórico, escopo inicial que deu origem ao
> projeto): [`docs/proposta-plataforma-avanca-imoveis.md`](docs/proposta-plataforma-avanca-imoveis.md).
> Este README descreve o estado **atual** do projeto — já bem além do escopo
> da Fase 1 descrita ali.

---

## Stack

| Camada | Escolha |
|---|---|
| App | Next.js 15 (App Router, Server Actions) + TypeScript — frontend **e** backend |
| UI | React 19, Tailwind CSS, componentes próprios |
| Banco | PostgreSQL via **Drizzle ORM** — [Neon](https://neon.tech) em produção, Postgres local (docker-compose) em desenvolvimento |
| Auth | Própria, sem serviço externo: e-mail + senha (hash `scrypt`, nativo do Node) + sessão em cookie `httpOnly` (tabela `sessions`). Protege só `/admin` |
| Rate-limit | Contador atômico no próprio banco (`rate_limits`) — ao contrário de uma solução em memória, funciona corretamente em serverless com múltiplas instâncias (login, formulário de interesse, alerta de busca) |
| Arquivos | Supabase Storage — bucket público `fotos-imoveis` (fotos, otimizadas com `sharp`: WebP + miniatura) e bucket privado `documentos-privados` (matrícula, contrato etc., servidos por rota que exige login) |
| Mapa | Leaflet / OpenStreetMap (embed, sem chave) + geocodificação via Nominatim, com pino manual como alternativa; endereço exato nunca aparece no catálogo público (raio aproximado) |
| Localização | Filtro em cascata Estado → Cidade (municípios via API do IBGE) → Bairro |
| E-mail | Resend (aviso de novo lead, alerta de busca com double opt-in) — opcional, degrada com elegância se não configurado |
| PDF | `@react-pdf/renderer` — ficha do imóvel gerada sob demanda (nunca inclui proprietário, comissão ou endereço exato) |
| Kanban | `@dnd-kit/core` — funil de negócios do CRM |
| Tempo real | Catálogo público percebe mudanças do admin via polling leve (`/api/catalog-version`) |
| Deploy | Vercel (app) + Neon (banco) + Supabase (storage) |

---

## Como rodar localmente

Pré-requisito: **Docker** (só para o Postgres de desenvolvimento).

```bash
# 1. Dependências
npm install

# 2. Ambiente
cp .env.example .env.local
#   preencha DATABASE_URL (local ou Neon), NEXT_PUBLIC_SUPABASE_URL e
#   SUPABASE_SERVICE_ROLE_KEY — os demais são opcionais (degradam sozinhos)

# 3. Sobe o banco local
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

Em produção, `DATABASE_URL` aponta pro Neon — não precisa de Docker lá.

### Criar / atualizar usuários

Não há tela de cadastro — cada pessoa da equipe tem sua própria conta:

```bash
npm run user:create -- --email fernanda@avanca.com --name "Fernanda"
npm run user:create -- --email rogerio@avanca.com  --name "Rogério" --password "trocar-depois"
```

Rodar de novo com o mesmo e-mail **redefine a senha** desse usuário.

---

## Estrutura

```
src/
├── app/
│   ├── (public)/                  # catálogo aberto — SEO, sem login
│   │   ├── imoveis/               #   grade + filtros
│   │   ├── imovel/[slug]/         #   galeria, mapa, "Tenho interesse", imóveis parecidos
│   │   ├── sobre/
│   │   ├── favoritos/             #   favoritos (localStorage, sem conta)
│   │   └── alertas/               #   confirmação/cancelamento de alerta de busca
│   ├── (admin)/admin/             # painel — gate no middleware + requireUser()
│   │   ├── page.tsx               #   dashboard (métricas reais)
│   │   ├── imoveis/               #   CRUD + fotos + documentos + match
│   │   ├── crm/                   #   Kanban de negócios (deals/stages) + propostas
│   │   ├── clientes/              #   ficha, critérios de busca, timeline
│   │   ├── visitas/               #   agenda
│   │   ├── proprietarios/        #   CRUD + documentos
│   │   ├── configuracoes/         #   categorias de documento + etapas do funil (editáveis, sem migration)
│   │   ├── auditoria/             #   log de alterações (activity_logs)
│   │   └── documentos/[...path]/  #   serve documentos privados (exige login)
│   ├── login/                     # e-mail + senha (Server Action → createSession)
│   ├── auth/sign-out/             # POST → destroySession
│   └── api/
│       ├── catalog-version/       #   polling do catálogo público
│       ├── municipios/            #   proxy do IBGE (filtro de cidade)
│       └── properties/favoritos/  #   busca os favoritos salvos no navegador
├── db/
│   ├── schema/                    # Drizzle — fonte da verdade do modelo de dados
│   ├── migrations/                # geradas por drizzle-kit
│   └── seed.ts
├── features/                      # regra de negócio por domínio
│   ├── auth/  properties/  owners/  clients/  crm/  stages/  visits/
│   └── proposals/  documents/  leads/  alerts/  notifications/  analytics/  audit/  dashboard/
├── components/  ui | public | admin | home
└── lib/
    ├── auth/                      # cookie · scrypt · sessão
    ├── storage/                   # Supabase (fotos públicas + documentos privados) · sharp
    ├── match.ts                   # compatibilidade cliente ↔ imóvel (calculada on-demand, nunca persistida)
    ├── rate-limit.ts              # limitador atômico no banco (funciona em serverless)
    ├── pdf/                       # ficha do imóvel
    └── env · constants · format · slug · seo · geocode · geo-privacy · ibge
scripts/create-user.ts             # CLI de criação de usuário
docker-compose.yml                 # Postgres de desenvolvimento (produção usa Neon)
```

---

## O que existe hoje

**Catálogo público**
- Grade com filtros (tipo, estado/cidade/bairro, preço, quartos, banheiros, vagas) + paginação
- Página do imóvel: galeria (foto grande + grade de secundárias no desktop, tira com scroll no mobile, lightbox em tela cheia), mapa com raio aproximado, características, imóveis parecidos
- Favoritos sem conta (guardado no navegador) e compartilhamento
- Formulário "Tenho interesse" → cria/atualiza cliente + negócio no CRM + e-mail, com proteção contra duplicidade (reenvio no mesmo imóvel não cria um segundo card) e contra spam
- Alerta de busca por e-mail (double opt-in, cancelável)
- Clique no WhatsApp é registrado (aparece no dashboard)
- SEO: sitemap, robots, Open Graph, JSON-LD

**Painel /admin**
- Imóveis: CRUD completo, fotos (upload múltiplo, otimização automática, reordenação, capa), documentos por categoria, clientes compatíveis (match calculado on-demand ao criar/editar), ficha em PDF
- CRM: Kanban de negócios com etapas configuráveis, propostas, fechamento de venda (transação única que marca o imóvel como vendido)
- Clientes: ficha, critérios de busca, timeline de atividades
- Visitas: agenda
- Proprietários: CRUD + documentos
- Configurações: categorias de documento e etapas do funil, ambas editáveis sem precisar de migration
- Auditoria: log de criação/edição de imóvel e upload/remoção de documento
- Dashboard: imóveis, visitas, propostas, vendas, comissão do mês, cliques no WhatsApp

**Segurança**
- Autenticação própria, sessão em cookie `httpOnly`
- Rate-limit de login/formulário/alerta guardado no banco — correto mesmo com várias instâncias serverless em paralelo
- Documentos privados nunca ficam num bucket público — servidos por rota autenticada
- Endereço exato do imóvel nunca sai numa resposta pública (nem no mapa, nem na API, nem no JSON-LD)

---

## Scripts

| Comando | O quê |
|---|---|
| `npm run dev` | ambiente de desenvolvimento |
| `npm run build` / `npm start` | build de produção |
| `npm run lint` / `npm run typecheck` | qualidade |
| `npm run db:up` / `npm run db:down` | sobe / derruba o Postgres local (docker-compose) |
| `npm run db:generate` | gera migrations a partir de `src/db/schema` |
| `npm run db:migrate` | aplica migrations |
| `npm run db:seed` | popula etapas do funil e categorias de documento |
| `npm run db:studio` | Drizzle Studio (inspeção do banco) |
| `npm run user:create -- --email … --name …` | cria/atualiza usuário do painel |
