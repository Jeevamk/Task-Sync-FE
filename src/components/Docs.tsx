import Link from 'next/link';
import type { ReactNode } from 'react';
import { slugFor } from '@/lib/slug';
import { DOCS_NAV } from '@/lib/site';

export function Callout({ type = 'info', children }: { type?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const icon = { info: 'ℹ️', warn: '⚠️', ok: '✅' }[type];
  return (
    <div className={`callout callout-${type}`} role="note">
      <span className="callout-icon" aria-hidden="true">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}

export function Table({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Previous / next links, from the order in DOCS_NAV. */
export function Pager({ current }: { current: string }) {
  const all = DOCS_NAV.flatMap((g) => g.items);
  const i = all.findIndex((p) => p.href === current);
  const prev = i > 0 ? all[i - 1] : undefined;
  const next = i >= 0 ? all[i + 1] : undefined;
  return (
    <nav className="pager" aria-label="Previous and next page">
      {prev && (
        <Link href={prev.href}>
          <small>← Previous</small>
          {prev.title}
        </Link>
      )}
      {next && (
        <Link href={next.href} className="next">
          <small>Next →</small>
          {next.title}
        </Link>
      )}
    </nav>
  );
}

/** "POST /orgs" in code style, linking to that endpoint in the API reference. */
export function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <Link href={`/docs/api/#${slugFor(method, path)}`} style={{ whiteSpace: 'nowrap' }}>
      <code>
        {method.toUpperCase()} {path}
      </code>
    </Link>
  );
}

/** Page wrapper for a guide page: title, lead paragraph, content, pager. */
export function DocPage({ href, title, lead, children }: { href: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <article className="prose">
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
      <Pager current={href} />
    </article>
  );
}
