# Zeno Knowledge Base (Zeno KB)

> A curated AI-knowledge hub powered by Next.js, Redis (Upstash), Supabase pgvector, and OpenAI.  
> **Live Production:** Deployed on Vercel — zero-config CI/CD.

---

## 🗂️ Repository Overview

```
zeno_kb/
├── app/                 # Next.js 15 App-router application (frontend & API routes)
├── components/          # Shared React/UI components (shadcn-ui & custom)
├── hooks/               # Reusable React hooks
├── lib/                 # Node / browser utilities (AI, embeddings, config, etc.)
├── scripts/
│   ├── setup/           # One-off historical migration scripts (not used in prod)
│   └── utilities/       # Day-to-day ops utilities (data export, style audit…)
├── styles/              # Tailwind + custom `zeno-` design-system tokens
├── public/              # Static assets (logos, PDFs, JSON config backups…)
├── archive/             # **Ignored**: legacy research & product docs
├── .vscode/ .gitignore  # Tooling / version-control config
└── dev.sh               # One-command local dev launcher
```

### Key Features

- **AI Chat Assistant** – GPT-4o-mini streaming chat with tool recommendations.
- **Semantic Search** – Supabase `pgvector` + OpenAI embeddings for tool discovery.
- **Curator Dashboard** – CRUD for tools, categories, descriptions, & CSV export.
- **Analytics Dashboard** – Tracks queries, favorites, and generates downloadable reports.
- **User Management** – Add / role-manage users via Supabase Auth.
- **Favorites / Library** – Users can save tools + personal notes (hidden by default, editable on demand).
- **Design System** – Tailwind CSS with `zeno-` token prefix & shadcn-ui components.

---

## ⚙️ Tech Stack

| Layer           | Tech                                           |
| --------------- | ---------------------------------------------- |
| Frontend        | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend (API)   | Next.js API Routes (serverless on Vercel)      |
| Database        | Supabase Postgres 16 + `pgvector` extension    |
| Cache / KV      | Upstash Redis (global serverless)              |
| AI / Embeddings | OpenAI (GPT-4o-mini, `text-embedding-3-small`) |
| Hosting / CI/CD | Vercel (production & preview deployments)      |

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Clone
$ git clone https://github.com/<org>/zeno_kb.git && cd zeno_kb

# 2. Install deps (pnpm)
$ pnpm install

# 3. Create .env.local (see env vars below)
$ cp .env.example .env.local && code .env.local

# 4. Launch dev server (auto handles dir)
$ ./dev.sh      # => http://localhost:3000
```

### Required Environment Variables

| Variable                        | Description                             |
| ------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client)              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service-role key (server only) |
| `UPSTASH_REDIS_REST_URL`        | Upstash Redis REST endpoint             |
| `UPSTASH_REDIS_REST_TOKEN`      | Upstash Redis REST token                |
| `OPENAI_API_KEY`                | OpenAI API key                          |
| `OPENAI_ORG` _(optional)_       | OpenAI organisation ID                  |

Add any additional secrets used by scripts (SMTP creds, etc.). **Do not commit `.env.*` files.**

---

## 🏗️ Architecture

```
┌────────────────────────────┐   API calls   ┌───────────────────────────┐
│        Next.js App         │ ───────────▶ │   Next.js API Routes      │
│  (React UI + Server Side)  │              │ (serverless functions)    │
└────────────────────────────┘               └────────────┬──────────────┘
                                                         │
                                                         ▼
                                           ┌───────────────────────────┐
                                           │     Upstash Redis KV      │◀─ Favorites, notes, config
                                           └───────────────────────────┘
                                                         │
                                                         ▼
                                           ┌───────────────────────────┐
                                           │  Supabase Postgres +     │
                                           │      pgvector            │◀─ Tools, users, embeddings
                                           └───────────────────────────┘
```

- **Front-end** uses the App Router with React Server Components.
- **API routes** act as the BFF for analytics, data export, vector sync, etc.
- **Vector store**: embeddings are generated via OpenAI and stored in Supabase `pgvector`.
- **Redis**: lightning-fast lookups for config, favorites, and analytics counters.

---

## 🧑‍💻 Development Workflow

| Task                         | Command / Script               |
| ---------------------------- | ------------------------------ |
| Start local dev server       | `./dev.sh`                     |
| Lint & type-check            | `pnpm lint` / `pnpm typecheck` |
| Tailwind style audit         | `pnpm audit:styles`            |
| Export tool data (CSV)       | `pnpm export:data`             |
| Export analytics (CSV)       | `pnpm export:analytics`        |
| Full Redis backup (CSV+JSON) | `pnpm export:complete`         |
| Run unit tests (vitest)      | `pnpm test`                    |

### Scripts Directory

- **`scripts/utilities/*`** – production-safe helpers (data export, styleAuditor, etc.)
- **`scripts/setup/*`** – historical one-off migrations (NOT used in prod, kept for reference)

---

## 🌐 Deployment on Vercel

1. **Connect repo** → Vercel dashboard. Vercel auto-detects Next.js.
2. **Set Environment Variables** under **Settings → Environment Variables** (see list above).
3. **Build & Output** – default settings are sufficient (`next build`).
4. **Ignored Paths** – `.gitignore` excludes `/archive` and other non-runtime assets, so they are not uploaded.
5. **Preview Deployments** – each PR branch gets its own URL automatically.

No extra `vercel.json` is required. If you need custom edge functions or rewrites, add them there.

---

## 📑 Style Guide & Linting

- **Tailwind** with a strict `zeno-` prefix for custom tokens. Dynamic class names must be safelisted in `tailwind.config.ts`.
- ESLint + Prettier enforced via pre-commit hooks.
- Run `pnpm audit:styles` to spot design-system violations (powered by `tools/styleAuditor.js`).

---

## 🗄️ Data & Content

- **`public/_config/*.json`** – default app/content/data taxonomy bundled for SSR fallback.
- **Redis** – single-source of truth at runtime (populated via dashboards or utility scripts).
- **Supabase** – long-term storage (users, tools, embeddings, audit logs).

Backups can be generated via the **Data Export** scripts or downloaded through the Curator/Analytics dashboards.

---

## 🤝 Contributing

1. **Branch off** `main` or `redis` (`feat/your-feature`)
2. Follow the coding conventions & design tokens.
3. Ensure all checks pass: `pnpm lint && pnpm typecheck && pnpm test`.
4. Open a PR. Preview URL will be generated by Vercel.

---

## 📝 License

© 2025 Zeno AI Ltd. Internal project — not licensed for external redistribution.
