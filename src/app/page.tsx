import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArtFrame, BoardArt, FlowDiagram, RulesArt, SheetArt, SlackArt } from '@/components/Illustrations';
import { btn, btnGhost, btnLg, btnPrimary, card, chip } from '@/components/ui';

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
    title: 'Taskvane records every change and checks the rules',
    text: 'Trello tells Taskvane about each change within seconds. It saves the task, stamps the time it reached each stage, and checks who is allowed to make that move.',
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
  { icon: '🔁', bg: 'bg-trello-soft', title: 'Real-time sync', text: 'Trello webhooks deliver each change in seconds. Failed deliveries retry automatically, and finished steps never run twice.' },
  { icon: '📊', bg: 'bg-sheet-soft', title: 'A tracker that maintains itself', text: 'Cycle times, reopen counts and a full change history in the Google Sheet you already use.' },
  { icon: '💬', bg: 'bg-slack-soft', title: 'Readable Slack updates', text: 'One thread per task with @mentions, and the important moments surfaced in the channel.' },
  { icon: '🛡️', bg: 'bg-warn-soft', title: 'Team rules', text: 'Only the assignee or a coordinator moves work forward; only QA or a coordinator completes it. Broken rules are flagged.' },
  { icon: '📥', bg: 'bg-brand-soft', title: 'Create cards from anywhere', text: 'Bulk-create cards from the sheet’s Import tab, or from your own tools with one API call.' },
  { icon: '🏢', bg: 'bg-ok-soft', title: 'Built for many teams', text: 'Each organization connects its own Trello, Slack and sheet. Tokens are encrypted; organizations never see each other.' },
];

const SETUP = [
  ['Log in', 'Google sign-in, or dev login while testing.'],
  ['Create your organization', 'Your team’s private space.'],
  ['Connect Trello', 'One click, then Allow.'],
  ['Add Taskvane to Slack', 'Pick your workspace, then Allow.'],
  ['Connect Google or share a sheet', 'Taskvane can create the sheet in your Drive for you.'],
  ['Pick the Slack channel', 'Or let Taskvane create one.'],
  ['Add your team', 'Name, email, role and Trello username.'],
  ['Create a project', 'Send "new" and the board, sheet and channel are made for you. Cards are imported straight away.'],
];

