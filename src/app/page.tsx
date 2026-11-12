import Link from 'next/link';
import { BoardArt, FlowDiagram, RulesArt, SheetArt, SlackArt } from '@/components/Illustrations';

const PAINS = [
  { title: 'The tracker is always out of date', text: 'Someone moves a card in Trello and forgets the spreadsheet. By Friday, the status report is fiction.' },
  { title: 'Nobody knows what changed', text: 'Who moved TASK-7 back to In Progress? When did testing start? Trello’s activity feed is not a report.' },
  { title: 'Updates get lost in Slack', text: 'People post “done!” in random channels. The coordinator chases everyone for status.' },
];

const STEPS = [
  {
    art: <BoardArt />,
    title: 'Your team works in Trello, as usual',
    text: 'Create cards, assign people, drag cards across To Do → Assigned → In Progress → Ready for Testing → Completed, comment, set due dates. Nothing new to learn.',
    points: ['Five status lists, plus any extra lists you want (Backlog, Ideas…)', 'Works with existing boards, or creates a new one for you'],
  },
  {
    art: <RulesArt />,
    title: 'Task Sync records every change and checks the rules',
    text: 'Trello tells Task Sync about each change within seconds. It saves the task, stamps the time it reached each stage, and checks who is allowed to make that move.',
    points: ['Picked up, started, ready-for-testing and completed times', 'Reopened tasks are counted', 'Moves that break the team rules are flagged, never silently lost'],
  },
  {
    art: <SheetArt />,
    title: 'The Google Sheet updates itself',
    text: 'One row per task in the Tasks tab, updated in place, plus a full History tab. Your own columns and formulas are never touched.',
    points: ['Status, assignee, labels, due date, all timestamps', 'One History row per change: who, what, when, from where'],
  },
  {
    art: <SlackArt />,
    title: 'Slack gets one thread per task',
    text: 'Each task starts a message in the project channel. Every later update is a reply in its thread, so the channel stays readable.',
    points: ['People are @mentioned', 'Ready for Testing, Completed and Reopened are also posted to the channel'],
  },
];

const FEATURES = [
  { icon: '🔁', bg: 'var(--trello-soft)', title: 'Real-time sync', text: 'Trello webhooks deliver each change in seconds. Failed deliveries retry automatically, and finished steps never run twice.' },
  { icon: '📊', bg: 'var(--sheet-soft)', title: 'A tracker that maintains itself', text: 'Cycle times, reopen counts and a full change history in the Google Sheet you already use.' },
  { icon: '💬', bg: 'var(--slack-soft)', title: 'Readable Slack updates', text: 'One thread per task with @mentions, and the important moments surfaced in the channel.' },
  { icon: '🛡️', bg: 'var(--warn-soft)', title: 'Team rules', text: 'Only the assignee or a coordinator moves work forward; only QA or a coordinator completes it. Broken rules are flagged.' },
  { icon: '📥', bg: 'var(--brand-soft)', title: 'Create cards from anywhere', text: 'Bulk-create cards from the sheet’s Import tab, or from your own tools with one API call.' },
  { icon: '🏢', bg: 'var(--ok-soft)', title: 'Built for many teams', text: 'Each organization connects its own Trello, Slack and sheet. Tokens are encrypted; organizations never see each other.' },
];

const SETUP = [
  ['Log in', 'Google sign-in, or dev login while testing.'],
  ['Create your organization', 'Your team’s private space.'],
  ['Connect Trello', 'One click, then Allow.'],
  ['Add Task Sync to Slack', 'Pick your workspace, then Allow.'],
  ['Share your Google Sheet', 'With the Task Sync email, as Editor.'],
  ['Pick the Slack channel', 'Where updates should go.'],
  ['Add your team', 'Name, email, role and Trello username.'],
  ['Create a project', 'Board + sheet + channel. Cards are imported straight away.'],
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="chip">Trello · Google Sheets · Slack</span>
            <h1>
              Your board, your tracker and your team chat, <span className="accent">always in step.</span>
            </h1>
            <p className="lead">
              Task Sync turns every Trello card change into an up-to-date Google Sheet row and a tidy Slack thread, and checks it against
              your team’s rules. No more copying status by hand.
            </p>
            <div className="hero-actions">
              <Link href="/docs/setup/" className="btn btn-primary">
                Set up your team →
              </Link>
              <Link href="/docs/api/" className="btn btn-ghost">
                API reference
              </Link>
            </div>
            <div className="hero-meta">
              <span>Works with your existing board</span>
              <span>Set up in about 15 minutes</span>
              <span>Tokens encrypted</span>
            </div>
          </div>
          <div className="art-frame">
            <FlowDiagram />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The problem</span>
            <h2>Three tools, three versions of the truth</h2>
            <p>Teams plan in Trello, report from a spreadsheet and talk in Slack. Keeping them aligned is a daily chore that nobody owns.</p>
          </div>
          <div className="grid-3">
            {PAINS.map((p) => (
              <div key={p.title} className="card pain">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Move a card once. Everything else follows.</h2>
            <p>Here is what happens in the few seconds after someone drags TASK-7 from Assigned to In Progress.</p>
          </div>
          <div className="flow-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flow-step">
                <div className="flow-text">
                  <span className="step-num">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul>
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="art-frame">{s.art}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything a coordinator needs, nothing the team has to learn</h2>
          </div>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <div className="icon-badge" style={{ background: f.bg }} aria-hidden="true">
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft" id="setup">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Getting started</span>
            <h2>Eight steps, once per team</h2>
            <p>
              Then just work in Trello. The <Link href="/docs/setup/">setup guide</Link> walks through each step with the exact requests.
            </p>
          </div>
          <ol className="timeline">
            {SETUP.map(([title, text]) => (
              <li key={title}>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Ready to stop copying status by hand?</h2>
            <p>Follow the setup guide, or explore every endpoint in the API reference.</p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link href="/docs/setup/" className="btn btn-primary">
                Read the setup guide
              </Link>
              <Link href="/docs/api/" className="btn btn-ghost">
                Browse the API
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
