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
| `NEXT_PUBLIC_API_URL` | The API this site calls (sign-in) and links to (live Swagger), e.g. `https://task-sync-api.vercel.app` (no `/` at the end) | `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | The "Sign in with Google" button on `/login/`. The **same** client ID as `GOOGLE_OAUTH_CLIENT_ID` in the API | empty (the sign-in page says it is not set up) |

Both are read **at build time**. Set them in your host's environment settings, then build (or redeploy) again.

## Sign in with Google (one-time setup, for whoever runs Taskvane)

Users only click **Sign in with Google** on `/login/`. They never need a client ID, a secret or Vercel. To make the button work:

1. **Google Cloud Console → APIs & Services → Credentials** → open the OAuth client (type *Web application*) whose ID is in the API's `GOOGLE_OAUTH_CLIENT_ID`.
2. Under **Authorized JavaScript origins**, add this site's addresses, without a path or `/` at the end:
   - `http://localhost:3001` and `http://localhost` (local)
   - your live address, e.g. `https://taskvane.vercel.app`
3. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on this site to that client ID (only the ID, never the secret).
4. On the **API**, set `WEB_APP_URL` to this site's address (e.g. `https://taskvane.vercel.app`). The API only accepts browser requests from that address (CORS); without it, sign-in fails with "Could not reach the Taskvane API".
5. Redeploy both.

How it works: Google's button gives the browser an ID token, the page sends it to `POST /auth/google`, and the API checks it with Google and returns a Taskvane token (valid 7 days), which the page saves in the browser.

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