export default function Home() {
  return (
    <>
      <section className="hero-glow pt-14 pb-8 lg:pt-[88px] lg:pb-14">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <span className={chip}>Trello · Google Sheets · Slack</span>
            <h1 className="mt-4 mb-[18px] text-[clamp(34px,5.4vw,56px)] font-extrabold">
              Your board, your tracker and your team chat,{' '}
              <span className="bg-linear-90 from-trello via-brand to-slack bg-clip-text text-transparent">always in step.</span>
            </h1>
            <p className="max-w-[560px] text-[clamp(17px,2vw,19px)] text-fg-soft">
              Taskvane turns every Trello card change into an up-to-date Google Sheet row and a tidy Slack thread, and checks it against
              your team’s rules. No more copying status by hand.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/docs/setup/" className={`${btn} ${btnLg} ${btnPrimary}`}>
                Set up your team →
              </Link>
              <Link href="/docs/api/" className={`${btn} ${btnLg} ${btnGhost}`}>
                API reference
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-faint [&>span]:before:font-bold [&>span]:before:text-ok [&>span]:before:content-['✓_']">
              <span>Works with your existing board</span>
              <span>Set up in about 15 minutes</span>
              <span>Tokens encrypted</span>
            </div>
          </div>
          <ArtFrame>
            <FlowDiagram />
          </ArtFrame>
        </div>
      </section>

      <section className="py-[72px]">
        <div className="wrap">
          <SectionHead eyebrow="The problem" title="Three tools, three versions of the truth">
            Teams plan in Trello, report from a spreadsheet and talk in Slack. Keeping them aligned is a daily chore that nobody owns.
          </SectionHead>
          <Grid3>
            {PAINS.map((p) => (
              <div key={p.title} className={`${card} border-l-[3px] border-l-danger`}>
                <h3 className="text-lg">{p.title}</h3>
                <p className="m-0 text-[15.5px] text-fg-soft">{p.text}</p>
              </div>
            ))}
          </Grid3>
        </div>
      </section>

      <section className="border-y border-line bg-surface-soft py-[72px]" id="how-it-works">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title="Move a card once. Everything else follows.">
            Here is what happens in the few seconds after someone drags TASK-7 from Assigned to In Progress.
          </SectionHead>
          <div className="grid gap-7">
            {STEPS.map((s, i) => (
              <div key={s.title} className="grid grid-cols-[minmax(0,1fr)] items-center gap-6 md:grid-cols-2 md:gap-14">
                <div className={i % 2 === 1 ? 'md:order-2' : undefined}>
                  <span className="mb-3.5 inline-grid size-8 place-items-center rounded-full bg-brand text-[15px] font-extrabold text-on-brand">{i + 1}</span>
                  <h3 className="text-2xl font-extrabold">{s.title}</h3>
                  <p className="text-fg-soft">{s.text}</p>
                  <ul className="m-0 list-disc pl-5 text-fg-soft">
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <ArtFrame>{s.art}</ArtFrame>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[72px]" id="features">
        <div className="wrap">
          <SectionHead eyebrow="Features" title="Everything a coordinator needs, nothing the team has to learn" />
          <Grid3>
            {FEATURES.map((f) => (
              <div key={f.title} className={card}>
                <div className={`mb-4 grid size-[42px] place-items-center rounded-[10px] text-xl ${f.bg}`} aria-hidden="true">
                  {f.icon}
                </div>
                <h3 className="text-lg">{f.title}</h3>
                <p className="m-0 text-[15.5px] text-fg-soft">{f.text}</p>
              </div>
            ))}
          </Grid3>
        </div>
      </section>

      <section className="border-y border-line bg-surface-soft py-[72px]" id="setup">
        <div className="wrap">
          <SectionHead eyebrow="Getting started" title="Eight steps, once per team">
            Then just work in Trello. The <Link href="/docs/setup/">setup guide</Link> walks through each step with the exact requests.
          </SectionHead>
          <ol className="mx-auto grid max-w-[860px] gap-3 [counter-reset:timeline]">
            {SETUP.map(([title, text]) => (
              <li
                key={title}
                className="grid grid-cols-[40px_1fr] items-start gap-4 rounded-xl border border-line bg-surface-elev px-[18px] py-4 [counter-increment:timeline] before:grid before:size-9 before:place-items-center before:rounded-full before:bg-brand-soft before:font-extrabold before:text-brand before:content-[counter(timeline)]"
              >
                <div>
                  <strong className="block">{title}</strong>
                  <span className="text-[15px] text-fg-soft">{text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-[72px]">
        <div className="wrap">
          <div className="rounded-[20px] bg-linear-135 from-brand to-[color-mix(in_srgb,var(--slack)_80%,var(--brand))] px-6 py-14 text-center text-white">
            <h2 className="text-[clamp(26px,3.4vw,36px)] font-extrabold">Ready to stop copying status by hand?</h2>
            <p className="mx-auto mb-6 max-w-[560px] opacity-90">Follow the setup guide, or explore every endpoint in the API reference.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/docs/setup/" className={`${btn} ${btnLg} border-transparent bg-white text-[#312e81]`}>
                Read the setup guide
              </Link>
              <Link href="/docs/api/" className={`${btn} ${btnLg} border-white/50 bg-transparent text-white`}>
                Browse the API
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mb-11 max-w-[720px] text-center">
      <span className="mb-2.5 block text-[12.5px] font-bold tracking-[0.12em] text-brand uppercase">{eyebrow}</span>
      <h2 className="text-[clamp(28px,3.6vw,38px)] font-extrabold">{title}</h2>
      {children && <p className="text-[17px] text-fg-soft">{children}</p>}
    </div>
  );
}

function Grid3({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
