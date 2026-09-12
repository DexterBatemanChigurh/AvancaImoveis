# Plataforma Avança Imóveis — Proposta Técnica

> **Versão 1 — para revisão** · 10 de setembro de 2026
> Escopo: só venda · Construção incremental, em conjunto
> Para Rogério, Fernanda e Ana Clara operarem venda de ponta a ponta.

Portfólio de imóveis com **catálogo público** voltado a SEO, um **painel interno** com login e um **CRM em Kanban**.

---

## Índice

1. [Como tudo se conecta](#1--como-tudo-se-conecta)
2. [Stack técnica](#2--stack-tecnica)
3. [Modelo de dados](#3--modelo-de-dados)
4. [Painel interno · /admin](#4--painel-interno--admin)
5. [Catálogo público](#5--catalogo-publico)
6. [Dashboard — indicadores iniciais](#6--dashboard--indicadores-iniciais)
7. [Acesso e usuários](#7--acesso-e-usuarios)
8. [Armazenamento e custos](#8--armazenamento-e-custos)
9. [Funcionalidades e status](#9--funcionalidades-e-status)
10. [Faseamento](#10--faseamento)
11. [Próximos passos](#11--proximos-passos)

---

## 1 — Como tudo se conecta

Um único projeto e um único banco, com **dois ambientes de uso**. O catálogo é aberto e pensado para aparecer no Google; o painel fica atrás de login. Os dois leem o mesmo banco — o campo **status do imóvel** é o que decide se ele aparece para o cliente.

```
   ┌─────────────────────┐        ┌─────────────────────┐
   │   Painel interno    │        │  Catálogo público   │
   │  /admin · com login │        │  aberto · SEO       │
   └──────────┬──────────┘        └──────────┬──────────┘
              │                              │
              └──────────────┬───────────────┘
                             ▼
         ┌───────────────────────────────────────┐
         │        PostgreSQL (dedicado)           │
         │ imóveis · clientes · CRM · visitas ·   │
         │ proprietários · usuários · sessões     │
         └───────────────────┬───────────────────┘
                             ▼
              ┌──────────────────────────────┐
              │        Cloudflare R2         │
              │     fotos e documentos       │
              └──────────────────────────────┘
```

Mesmo código, dois ambientes de uso, um só banco.

---

## 2 — Stack técnica

Escolhas que priorizam começar no **plano gratuito**, ter deploy automático e não travar quando a operação crescer.

| Ferramenta | Papel | Como funciona no início |
|---|---|---|
| **Next.js** | Backend + frontend num app só. | Catálogo renderizado no servidor (bom para SEO); painel é uma aplicação autenticada. Server Actions + rotas `/api` fazem o papel de backend — sem serviço separado. |
| **PostgreSQL (dedicado)** | Banco de dados relacional, sem serviço proprietário. | Local via `docker compose`; em produção, qualquer Postgres (VPS ou gerenciado). Acesso por Drizzle ORM. |
| **Autenticação própria** | Login do painel. | E-mail + senha (hash `scrypt`, nativo do Node) e sessão em cookie `httpOnly` guardada na tabela `sessions`. Sem autocadastro; contas criadas por CLI (`npm run user:create`). Protege apenas `/admin`. |
| **Hospedagem** | Publicação do app. | A definir (Vercel, VPS ou container). Deploy do app Next + um Postgres alcançável. |
| **Cloudflare R2** | Armazenamento de fotos e documentos. | Banda de saída gratuita — ideal para catálogo público com muitas imagens. Toda foto é otimizada no upload (WebP, ~2000 px, com miniatura). |
| **React + Tailwind + shadcn/ui** | Componentes de interface do painel. | Biblioteca pronta para formulários, listas e tabelas. Kanban do CRM com `dnd-kit` (arrastar e soltar). |
| **Leaflet + OpenStreetMap** | Mapa na página do imóvel. | Pin do endereço sem custo e sem chave de API. O endereço é convertido em coordenadas no cadastro. |
| **Resend** | E-mail transacional. | Dispara o aviso de novo lead para a equipe. WhatsApp automático fica para uma fase futura (exige API paga). |
| **PDF no servidor** | Ficha do imóvel para enviar por WhatsApp. | Botão "gerar ficha" no painel produz um PDF com fotos, valor e características. |

---

## 3 — Modelo de dados

Entidades principais e seus campos iniciais. É um ponto de partida — vai crescer conforme Rogério e Fernanda detalharem o dia a dia.

### Imóvel
O centro de tudo. Só aparece no catálogo quando o status é "disponível".

- código interno · título · slug (URL)
- **status:** rascunho · disponível · reservado · vendido · pausado
- **tipo:** casa · apartamento · terreno · comercial
- valor de venda · condomínio (opc.) · IPTU (opc.)
- endereço + bairro + cidade + CEP · lat/long
- área útil / total · quartos · suítes · banheiros · vagas
- descrição longa
- listas: características · diferenciais · vizinhança (mercado, escola, farmácia…)
- fotos (até 10, ordenáveis, 1 de capa)
- nº de visualizações
- proprietário → (relação)
- captação: exclusiva/aberta · início · fim · % comissão
- documentos → (relação)

### Proprietário
Registro interno. **Nunca aparece para o cliente.** Um proprietário pode ter vários imóveis.

- nome · telefone · e-mail · CPF/CNPJ (opc.) · observações

### Documento do imóvel
Arquivos organizados por categoria. A lista de categorias é **configurável** — a alinhar com Rogério e Fernanda.

- categoria: Matrícula · IPTU · Planta · Contrato de exclusividade · Habite-se · …
- arquivo · data de upload

### Cliente / Lead
Critérios de busca ficam em campos estruturados para alimentar o "match" com imóveis.

- nome · telefone · e-mail
- origem: site · indicação · Instagram · portal · outro
- bairros de interesse · faixa de preço · quartos mín. · vagas mín.
- consentimento LGPD (data + texto aceito)
- observações

### Negócio — card do CRM
Cada card é um cliente dentro do funil, com a próxima ação sempre visível.

- cliente → · etapa → · imóveis de interesse → (múltiplos)
- próxima ação + data · valor estimado · motivo de perda · ordem na coluna

### Etapa do funil
Configurável. Padrão inicial:

- nome · ordem · cor
- **Novo → Contato feito → Visita agendada → Proposta → Fechado / Perdido**

### Visita
- imóvel → · cliente → · data/hora
- status: agendada · realizada · cancelada
- lembrete · feedback pós-visita

### Atividade
Monta a linha do tempo do cliente e do negócio.

- tipo: nota · ligação · e-mail · mudança de etapa
- texto · autor · data

### Usuário
Todos com o mesmo nível de acesso na v1.

- nome · e-mail · ativo

---

## 4 — Painel interno · /admin

Onde a Ana Clara cadastra imóveis e a equipe toca o comercial. Só acessível com login.

| Módulo | O que faz |
|---|---|
| **Imóveis** | Lista com busca e filtro por status. Formulário com salvamento automático de rascunho, upload e ordenação de fotos, abas de documentos, proprietário e captação. Botões "copiar link público" e "gerar ficha em PDF". |
| **CRM (Kanban)** | Colunas são as etapas do funil. Arrastar o card entre colunas. Abrir o card mostra dados do cliente, imóveis de interesse, próxima ação e linha do tempo. Card pode nascer de um lead. |
| **Clientes** | Lista de leads e ficha com critérios de busca e histórico. Botão "imóveis compatíveis". Exclusão de dados a pedido do cliente (LGPD). |
| **Visitas** | Agenda em lista e calendário. Marcar como realizada e registrar feedback. Lembrete automático antes da visita. |
| **Proprietários** | Cadastro e lista, com os imóveis vinculados a cada proprietário. |
| **Dashboard** | Indicadores da operação (seção 6). |
| **Configurações** | Etapas do funil, categorias de documento e usuários. |

---

## 5 — Catálogo público

Site aberto, sem login, com visual de landing page. O cliente só vê imóveis disponíveis.

- **Home do catálogo** — grade de imóveis com filtro simples (bairro, faixa de preço, quartos).
- **Página do imóvel** — galeria de fotos, valor, mapa do endereço, descrição, características, diferenciais, vizinhança, botão de WhatsApp (mensagem pré-preenchida com o código do imóvel) e formulário "Tenho interesse".
- **Link compartilhável** — `/imovel/casa-3-quartos-jardim-europa-a1b2`, estável, com botão "copiar" no painel.
- **Formulário "Tenho interesse"** — cria automaticamente um lead + um card na etapa "Novo" do CRM e envia e-mail para a equipe. Campos: nome, telefone, e-mail, mensagem e consentimento LGPD.
- **SEO** — renderização no servidor, `sitemap.xml` automático, meta tags e Open Graph por imóvel (aparece com foto ao compartilhar no WhatsApp), dados estruturados schema.org `RealEstateListing`, imagens otimizadas.
- **O cliente nunca vê** — proprietário, documentos, comissão, CRM, outros leads ou imóveis fora do status "disponível".

> **Nota sobre domínio:** no endereço `*.vercel.app` o ganho de SEO é limitado. Registrar o domínio próprio agora (≈ R$ 40–60/ano) evita reiniciar o histórico de indexação depois. **Decisão em aberto.**

---

## 6 — Dashboard — indicadores iniciais

- Clientes / leads: total e novos no mês
- Negócios fechados: no mês e no ano
- Visitas realizadas
- Funil: quantidade de cards por etapa e conversão entre etapas
- Leads por origem
- Tempo médio parado em cada etapa
- Imóveis por status
- Imóveis mais visualizados (a partir do contador de views dos links)
- Valor total em negociação

---

## 7 — Acesso e usuários

Login apenas no `/admin`; o catálogo fica 100% aberto. Autenticação própria: e-mail + senha (hash `scrypt`), sessão em cookie `httpOnly` na tabela `sessions`, sem serviço externo. Sem tela de cadastro — as contas são criadas por CLI (`npm run user:create`).

**Recomendação:** um usuário por pessoa (Fernanda, Rogério, Ana Clara, você e eu). Não tem custo e preserva o histórico de quem cadastrou o imóvel, quem moveu o card, quem apagou o quê. A alternativa pedida — dois logins compartilhados — funciona, mas perde essa rastreabilidade e obriga a trocar a senha de todos quando alguém sai. **Decisão em aberto.**

Todos com o mesmo nível de acesso na v1. Papéis mais restritos (por exemplo, Ana Clara só em imóveis) podem entrar depois sem retrabalho.

---

## 8 — Armazenamento e custos

### No início — quase tudo gratuito

- **App Next.js** — roda em qualquer host de Node/container; local via `docker compose`.
- **PostgreSQL dedicado** — grátis local (Docker); em produção, um Postgres pequeno (VPS ~US$ 5/mês ou plano gratuito de um gerenciado).
- **Cloudflare R2** — 10 GB grátis/mês; banda de saída sempre gratuita.
- **Resend** — faixa gratuita (~3.000 e-mails/mês).

> Conta das fotos: otimizadas ficam em ~300–500 KB. 10 por imóvel ≈ 4 MB. ~1.000 imóveis ≈ 4 GB. Storage e banda não são gargalo nessa escala.

### Quando escalar

- **Postgres** — subir o plano/instância conforme o volume; backup automático é o ponto a garantir.
- **Domínio próprio** — ≈ R$ 40–60/ano.
- **WhatsApp automático** — API oficial (Meta/Twilio), cobrada por conversa, só se fizer falta.

> Valores de referência de setembro/2026 — confirmar os planos vigentes antes de contratar.

---

## 9 — Funcionalidades e status

| Funcionalidade | Status | Observação |
|---|---|---|
| Cadastro completo de imóveis + fotos | ✅ Aprovado | Fase 1 |
| Catálogo público com SEO | ✅ Aprovado | Fase 1 |
| Link compartilhável por imóvel | ✅ Aprovado | Fase 1 |
| Botão de WhatsApp na página do imóvel | ✅ Aprovado | Fase 1 — click-to-chat, sem custo |
| Cadastro de proprietários | ✅ Aprovado | Fase 1 — nunca aparece no catálogo |
| Captação exclusiva / aberta + % comissão | ✅ Aprovado | Campos opcionais — confirmar se usam esse conceito |
| CRM em Kanban | ✅ Aprovado | Fase 2 |
| Formulário "Tenho interesse" → CRM + e-mail | ✅ Aprovado | Fase 2 |
| Agendamento de visitas + lembrete | ✅ Aprovado | Fase 2 |
| Anexos por imóvel em seções por tipo | ✅ Aprovado | Fase 2 — categorias a alinhar com Rogério/Fernanda |
| Ficha do imóvel em PDF | ✅ Aprovado | Fase 2 |
| Mapa na página do imóvel | ✅ Aprovado | Fase 2 — OpenStreetMap |
| LGPD: consentimento + exclusão de dados | ✅ Aprovado | Fase 2 |
| Dashboard de indicadores | ✅ Aprovado | Fase 2 |
| Match imóvel ↔ lead | ✅ Aprovado | Fase 3 |
| Aviso automático por WhatsApp | ⏳ Adiado | Exige API paga; e-mail cobre o início |
| Login individual por pessoa | ⏳ A decidir | Recomendado; alternativa é 2 logins compartilhados |
| Domínio próprio | ⏳ A decidir | Recomendado registrar já, pelo SEO |
| Atribuição de lead por corretor | ❌ Fora de escopo | Vendas feitas em conjunto |
| Locação | ❌ Fora de escopo | Só venda |

---

## 10 — Faseamento

### Fase 1 — Fundação (catálogo no ar)
Cadastro de imóveis (fotos, características, diferenciais, vizinhança), proprietários, catálogo público com SEO, página do imóvel com mapa e botão de WhatsApp, link compartilhável e login do painel.

**Resultado:** Ana Clara cadastra imóveis e a equipe já compartilha links com clientes.

### Fase 2 — Operação comercial
CRM em Kanban, clientes com critérios de busca, formulário "Tenho interesse" ligado ao CRM e ao e-mail, visitas com lembrete, documentos por imóvel, ficha em PDF, LGPD e dashboard.

**Resultado:** todo o funil de vendas acontece dentro da plataforma.

### Fase 3 — Refino
Match imóvel ↔ lead, indicadores avançados no dashboard, ajustes guiados pelo uso real e avaliação de WhatsApp automático e domínio próprio.

**Resultado:** plataforma redonda, com as próximas decisões baseadas em dados de uso.

---

## 11 — Próximos passos

1. Você valida esta proposta e ajusta o que for preciso.
2. Alinhar com Rogério e Fernanda: categorias de documento, se usam captação exclusiva, decisão de login e domínio próprio.
3. Eu começo a Fase 1.
