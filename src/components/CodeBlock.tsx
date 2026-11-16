'use client';
import { useState } from 'react';

/** Dark code block with a title and a Copy button. JSON gets light colouring. */
export function CodeBlock({ code, title, lang }: { code: string; title?: string; lang?: 'json' | 'bash' | 'text' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <div className="relative mt-3 mb-5 rounded-lg border border-[color-mix(in_srgb,var(--code-bg)_70%,var(--border))] bg-code">
      <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-2 font-mono text-[12.5px] text-code-faint">
        <span>{title ?? lang ?? ''}</span>
        <button type="button" className="cursor-pointer rounded-md border border-white/15 bg-white/8 px-2.5 py-0.5 text-xs text-code-fg hover:bg-white/16" onClick={copy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-4 py-3.5 font-mono text-[13.5px] leading-[1.6] text-code-fg">{lang === 'json' ? <JsonColors code={code} /> : code}</pre>
    </div>
  );
}

const TOKEN = /("(?:[^"\\]|\\.)*"(?:\s*:)?|-?\b\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)/g;

/** Colours keys, strings and numbers in pretty-printed JSON. */
function JsonColors({ code }: { code: string }) {
  const parts = code.split(TOKEN);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p; // text between tokens
        if (p.startsWith('"')) return <span key={i} className={/:\s*$/.test(p) ? 'text-[#93c5fd]' : 'text-[#86efac]'}>{p}</span>;
        return <span key={i} className="text-[#fca5a5]">{p}</span>;
      })}
    </>
  );
}
