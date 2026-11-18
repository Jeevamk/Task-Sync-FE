'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMe, loadSession } from '@/lib/auth';
import type { Auth, Endpoint, Field } from '@/lib/openapi';
import { json } from '@/lib/json';
import { ApiConsole, type Credentials } from './ApiConsole';
import { CodeBlock } from './CodeBlock';
import { tableWrap } from './ui';

const METHOD_BG: Record<string, string> = {
  get: 'bg-method-get',
  post: 'bg-method-post',
  delete: 'bg-method-delete',
  head: 'bg-method-head',
};
const METHOD_FG: Record<string, string> = {
  get: 'text-method-get',
  post: 'text-method-post',
  delete: 'text-method-delete',
  head: 'text-method-head',
};
const tag = 'rounded-full border border-line-strong px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-fg-soft';
const h4 = 'mt-6 mb-2 text-[13px] tracking-[0.08em] text-fg-faint uppercase';
const fieldName = 'font-mono text-[13.5px] whitespace-nowrap text-fg';
const req = 'ml-1 text-xs font-bold text-danger';
const input = 'w-full rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-[13.5px] text-fg focus:border-brand focus:outline-none';

type Section = { section: string; title: string; intro: string; endpoints: Endpoint[] };

const AUTH_LABEL: Record<Auth, string> = {
  bearer: '🔒 Bearer token',
  'sync-secret': '🔑 X-Sync-Secret',
  'trello-signature': '✍️ Trello signature',
  none: 'Public',
};

const TOKEN_KEY = 'taskvane.apiToken';
const VALUES_KEY = 'taskvane.apiValues';

function readStore(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* storage blocked: values last until the page is closed */
  }
}

/** Which remembered value a successful response fills in, e.g. POST /orgs → orgId. */
const CAPTURE: Record<string, string> = {
  'POST /orgs': 'orgId',
  'POST /orgs/{orgId}/projects': 'projectId',
  'POST /orgs/{orgId}/team': 'memberId',
  'POST /auth/tokens': 'tokenId',
};

