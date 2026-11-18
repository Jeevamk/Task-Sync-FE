'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Endpoint } from '@/lib/openapi';
import { json } from '@/lib/json';
import { API_URL } from '@/lib/site';
import { CodeBlock } from './CodeBlock';
import { btn, btnGhost, btnPrimary } from './ui';

/** Values shared by every endpoint's console: the token, the org list and IDs remembered from earlier calls. */
export type Credentials = {
  token: string;
  orgs: { id: string; name: string }[];
  /** Path/query values typed or captured so far, e.g. { orgId: "…", projectId: "…" }. */
  values: Record<string, string>;
  setValue: (name: string, value: string) => void;
  /** Called after a successful request so IDs and tokens in the answer can be reused. */
  onSuccess: (e: Endpoint, body: unknown) => void;
};

type Result =
  | { kind: 'response'; status: number; statusText: string; ms: number; body: string; isJson: boolean; download?: { url: string; name: string } }
  | { kind: 'error'; message: string };

const label = 'mb-1 block text-[13px] font-semibold text-fg-soft';
const input = 'w-full rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-[13.5px] text-fg focus:border-brand focus:outline-none';

export function ApiConsole({ e, creds }: { e: Endpoint; creds: Credentials }) {
  const initialBody = e.bodyExample !== undefined ? json(e.bodyExample) : '';
  const [body, setBody] = useState(initialBody);
  const [syncSecret, setSyncSecret] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [showCurl, setShowCurl] = useState(false);
  const downloadUrl = useRef<string | null>(null);

  // A different endpoint starts from a clean console.
  useEffect(() => {
    setBody(initialBody);
    setResult(null);
  }, [e.id, initialBody]);
  useEffect(() => () => void (downloadUrl.current && URL.revokeObjectURL(downloadUrl.current)), []);

  const hasBody = e.bodyExample !== undefined || e.bodyFields.length > 0;
  const missing = e.params.filter((p) => p.required && !creds.values[p.name]?.trim()).map((p) => p.name);
  const url = buildUrl(e, creds.values);
  const headers = buildHeaders(e, creds.token, syncSecret, hasBody);

  let bodyError: string | null = null;
  if (hasBody && body.trim()) {
    try {
      JSON.parse(body);
    } catch (err) {
      bodyError = err instanceof Error ? err.message : 'Invalid JSON';
    }
  }

  const send = async () => {
    if (missing.length || bodyError || sending) return;
    if (e.method === 'DELETE' && !window.confirm(`Really send ${e.method} ${url.replace(API_URL, '')}? This deletes real data.`)) return;
    setSending(true);
    setResult(null);
    const started = performance.now();
    try {
      const res = await fetch(url, { method: e.method, headers, body: hasBody && body.trim() ? body : undefined });
      const ms = Math.round(performance.now() - started);
      const type = res.headers.get('content-type') ?? '';
      if (res.ok && !type.includes('json') && !type.startsWith('text/')) {
        // A file (e.g. the sheet template): offer it as a download instead of printing bytes.
        const blob = await res.blob();
        if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
        downloadUrl.current = URL.createObjectURL(blob);
        const ext = type.includes('spreadsheet') ? 'xlsx' : type.includes('csv') ? 'csv' : 'bin';
        setResult({ kind: 'response', status: res.status, statusText: res.statusText, ms, body: `${blob.size} bytes (${type || 'binary'})`, isJson: false, download: { url: downloadUrl.current, name: `download.${ext}` } });
        return;
      }
      const text = await res.text();
      let parsed: unknown;
      let isJson = false;
      try {
        parsed = JSON.parse(text);
        isJson = true;
      } catch {
        /* plain text answer */
      }
      setResult({ kind: 'response', status: res.status, statusText: res.statusText, ms, body: isJson ? json(parsed) : text || '(empty body)', isJson });
      if (res.ok) creds.onSuccess(e, parsed);
    } catch {
      setResult({
        kind: 'error',
        message: `Could not reach the API at ${API_URL}. Check that it is running, and that its WEB_APP_URL setting is this site's address (${window.location.origin}) so the browser is allowed to call it.`,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-elev">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-soft px-4 py-2.5">
        <span className="text-[13px] font-bold tracking-[0.08em] text-fg-faint uppercase">Try it</span>
        <span className="truncate font-mono text-[12.5px] text-fg-faint" title={url}>
          {url}
        </span>
      </div>

      <div className="space-y-4 p-4" onKeyDown={(ev) => ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && send()}>
        {e.auth === 'bearer' && !creds.token && (
          <p className="!m-0 rounded-lg bg-warn-soft px-3 py-2 text-[14px]">
            This endpoint needs a token. <Link href="/login/">Sign in with Google</Link> or paste a token in <strong>Authorization</strong> above.
          </p>
        )}
        {e.auth === 'trello-signature' && (
          <p className="!m-0 rounded-lg bg-surface-soft px-3 py-2 text-[14px] text-fg-soft">Trello calls this one itself and signs it, so a request from here will normally be refused.</p>
        )}

        {e.params.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {e.params.map((p) => (
              <ParamInput key={p.name} p={p} value={creds.values[p.name] ?? ''} onChange={(v) => creds.setValue(p.name, v)} orgs={creds.orgs} />
            ))}
          </div>
        )}

        {e.auth === 'sync-secret' && (
          <div>
            <label className={label} htmlFor={`${e.id}-secret`}>
              X-Sync-Secret <span className="font-normal text-fg-faint">(the SHEETS_SYNC_SECRET of the API)</span>
            </label>
            <input id={`${e.id}-secret`} className={input} type="password" value={syncSecret} onChange={(ev) => setSyncSecret(ev.target.value)} autoComplete="off" />
          </div>
        )}

        {hasBody && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className={label + ' !mb-0'} htmlFor={`${e.id}-body`}>
                Request body (JSON)
              </label>
              {body !== initialBody && (
                <button type="button" className="cursor-pointer text-[13px] text-brand hover:underline" onClick={() => setBody(initialBody)}>
                  Reset to example
                </button>
              )}
            </div>
            <textarea
              id={`${e.id}-body`}
              className={`${input} min-h-[160px] resize-y leading-[1.55]`}
              spellCheck={false}
              value={body}
              onChange={(ev) => setBody(ev.target.value)}
              rows={Math.min(18, Math.max(6, body.split('\n').length + 1))}
            />
            {bodyError && <p className="!mt-1 !mb-0 text-[13px] text-danger">Not valid JSON: {bodyError}</p>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={send}
            disabled={sending || missing.length > 0 || !!bodyError}
            className={`${btn} ${btnPrimary} cursor-pointer px-5 py-2 text-[14px] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`}
          >
            {sending ? 'Sending…' : `Send ${e.method}`}
          </button>
          <button type="button" onClick={() => setShowCurl((s) => !s)} className={`${btn} ${btnGhost} cursor-pointer px-3 py-2 text-[13px]`}>
            {showCurl ? 'Hide' : 'Show'} cURL
          </button>
          {missing.length > 0 ? (
            <span className="text-[13px] text-fg-faint">Fill in: {missing.join(', ')}</span>
          ) : (
            <span className="hidden text-[13px] text-fg-faint sm:inline">Ctrl + Enter to send</span>
          )}
        </div>

        {showCurl && <CodeBlock lang="bash" title="cURL" code={curlFor(e.method, url, headers, hasBody && body.trim() ? body : undefined)} />}

        {result && <ResultView r={result} />}
      </div>
    </div>
  );
}

function ParamInput({
  p,
  value,
  onChange,
  orgs,
}: {
  p: Endpoint['params'][number];
  value: string;
  onChange: (v: string) => void;
  orgs: Credentials['orgs'];
}) {
  const id = `param-${p.name}`;
  const options = p.name === 'orgId' ? orgs.map((o) => ({ value: o.id, label: o.name })) : p.name === 'provider' ? ['trello', 'slack', 'google'].map((v) => ({ value: v, label: v })) : [];
  return (
    <div>
      <label className={label} htmlFor={id}>
        {p.name}
        {p.required && <span className="ml-1 text-xs font-bold text-danger">*</span>}
        <span className="ml-1.5 font-normal text-fg-faint">{p.in}</span>
      </label>
      {options.length > 0 ? (
        <select id={id} className={input} value={value} onChange={(ev) => onChange(ev.target.value)}>
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
              {o.label !== o.value ? ` (${o.value.slice(0, 8)}…)` : ''}
            </option>
          ))}
          {value && !options.some((o) => o.value === value) && <option value={value}>{value}</option>}
        </select>
      ) : (
        <input id={id} className={input} value={value} onChange={(ev) => onChange(ev.target.value)} placeholder={p.description || p.name} autoComplete="off" />
      )}
      {p.description && <p className="!mt-1 !mb-0 text-[12.5px] text-fg-faint">{p.description}</p>}
    </div>
  );
}

function ResultView({ r }: { r: Result }) {
  if (r.kind === 'error') return <p className="!m-0 rounded-lg bg-danger-soft px-3 py-2.5 text-[14px]">{r.message}</p>;
  const ok = r.status < 400;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="font-bold tracking-[0.08em] text-fg-faint uppercase">Response</span>
        <span className={`rounded-full px-2.5 py-0.5 font-mono font-bold ${ok ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger'}`}>
          {r.status} {r.statusText}
        </span>
        <span className="text-fg-faint">{r.ms} ms</span>
        {r.download && (
          <a href={r.download.url} download={r.download.name} className="font-semibold">
            Download file
          </a>
        )}
      </div>
      <CodeBlock lang={r.isJson ? 'json' : 'text'} title={ok ? 'Body' : 'Error'} code={r.body} />
    </div>
  );
}

