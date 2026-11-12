'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Auth, Endpoint, Field } from '@/lib/openapi';
import { json } from '@/lib/json';
import { CodeBlock } from './CodeBlock';

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
      <div className="api-toolbar">
        <label htmlFor="api-search" className="visually-hidden">
          Search endpoints
        </label>
        <input
          id="api-search"
          className="api-search"
          type="search"
          placeholder="Search endpoints, e.g. team, cards, webhook…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <nav aria-label="API sections" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {sections.map((s) => (
            <a key={s.section} href={`#section-${s.section.toLowerCase()}`} className="chip">
              {s.title}
            </a>
          ))}
        </nav>
      </div>

      {filtered.length === 0 && <p className="empty">No endpoint matches “{query}”.</p>}

      {filtered.map((s) => (
        <section key={s.section} className="api-section" id={`section-${s.section.toLowerCase()}`}>
          <h2>{s.title}</h2>
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
    <details className="endpoint" id={e.id} open={open || undefined}>
      <summary>
        <span className={`method method-${e.method.toLowerCase()}`}>{e.method}</span>
        <span className="endpoint-path">{e.path}</span>
        <span className="endpoint-summary">{e.summary}</span>
      </summary>
      <div className="endpoint-body">
        <p style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span className="auth-tag">{AUTH_LABEL[e.auth]}</span>
          <span className="auth-tag">Success: {e.status}</span>
          <a href={`#${e.id}`} className="auth-tag" aria-label={`Link to ${e.method} ${e.path}`}>
            # link
          </a>
        </p>
        {e.description && <p>{e.description}</p>}

        {e.params.length > 0 && (
          <>
            <h4>Parameters</h4>
            <div className="table-wrap">
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
                        <span className="field-name">{p.name}</span>
                        {p.required && <span className="req">required</span>}
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
            <h4>Request body{e.bodyName ? ` (${e.bodyName})` : ''}</h4>
            <FieldsTable fields={e.bodyFields} />
          </>
        )}

        <div className="two-col">
          {e.bodyExample !== undefined && (
            <div>
              <h4>Example request</h4>
              <CodeBlock lang="json" title={`${e.method} ${e.path}`} code={json(e.bodyExample)} />
            </div>
          )}
          {e.responseExample !== undefined && (
            <div>
              <h4>Example response</h4>
              <CodeBlock lang="json" title={`${e.status} response`} code={json(e.responseExample)} />
            </div>
          )}
        </div>

        {e.note?.tips && (
          <ul className="tips">
            {e.note.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

function FieldsTable({ fields }: { fields: Field[] }) {
  return (
    <div className="table-wrap">
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
    <tr className={parent ? 'nested' : undefined}>
      <td>
        <span className="field-name">{parent ? `${parent}[].${f.name}` : f.name}</span>
        {f.required && <span className="req">required</span>}
      </td>
      <td>
        <span className="type">{f.type}</span>
      </td>
      <td>{f.description || '—'}</td>
    </tr>
  );
}
