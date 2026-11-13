# Taskvane FE

Landing page and documentation for **Taskvane**. This is a separate project from the API (`task-sync-backend`) and is hosted on its own.

- **Landing page** (`/`): what Taskvane does, with illustrations of the flow (Trello → Taskvane → Google Sheet + Slack).
- **Guide** (`/docs/…`): setup step by step, daily use, creating cards, team rules, sheet and Slack output, managing projects, troubleshooting.
- **API reference** (`/docs/api/`): every endpoint with its parameters, request fields, rules and example requests and responses, plus search.

Built with **Next.js 15** (App Router) and **React 19**, exported as a **static site**: plain HTML, CSS and JS in `out/`, with no server to run.

---

## Run it locally

Needs Node.js 18.18 or newer.

```bash
npm install
cp .env.example .env.local     # optional: set NEXT_PUBLIC_API_URL
npm run dev                    # http://localhost:3001 (live reload)
```

Port 3001 keeps it clear of the API on 3000.

## Build

```bash
npm run build                  # writes the static site to ./out
npm start                      # preview ./out on http://localhost:3001
```

## Settings

| Variable | Used for | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | The "Live API (Swagger)" links, e.g. `https://task-sync-api.vercel.app` (no `/` at the end) | `http://localhost:3000` |

It is read **at build time**. Set it in your host's environment settings before building.

## Deploy

Any static host works. Pick one:

| Host | Settings |
| --- | --- |
| **Vercel** | Import the repo. Framework: Next.js. Add `NEXT_PUBLIC_API_URL`. Vercel builds and serves it. |
| **Netlify** / **Cloudflare Pages** | Build command `npm run build`, output directory `out`, plus `NEXT_PUBLIC_API_URL`. |
| **S3, nginx, any web server** | Run `npm run build` and upload the contents of `out/`. |

URLs end with `/` (for example `/docs/setup/`), so every page is a real `index.html` and works on any host without rewrites.

---

## Keeping the API reference up to date

The reference is built from **`src/data/openapi.json`**, the same API description the backend serves at `/docs`. Request fields, types, required flags and rules come from the backend's DTOs, so they always match the code.

After you change the API in the backend, refresh the file. With both projects side by side:

```text
task-sync-backend-v0.3.0/
├── task-sync-backend/
└── task-sync-FE/
```

```bash
cd ../task-sync-backend
npm run export:openapi                         # writes ../task-sync-FE/src/data/openapi.json
# or another location:
npm run export:openapi -- path/to/openapi.json
```

Commit the new `openapi.json` in this project and redeploy. New endpoints appear on the API page automatically.

**Summaries and example responses** live in [`src/data/api-notes.ts`](src/data/api-notes.ts), keyed by `"METHOD /path"`. Add an entry there for a new endpoint to give it a short summary, a description, example JSON and tips. Without an entry, the endpoint still appears, with an example built from its schema.

## Project structure

```text
src/
├── app/
│   ├── layout.tsx              # header, footer, fonts, page metadata
│   ├── page.tsx                # landing page
│   ├── globals.css             # design tokens (light + dark), all styles
│   └── docs/
│       ├── layout.tsx          # docs sidebar
│       ├── page.tsx            # Getting started
│       ├── setup/              # Set up your team (8 steps)
│       ├── daily-use/  cards/  rules/  sheet-and-slack/  manage/  troubleshooting/
│       └── api/                # API reference (built from openapi.json)
├── components/
│   ├── Illustrations.tsx       # SVG flow illustrations (follow light/dark mode)
│   ├── ApiReference.tsx        # endpoint list with search and deep links
│   ├── CodeBlock.tsx           # code block with Copy button
│   ├── Docs.tsx                # Callout, Table, Pager, Endpoint link, DocPage
│   └── SiteHeader / SiteFooter / DocsNav / Logo
├── data/
│   ├── openapi.json            # exported from the backend (do not edit by hand)
│   └── api-notes.ts            # summaries and example responses per endpoint
└── lib/
    ├── openapi.ts              # reads openapi.json: sections, fields, examples
    ├── site.ts                 # site name, API URL, docs menu order
    ├── slug.ts                 # endpoint anchor ids
    └── json.ts
```

### Adding a guide page

1. Create `src/app/docs/<name>/page.tsx`, wrapping the content in `<DocPage href="/docs/<name>/" title="…">`.
2. Add it to `DOCS_NAV` in `src/lib/site.ts`. The sidebar and the previous/next links follow that order.

Link to an endpoint from any page with `<Endpoint method="POST" path="/orgs/{orgId}/team" />`. It opens that endpoint in the API reference.
