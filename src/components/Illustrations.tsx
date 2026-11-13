/**
 * Flow illustrations, drawn as inline SVG so they stay sharp and follow light/dark mode.
 * Colours come from the CSS tokens in globals.css.
 */
import type { CSSProperties } from 'react';

const fill = (token: string): CSSProperties => ({ fill: `var(--${token})` });
const stroke = (token: string, width = 1.5): CSSProperties => ({ stroke: `var(--${token})`, strokeWidth: width, fill: 'none' });
const box = (bg: string, line = 'border'): CSSProperties => ({ fill: `var(--${bg})`, stroke: `var(--${line})`, strokeWidth: 1.5 });

/* ───────────── Hero: Trello → Taskvane → Sheet + Slack ───────────── */
export function FlowDiagram() {
  return (
    <svg className="art" viewBox="0 0 560 380" role="img" aria-labelledby="flow-title flow-desc">
      <title id="flow-title">How Taskvane connects your tools</title>
      <desc id="flow-desc">A card moved on a Trello board goes to Taskvane, which updates the Google Sheet and posts to a Slack thread.</desc>

      {/* Trello board */}
      <g transform="translate(12 92)">
        <rect width="168" height="196" rx="14" style={box('bg-elev')} />
        <rect width="168" height="34" rx="14" style={fill('trello')} />
        <rect y="20" width="168" height="14" style={fill('trello')} />
        <text x="14" y="22" fontSize="13" fontWeight="700" fill="#fff">Trello board</text>
        {['To Do', 'In Progress', 'Done'].map((name, i) => (
          <g key={name} transform={`translate(${10 + i * 52} 46)`}>
            <rect width="46" height="138" rx="7" style={fill('trello-soft')} />
            <text x="5" y="14" fontSize="7.5" fontWeight="700" style={fill('text-soft')}>{name}</text>
            {[0, 1, 2].slice(0, 3 - i).map((c) => (
              <rect key={c} x="4" y={22 + c * 26} width="38" height="20" rx="4" style={box('bg-elev')} />
            ))}
          </g>
        ))}
        {/* card being moved */}
        <g transform="translate(70 118) rotate(-6)">
          <rect width="44" height="22" rx="4" style={{ ...fill('bg-elev'), stroke: 'var(--trello)', strokeWidth: 2 }} />
          <rect x="6" y="7" width="28" height="3" rx="1.5" style={fill('trello')} />
          <rect x="6" y="13" width="18" height="3" rx="1.5" style={fill('border-strong')} />
        </g>
      </g>

      {/* hub */}
      <g transform="translate(218 130)">
        <rect width="124" height="120" rx="18" style={{ ...fill('brand'), filter: 'drop-shadow(0 8px 18px rgb(79 70 229 / 0.35))' }} />
        <g transform="translate(46 18)" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M2 12a12 12 0 0 1 21-8" />
          <path d="M24 0v6h-6" strokeLinejoin="round" />
          <path d="M30 20a12 12 0 0 1-21 8" />
          <path d="M8 32v-6h6" strokeLinejoin="round" />
        </g>
        <text x="62" y="78" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">Taskvane</text>
        <text x="62" y="97" textAnchor="middle" fontSize="9.5" fill="#e0e7ff">records · checks rules</text>
        <text x="62" y="110" textAnchor="middle" fontSize="9.5" fill="#e0e7ff">keeps history</text>
      </g>

      {/* connectors */}
      <path d="M180 190 H218" className="flow-dash" style={stroke('trello', 2.5)} />
      <path d="M342 168 C 372 168, 372 96, 392 96" className="flow-dash" style={stroke('sheet', 2.5)} />
      <path d="M342 212 C 372 212, 372 284, 392 284" className="flow-dash" style={stroke('slack', 2.5)} />
      <circle cx="218" cy="190" r="4" style={fill('trello')} />
      <circle cx="392" cy="96" r="4" style={fill('sheet')} />
      <circle cx="392" cy="284" r="4" style={fill('slack')} />
      <text x="199" y="180" textAnchor="middle" fontSize="9" style={fill('text-faint')}>webhook</text>

      {/* sheet */}
      <g transform="translate(392 26)">
        <rect width="156" height="140" rx="14" style={box('bg-elev')} />
        <rect width="156" height="32" rx="14" style={fill('sheet')} />
        <rect y="18" width="156" height="14" style={fill('sheet')} />
        <text x="14" y="21" fontSize="13" fontWeight="700" fill="#fff">Google Sheet</text>
        {[0, 1, 2, 3].map((r) => (
          <g key={r} transform={`translate(10 ${42 + r * 22})`}>
            <rect width="136" height="18" rx="3" style={r === 1 ? { ...fill('sheet-soft'), stroke: 'var(--sheet)', strokeWidth: 1.2 } : fill('bg-soft')} />
            <rect x="6" y="7" width="24" height="4" rx="2" style={fill(r === 0 ? 'text-soft' : 'border-strong')} />
            <rect x="38" y="7" width="44" height="4" rx="2" style={fill(r === 0 ? 'text-soft' : 'border-strong')} />
            <rect x="90" y="7" width="36" height="4" rx="2" style={fill(r === 1 ? 'sheet' : r === 0 ? 'text-soft' : 'border-strong')} />
          </g>
        ))}
      </g>

      {/* slack */}
      <g transform="translate(392 214)">
        <rect width="156" height="140" rx="14" style={box('bg-elev')} />
        <rect width="156" height="32" rx="14" style={fill('slack')} />
        <rect y="18" width="156" height="14" style={fill('slack')} />
        <text x="14" y="21" fontSize="13" fontWeight="700" fill="#fff">Slack thread</text>
        <circle cx="22" cy="52" r="8" style={fill('brand')} />
        <rect x="36" y="45" width="70" height="5" rx="2.5" style={fill('text-soft')} />
        <rect x="36" y="55" width="100" height="4" rx="2" style={fill('border-strong')} />
        <path d="M22 66 V 124" style={stroke('border-strong', 1.5)} />
        {[0, 1].map((r) => (
          <g key={r} transform={`translate(30 ${74 + r * 26})`}>
            <rect width="116" height="20" rx="5" style={fill(r === 1 ? 'slack-soft' : 'bg-soft')} />
            <rect x="8" y="8" width={r ? 84 : 64} height="4" rx="2" style={fill(r === 1 ? 'slack' : 'border-strong')} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ───────────── Step 1: a card moves on the board ───────────── */
export function BoardArt() {
  const lists = ['To Do', 'Assigned', 'In Progress', 'Ready for Testing', 'Completed'];
  const counts = [3, 1, 1, 1, 2];
  return (
    <svg className="art" viewBox="0 0 520 300" role="img" aria-labelledby="board-title">
      <title id="board-title">A Trello board with the five status lists; a card is moved from Assigned to In Progress</title>
      <rect width="520" height="300" rx="16" style={fill('trello-soft')} />
      {lists.map((name, i) => (
        <g key={name} transform={`translate(${14 + i * 101} 18)`}>
          <rect width="92" height="264" rx="10" style={box('bg-elev')} />
          <text x="10" y="22" fontSize="10.5" fontWeight="700" style={fill('text')}>{name}</text>
          {Array.from({ length: counts[i] }).map((_, c) => (
            <g key={c} transform={`translate(8 ${36 + c * 50})`}>
              <rect width="76" height="42" rx="6" style={box('bg-soft')} />
              <rect x="8" y="10" width="50" height="5" rx="2.5" style={fill('border-strong')} />
              <rect x="8" y="22" width="32" height="5" rx="2.5" style={fill('border')} />
              {i > 0 && <circle cx="64" cy="31" r="6" style={fill(i === 4 ? 'ok' : 'brand')} />}
            </g>
          ))}
        </g>
      ))}
      {/* ghost where the card was */}
      <rect x="123" y="104" width="76" height="42" rx="6" style={{ fill: 'none', stroke: 'var(--border-strong)', strokeDasharray: '4 4', strokeWidth: 1.5 }} />
      {/* moving card */}
      <g transform="translate(232 128) rotate(4)">
        <rect width="80" height="46" rx="7" style={{ ...fill('bg-elev'), stroke: 'var(--trello)', strokeWidth: 2.5, filter: 'drop-shadow(0 8px 14px rgb(12 102 228 / 0.3))' }} />
        <text x="8" y="17" fontSize="9" fontWeight="700" style={fill('trello')}>TASK-7</text>
        <text x="8" y="31" fontSize="8.5" style={fill('text-soft')}>Fix login button</text>
        <circle cx="68" cy="36" r="6" style={fill('brand')} />
      </g>
      <path d="M200 124 C 214 112, 222 116, 230 128" style={{ ...stroke('trello', 2.5), markerEnd: 'url(#arrow-trello)' }} />
      <defs>
        <marker id="arrow-trello" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" style={fill('trello')} />
        </marker>
      </defs>
    </svg>
  );
}

/* ───────────── Step 2: Taskvane records and checks ───────────── */
export function RulesArt() {
  const rows = [
    { icon: '✓', label: 'Recorded TASK-7: Assigned → In Progress', tone: 'ok' },
    { icon: '✓', label: 'Mover Athira is the assignee: move allowed', tone: 'ok' },
    { icon: '✓', label: 'Started At = 2026-11-12 22:55', tone: 'ok' },
    { icon: '✓', label: 'History row saved', tone: 'ok' },
  ];
  return (
    <svg className="art" viewBox="0 0 520 300" role="img" aria-labelledby="rules-title">
      <title id="rules-title">Taskvane records the change, checks the team rules and saves the history; a rule-breaking move is flagged</title>
      <rect width="520" height="300" rx="16" style={fill('brand-soft')} />
      <g transform="translate(24 22)">
        <rect width="472" height="176" rx="12" style={box('bg-elev')} />
        <text x="18" y="30" fontSize="13" fontWeight="800" style={fill('text')}>Event received from Trello</text>
        <text x="454" y="30" textAnchor="end" fontSize="10" className="mono" style={fill('text-faint')}>updateCard · 0.2s</text>
        {rows.map((r, i) => (
          <g key={r.label} transform={`translate(18 ${50 + i * 30})`}>
            <circle cx="10" cy="10" r="10" style={fill(`${r.tone}-soft`)} />
            <text x="10" y="14" textAnchor="middle" fontSize="11" fontWeight="800" style={fill(r.tone)}>{r.icon}</text>
            <text x="30" y="14" fontSize="12" style={fill('text-soft')}>{r.label}</text>
          </g>
        ))}
      </g>
      <g transform="translate(24 212)">
        <rect width="472" height="66" rx="12" style={{ ...fill('warn-soft'), stroke: 'var(--warn)', strokeWidth: 1.5 }} />
        <text x="18" y="27" fontSize="12.5" fontWeight="800" style={fill('warn')}>⚠ Rule broken: To Do → Completed by a Dev</text>
        <text x="18" y="48" fontSize="11.5" style={fill('text-soft')}>Applied (Trello cannot block it), flagged in Slack for the coordinator</text>
      </g>
    </svg>
  );
}

/* ───────────── Step 3: the sheet row ───────────── */
export function SheetArt() {
  const head = ['Task ID', 'Title', 'Status', 'Assignee', 'Started At'];
  const widths = [70, 130, 96, 80, 108];
  const rows = [
    ['TASK-5', 'Update footer links', 'Completed', 'Ravi', '2026-11-10 11:02'],
    ['TASK-7', 'Fix login button', 'In Progress', 'Athira', '2026-11-12 22:55'],
    ['TASK-8', 'Add dark mode', 'To Do', '', ''],
  ];
  const xs = widths.map((_, i) => widths.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <svg className="art" viewBox="0 0 520 300" role="img" aria-labelledby="sheet-title">
      <title id="sheet-title">The Tasks tab of the Google Sheet: the row for TASK-7 is updated to In Progress</title>
      <rect width="520" height="300" rx="16" style={fill('sheet-soft')} />
      <g transform="translate(18 20)">
        <rect width="484" height="196" rx="10" style={box('bg-elev')} />
        <g transform="translate(0 0)">
          <rect width="484" height="34" rx="10" style={fill('bg-soft')} />
          <rect y="24" width="484" height="10" style={fill('bg-soft')} />
          {head.map((h, i) => (
            <text key={h} x={xs[i] + 10} y="22" fontSize="11" fontWeight="700" style={fill('text')}>{h}</text>
          ))}
        </g>
        {rows.map((r, ri) => (
          <g key={r[0]} transform={`translate(0 ${34 + ri * 54})`}>
            {ri === 1 && <rect x="2" y="2" width="480" height="50" rx="4" style={{ ...fill('sheet-soft'), stroke: 'var(--sheet)', strokeWidth: 1.5 }} />}
            {r.map((cell, ci) => (
              <text key={ci} x={xs[ci] + 10} y="31" fontSize="11" className={ci === 0 ? 'mono' : undefined} style={fill(ri === 1 && ci === 2 ? 'sheet' : ci === 0 ? 'text' : 'text-soft')} fontWeight={ri === 1 && ci === 2 ? 700 : 400}>
                {cell || '—'}
              </text>
            ))}
            {ri < rows.length - 1 && <path d={`M0 54 H484`} style={stroke('border', 1)} />}
          </g>
        ))}
      </g>
      <g transform="translate(18 230)">
        <rect width="484" height="52" rx="10" style={box('bg-elev')} />
        <text x="14" y="21" fontSize="10.5" fontWeight="700" style={fill('text-faint')}>HISTORY TAB · new row</text>
        <text x="14" y="40" fontSize="10.5" className="mono" style={fill('text-soft')}>22:55 · TASK-7 · status · Assigned → In Progress · Athira · Trello</text>
      </g>
    </svg>
  );
}

/* ───────────── Step 4: the Slack thread ───────────── */
export function SlackArt() {
  const replies = [
    { text: '👤 Athira is now working on this (assigned by Athira).', tone: 'bg-soft' },
    { text: 'Athira moved this from Assigned → In Progress (via Trello)', tone: 'slack-soft' },
    { text: '📝 Progress note from Athira: “Root cause found”', tone: 'bg-soft' },
  ];
  return (
    <svg className="art" viewBox="0 0 520 300" role="img" aria-labelledby="slack-title">
      <title id="slack-title">The Slack channel: one message per task, with every update as a reply in its thread</title>
      <rect width="520" height="300" rx="16" style={fill('slack-soft')} />
      <g transform="translate(18 18)">
        <rect width="484" height="264" rx="12" style={box('bg-elev')} />
        <text x="16" y="28" fontSize="13" fontWeight="800" style={fill('text')}># proj-website</text>
        <path d="M0 42 H484" style={stroke('border', 1)} />
        <g transform="translate(16 56)">
          <rect width="34" height="34" rx="8" style={fill('brand')} />
          <text x="17" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">TS</text>
          <text x="46" y="12" fontSize="12" fontWeight="800" style={fill('text')}>Taskvane</text>
          <text x="112" y="12" fontSize="10" style={fill('text-faint')}>APP · 22:55</text>
          <text x="46" y="30" fontSize="12" fontWeight="700" style={fill('text')}>TASK-7 · Fix login button</text>
          <text x="46" y="47" fontSize="11.5" style={fill('text-soft')}>Status: In Progress · Assignee: @Athira</text>
          <text x="46" y="63" fontSize="11.5" style={fill('trello')}>Open Trello card</text>
        </g>
        <path d="M33 132 V 252" style={stroke('border-strong', 2)} />
        {replies.map((r, i) => (
          <g key={r.text} transform={`translate(46 ${134 + i * 40})`}>
            <rect width="422" height="32" rx="8" style={fill(r.tone)} />
            <text x="12" y="20" fontSize="11.5" style={fill('text-soft')}>{r.text}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
