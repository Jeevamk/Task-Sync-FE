'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Auth, Endpoint, Field } from '@/lib/openapi';
import { json } from '@/lib/json';
import { CodeBlock } from './CodeBlock';
import { chip, tableWrap } from './ui';

const METHOD_BG: Record<string, string> = {
  get: 'bg-method-get',
  post: 'bg-method-post',
  delete: 'bg-method-delete',
  head: 'bg-method-head',
};
const tag = 'rounded-full border border-line-strong px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-fg-soft';
const h4 = 'mt-5 mb-2 text-[13px] tracking-[0.08em] text-fg-faint uppercase first:mt-0';
const fieldName = 'font-mono text-[13.5px] whitespace-nowrap text-fg';
const req = 'ml-1 text-xs font-bold text-danger';

type Section = { section: string; title: string; intro: string; endpoints: Endpoint[] };

const AUTH_LABEL: Record<Auth, string> = {
  bearer: '🔒 Bearer token',
  'sync-secret': '🔑 X-Sync-Secret',
  'trello-signature': '✍️ Trello signature',
  none: 'Public',
};

export function ApiReference({ sections }: { sections: Section[] }) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  // Links like /docs/api/#post-orgs open that endpoint.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      setOpenId(id);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

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

  return (
    <>
      <div className="mt-2 mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="api-search" className="sr-only">
          Search endpoints
        </label>
        <input
          id="api-search"
          className="min-w-0 flex-[1_1_260px] rounded-[10px] border border-line-strong bg-surface-elev px-3.5 py-2.5 text-[15px] text-fg"
          type="search"
          placeholder="Search endpoints, e.g. team, cards, webhook…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <nav aria-label="API sections" className="flex flex-wrap gap-1.5">
          {sections.map((s) => (
            <a key={s.section} href={`#section-${s.section.toLowerCase()}`} className={`${chip} hover:no-underline`}>
              {s.title}
            </a>
          ))}
        </nav>
      </div>

      {filtered.length === 0 && <p className="rounded-xl border border-dashed border-line-strong p-6 text-center text-fg-faint">No endpoint matches “{query}”.</p>}

      {filtered.map((s) => (
        <section key={s.section} className="mt-10" id={`section-${s.section.toLowerCase()}`}>
          <h2 className="mt-0">{s.title}</h2>
          {s.intro && <p>{s.intro}</p>}
          {s.endpoints.map((e) => (
            <EndpointCard key={e.id} e={e} open={openId === e.id || !!query.trim()} />
          ))}
        </section>
      ))}
    </>
  );
}

function EndpointCard({ e, open }: { e: Endpoint; open: boolean }) {
  return (
    <details className="group my-4 overflow-hidden rounded-xl border border-line bg-surface-elev" id={e.id} open={open || undefined}>
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3.5 group-open:border-b group-open:border-line hover:bg-surface-soft [&::-webkit-details-marker]:hidden">
        <span className={`inline-block min-w-16 rounded-md px-2 py-1 text-center font-mono text-xs font-extrabold tracking-[0.04em] text-on-method ${METHOD_BG[e.method.toLowerCase()] ?? METHOD_BG.head}`}>{e.method}</span>
        <span className="font-mono text-sm font-semibold [overflow-wrap:anywhere] text-fg">{e.path}</span>
        <span className="ml-auto text-[14.5px] text-fg-soft">{e.summary}</span>
      </summary>
      <div className="px-[18px] pt-[18px] pb-1.5">
        <p className="flex flex-wrap items-center gap-2">
          <span className={tag}>{AUTH_LABEL[e.auth]}</span>
          <span className={tag}>Success: {e.status}</span>
          <a href={`#${e.id}`} className={`${tag} hover:no-underline`} aria-label={`Link to ${e.method} ${e.path}`}>
            # link
          </a>
        </p>
        {e.description && <p>{e.description}</p>}

        {e.note?.guide?.map((g) => (
          <div key={g.title} className="my-5 rounded-lg border border-line bg-surface-soft px-4 py-3">
            <h4 className={h4}>{g.title}</h4>
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
            <h4 className={h4}>Request body{e.bodyName ? ` (${e.bodyName})` : ''}</h4>
            <FieldsTable fields={e.bodyFields} />
          </>
        )}

        <div className="grid gap-x-5 2xl:grid-cols-2">
          {e.bodyExample !== undefined && (
            <div>
              <h4 className={h4}>Example request</h4>
              <CodeBlock lang="json" title={`${e.method} ${e.path}`} code={json(e.bodyExample)} />
            </div>
          )}
          {e.responseExample !== undefined && (
            <div>
              <h4 className={h4}>Example response</h4>
              <CodeBlock lang="json" title={`${e.status} response`} code={json(e.responseExample)} />
            </div>
          )}
        </div>

        {e.note?.tips && (
          <ul className="mt-2 mb-4 list-disc pl-5 text-[14.5px] text-fg-soft">
            {e.note.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
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
