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
    <div className="code">
      <div className="code-title">
        <span>{title ?? lang ?? ''}</span>
        <button type="button" className="copy-btn" onClick={copy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>{lang === 'json' ? <JsonColors code={code} /> : code}</pre>
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
        if (p.startsWith('"')) return <span key={i} className={/:\s*$/.test(p) ? 'k' : 's'}>{p}</span>;
        return <span key={i} className="n">{p}</span>;
      })}
    </>
  );
}