function buildUrl(e: Endpoint, values: Record<string, string>): string {
  const path = e.path.replace(/\{(\w+)\}/g, (whole, name: string) => (values[name]?.trim() ? encodeURIComponent(values[name].trim()) : whole));
  const query = new URLSearchParams();
  for (const p of e.params) if (p.in === 'query' && values[p.name]?.trim()) query.set(p.name, values[p.name].trim());
  const qs = query.toString();
  return `${API_URL}${path}${qs ? `?${qs}` : ''}`;
}

function buildHeaders(e: Endpoint, token: string, syncSecret: string, hasBody: boolean): Record<string, string> {
  const h: Record<string, string> = {};
  if (hasBody) h['Content-Type'] = 'application/json';
  if (e.auth === 'bearer' && token) h.Authorization = `Bearer ${token}`;
  if (e.auth === 'sync-secret' && syncSecret) h['X-Sync-Secret'] = syncSecret;
  return h;
}

function curlFor(method: string, url: string, headers: Record<string, string>, body?: string): string {
  const q = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
  const lines = [`curl -X ${method} ${q(url)}`];
  for (const [k, v] of Object.entries(headers)) lines.push(`  -H ${q(`${k}: ${k === 'Authorization' ? 'Bearer <your token>' : k === 'X-Sync-Secret' ? '<secret>' : v}`)}`);
  if (body) lines.push(`  -d ${q(JSON.stringify(JSON.parse(body)))}`);
  return lines.join(' \\\n');
}