export function ApiReference({ sections }: { sections: Section[] }) {
  const all = useMemo(() => sections.flatMap((s) => s.endpoints), [sections]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(all[0]?.id ?? '');

  // ---- credentials shared by every console ----
  const [token, setToken] = useState('');
  const [tokenSource, setTokenSource] = useState<'google' | 'pasted' | 'response' | null>(null);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [me, setMe] = useState<{ email: string } | null>(null);
  const [meError, setMeError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  // Browser-only state: the URL hash, a pasted token, remembered IDs, the Google session.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && all.some((e) => e.id === id)) setSelectedId(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('popstate', fromHash);

    const pasted = readStore(TOKEN_KEY);
    const session = loadSession();
    if (pasted) {
      setToken(pasted);
      setTokenSource('pasted');
    } else if (session) {
      setToken(session.token);
      setTokenSource('google');
    }
    try {
      setValues(JSON.parse(readStore(VALUES_KEY) ?? '{}'));
    } catch {
      /* ignore a damaged value */
    }
    return () => {
      window.removeEventListener('hashchange', fromHash);
      window.removeEventListener('popstate', fromHash);
    };
  }, [all]);

  // Check the token and load the user's organizations (debounced while typing).
  const refreshMe = useCallback((t: string) => {
    setMeError(null);
    if (!t) {
      setMe(null);
      setOrgs([]);
      return;
    }
    fetchMe(t).then(
      (m) => {
        setMe({ email: m.email });
        setOrgs(m.organizations.map((o) => ({ id: o.id, name: o.name })));
        // One organization? Pick it so /orgs/{orgId}/… routes work straight away.
        if (m.organizations.length === 1) setValues((v) => (v.orgId ? v : { ...v, orgId: m.organizations[0].id }));
      },
      (err: unknown) => {
        setMe(null);
        setOrgs([]);
        setMeError(err instanceof Error ? err.message : String(err));
      },
    );
  }, []);
  useEffect(() => {
    const t = setTimeout(() => refreshMe(token.trim()), 400);
    return () => clearTimeout(t);
  }, [token, refreshMe]);

  useEffect(() => writeStore(VALUES_KEY, JSON.stringify(values)), [values]);

  const changeToken = (t: string, source: 'pasted' | 'response') => {
    setToken(t);
    setTokenSource(t ? source : null);
    writeStore(TOKEN_KEY, t || null);
  };

  const creds: Credentials = {
    token: token.trim(),
    orgs,
    values,
    setValue: (name, value) => setValues((v) => ({ ...v, [name]: value })),
    onSuccess: (e, body) => {
      const b = body as Record<string, unknown> | undefined;
      const key = CAPTURE[`${e.method} ${e.path}`];
      if (key && typeof b?.id === 'string') setValues((v) => ({ ...v, [key]: b.id as string }));
      if (e.path === '/auth/dev-login' || e.path === '/auth/google') {
        if (typeof b?.token === 'string') changeToken(b.token, 'response');
      }
      if (e.method === 'POST' && e.path === '/orgs') refreshMe(token.trim());
    },
  };

  const select = (id: string) => {
    setSelectedId(id);
    history.pushState(null, '', `#${id}`);
    document.getElementById('api-detail')?.scrollIntoView({ block: 'nearest' });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        endpoints: s.endpoints.filter((e) => `${e.method} ${e.path} ${e.summary} ${e.description ?? ''} ${s.title}`.toLowerCase().includes(q)),
      }))
      .filter((s) => s.endpoints.length);
  }, [query, sections]);

  const selected = all.find((e) => e.id === selectedId) ?? all[0];
  const selectedSection = sections.find((s) => s.endpoints.includes(selected));

  return (
    <div>
      <AuthBar token={token} source={tokenSource} me={me} error={meError} orgs={orgs} orgId={values.orgId ?? ''} onToken={(t) => changeToken(t, 'pasted')} onOrg={(id) => creds.setValue('orgId', id)} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Endpoint list */}
        <aside className="lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-110px)] lg:self-start lg:overflow-y-auto" aria-label="Endpoints">
          <label htmlFor="api-search" className="sr-only">
            Search endpoints
          </label>
          <input id="api-search" className={`${input} font-sans`} type="search" placeholder="Search endpoints…" value={query} onChange={(e) => setQuery(e.target.value)} />

          {/* Small screens: a dropdown instead of the long list */}
          <select className={`${input} mt-2 font-sans lg:hidden`} value={selected?.id} onChange={(e) => select(e.target.value)} aria-label="Choose an endpoint">
            {filtered.map((s) => (
              <optgroup key={s.section} label={s.title}>
                {s.endpoints.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.method} {e.path}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <nav className="hidden lg:block">
            {filtered.length === 0 && <p className="mt-4 text-[14px] text-fg-faint">No endpoint matches “{query}”.</p>}
            {filtered.map((s) => (
              <div key={s.section}>
                <h4 className="mt-5 mb-1.5 text-xs tracking-[0.1em] text-fg-faint uppercase">{s.title}</h4>
                <ul>
                  {s.endpoints.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => select(e.id)}
                        aria-current={e.id === selected?.id ? 'true' : undefined}
                        className="flex w-full cursor-pointer items-baseline gap-2 rounded-md px-2 py-[5px] text-left text-[14px] text-fg-soft hover:bg-surface-soft hover:text-fg aria-[current=true]:bg-brand-soft aria-[current=true]:font-semibold aria-[current=true]:text-brand"
                      >
                        <span className={`w-11 flex-none font-mono text-[11px] font-extrabold ${METHOD_FG[e.method.toLowerCase()] ?? METHOD_FG.head}`}>{e.method === 'DELETE' ? 'DEL' : e.method}</span>
                        <span className="min-w-0">{e.summary}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Selected endpoint */}
        {selected && (
          <section id="api-detail" className="min-w-0 scroll-mt-24" aria-live="polite">
            <EndpointDetail key={selected.id} e={selected} sectionIntro={selectedSection?.intro} creds={creds} />
          </section>
        )}
      </div>
    </div>
  );
}

function AuthBar({
  token,
  source,
  me,
  error,
  orgs,
  orgId,
  onToken,
  onOrg,
}: {
  token: string;
  source: 'google' | 'pasted' | 'response' | null;
  me: { email: string } | null;
  error: string | null;
  orgs: { id: string; name: string }[];
  orgId: string;
  onToken: (t: string) => void;
  onOrg: (id: string) => void;
}) {
  const [show, setShow] = useState(false);
  const status = !token.trim()
    ? { tone: 'bg-warn-soft text-warn', text: 'Not authorized' }
    : me
      ? { tone: 'bg-ok-soft text-ok', text: `Authorized as ${me.email}` }
      : error
        ? { tone: 'bg-danger-soft text-danger', text: 'Token refused' }
        : { tone: 'bg-surface-soft text-fg-soft', text: 'Checking token…' };

  return (
    <div className="rounded-xl border border-line bg-surface-elev p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="!m-0 text-[16px] font-bold">Authorization</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${status.tone}`}>{status.text}</span>
      </div>
      <p className="!mt-1 !mb-3 text-[14px] text-fg-soft">
        {source === 'google'
          ? 'Using the token from your Google sign-in. Every request below sends it for you.'
          : source === 'response'
            ? 'Using the token from your last login response.'
            : (
              <>
                <Link href="/login/">Sign in with Google</Link> and come back, or paste a token (<code>eyJ…</code> or <code>tv_pat_…</code>). It is kept only in this browser tab.
              </>
            )}
      </p>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <label htmlFor="api-token" className="mb-1 block text-[13px] font-semibold text-fg-soft">
            Bearer token
          </label>
          <div className="flex gap-2">
            <input id="api-token" className={input} type={show ? 'text' : 'password'} value={token} onChange={(e) => onToken(e.target.value)} placeholder="Paste your token" autoComplete="off" spellCheck={false} />
            <button type="button" className="cursor-pointer rounded-lg border border-line-strong px-3 text-[13px] text-fg-soft hover:text-fg" onClick={() => setShow((s) => !s)}>
              {show ? 'Hide' : 'Show'}
            </button>
            {token && (
              <button type="button" className="cursor-pointer rounded-lg border border-line-strong px-3 text-[13px] text-fg-soft hover:text-fg" onClick={() => onToken('')}>
                Clear
              </button>
            )}
          </div>
          {error && token.trim() && <p className="!mt-1 !mb-0 text-[13px] text-danger">{error}</p>}
        </div>
        <div>
          <label htmlFor="api-org" className="mb-1 block text-[13px] font-semibold text-fg-soft">
            Organization <span className="font-normal text-fg-faint">(fills orgId)</span>
          </label>
          <select id="api-org" className={input} value={orgId} onChange={(e) => onOrg(e.target.value)} disabled={!orgs.length}>
            <option value="">{orgs.length ? 'Choose…' : 'None yet: create one with POST /orgs'}</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
            {orgId && !orgs.some((o) => o.id === orgId) && <option value={orgId}>{orgId}</option>}
          </select>
        </div>
      </div>
    </div>
  );
}

function EndpointDetail({ e, sectionIntro, creds }: { e: Endpoint; sectionIntro?: string; creds: Credentials }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-block min-w-16 rounded-md px-2 py-1 text-center font-mono text-xs font-extrabold tracking-[0.04em] text-on-method ${METHOD_BG[e.method.toLowerCase()] ?? METHOD_BG.head}`}>{e.method}</span>
        <code className="font-mono text-[15px] font-semibold [overflow-wrap:anywhere] text-fg">{e.path}</code>
      </div>
      <h2 className="!mt-3 !mb-2 text-[24px] font-bold">{e.summary}</h2>
      <p className="!mt-0 flex flex-wrap items-center gap-2">
        <span className={tag}>{AUTH_LABEL[e.auth]}</span>
        <span className={tag}>Success: {e.status}</span>
      </p>
      {e.description ? <p className="text-fg-soft">{e.description}</p> : sectionIntro && <p className="text-fg-soft">{sectionIntro}</p>}

      <div className="mt-5">
        <ApiConsole e={e} creds={creds} />
      </div>

      {e.note?.guide?.map((g) => (
        <div key={g.title} className="my-5 rounded-lg border border-line bg-surface-soft px-4 py-3">
          <h4 className={`${h4} !mt-1`}>{g.title}</h4>
          {g.intro && (
            <p className="text-[14.5px]">
              <Rich text={g.intro} />
            </p>
          )}
          <ol className="mb-2 list-decimal space-y-1.5 pl-5 text-[14.5px]">
            {g.steps.map((s) => (
              <li key={s}>
                <Rich text={s} />
              </li>
            ))}
          </ol>
          {g.code && <CodeBlock lang={g.code.lang} title={g.code.title} code={g.code.code} />}
        </div>
      ))}

      {e.params.length > 0 && (
        <>
          <h4 className={h4}>Parameters</h4>
          <div className={tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>In</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {e.params.map((p) => (
                  <tr key={p.name}>
                    <td>
                      <span className={fieldName}>{p.name}</span>
                      {p.required && <span className={req}>required</span>}
                    </td>
                    <td>{p.in}</td>
                    <td>{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {e.bodyFields.length > 0 && (
        <>
          <h4 className={h4}>Body fields{e.bodyName ? ` (${e.bodyName})` : ''}</h4>
          <FieldsTable fields={e.bodyFields} />
        </>
      )}

      {e.responseExample !== undefined && (
        <>
          <h4 className={h4}>Example response</h4>
          <CodeBlock lang="json" title={`${e.status} response`} code={json(e.responseExample)} />
        </>
      )}

      {e.note?.tips && (
        <ul className="mt-2 mb-4 list-disc pl-5 text-[14.5px] text-fg-soft">
          {e.note.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Plain text with `code` spans and clickable https:// links (for guide steps). */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|https:\/\/[^\s)]+)/g).map((part, i) => {
        if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
        if (part.startsWith('https://'))
          return (
            <a key={i} href={part} target="_blank" rel="noreferrer">
              {part.replace('https://', '')}
            </a>
          );
        return part;
      })}
    </>
  );
}

function FieldsTable({ fields }: { fields: Field[] }) {
  return (
    <div className={tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.flatMap((f) => [
            <FieldRow key={f.name} f={f} />,
            ...(f.children ?? []).map((c) => <FieldRow key={`${f.name}.${c.name}`} f={c} parent={f.name} />),
          ])}
        </tbody>
      </table>
    </div>
  );
}

function FieldRow({ f, parent }: { f: Field; parent?: string }) {
  return (
    <tr className={parent ? '[&>td:first-child]:pl-8' : undefined}>
      <td>
        <span className={fieldName}>{parent ? `${parent}[].${f.name}` : f.name}</span>
        {f.required && <span className={req}>required</span>}
      </td>
      <td>
        <span className="font-mono text-[12.5px] text-brand">{f.type}</span>
      </td>
      <td>{f.description || '—'}</td>
    </tr>
  );
}
