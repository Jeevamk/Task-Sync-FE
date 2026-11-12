import type { Metadata } from 'next';
import Link from 'next/link';
import { Callout, DocPage, Table } from '@/components/Docs';
import { RulesArt } from '@/components/Illustrations';

export const metadata: Metadata = { title: 'Team rules' };

const MOVES: [string, string][] = [
  ['To Do → Assigned', 'Coordinator, Dev'],
  ['To Do → In Progress', 'Coordinator, Dev'],
  ['Assigned → To Do', 'Coordinator, the assignee'],
  ['Assigned → In Progress', 'Coordinator, the assignee'],
  ['In Progress → Ready for Testing', 'Coordinator, the assignee'],
  ['In Progress → Assigned', 'Coordinator, the assignee'],
  ['Ready for Testing → Completed', 'Coordinator, QA'],
  ['Ready for Testing → In Progress', 'Coordinator, QA'],
  ['Completed → In Progress', 'Coordinator, QA'],
];

export default function Rules() {
  return (
    <DocPage href="/docs/rules/" title="Team rules" lead="Who may move a card from one status to another. Every move is checked against these rules.">
      <Table head={['From → To', 'Who may do it']} rows={MOVES.map(([a, b]) => [<strong key={a}>{a}</strong>, b])} />
      <p>
        Any other move (for example To Do → Completed), or a move by someone <strong>not in the team list</strong>, breaks the rules.
      </p>
      <div className="art-frame" style={{ margin: '24px 0' }}>
        <RulesArt />
      </div>
      <p>
        Trello cannot block a move, so Task Sync <strong>applies it anyway and flags it</strong>: the Slack update ends with{' '}
        <em>“⚠️ This move is not allowed by the team rules — coordinator, please check.”</em> and the History records it.
      </p>
      <Callout type="warn">
        If <strong>every</strong> move is flagged, the person moving cards is not recognised. Check that they are in the team list <strong>of the same organization as the
        project</strong>, with the right Trello username. See <Link href="/docs/setup/">Set up your team</Link>, steps 2 and 7.
      </Callout>
    </DocPage>
  );
}
