import type { Metadata } from 'next';
import { Callout, DocPage, Table } from '@/components/Docs';
import { BoardArt } from '@/components/Illustrations';

export const metadata: Metadata = { title: 'Daily use' };

const ROWS: [string, string][] = [
  ['Create a card in a status list', 'New task TASK-n, a new Tasks row, and a new Slack message (the start of that task’s thread).'],
  ['Add a member to the card', 'Assignee is set; Slack: “👤 @Athira is now working on this”. A card in To Do is moved to Assigned automatically.'],
  ['Remove the member', 'Assignee is cleared; Slack note.'],
  ['Move the card to another status list', 'Status changes; the matching time is filled (Picked Up, Started, Ready for Testing, Completed); Slack thread update.'],
  ['Move to In Progress with nobody assigned', 'The person who moved it becomes the assignee.'],
  ['Move to Ready for Testing', 'Slack adds “🧪 Ready for testing — QA, please pick it up.”, also posted to the channel.'],
  ['Move to Completed', 'Slack adds “✅ Completed. Nice work …!”, also posted to the channel.'],
  ['Move a card backwards', 'Counted as reopened: Reopen Count +1 and “🔁 Reopened” in Slack. Reopening a completed card clears Completed At.'],
  ['Comment on the card', 'Saved as the task’s Progress Notes; Slack: “📝 Progress note from …”.'],
  ['Change the title, description or due date', 'Sheet row updated, Slack note, History row.'],
  ['Archive the card', 'Status becomes Archived; Slack note.'],
  ['Move a card into an extra list (e.g. Backlog)', 'Ignored: not tracked.'],
];

export default function DailyUse() {
  return (
    <DocPage href="/docs/daily-use/" title="Daily use" lead="Work in Trello as you normally do. Each action below is picked up within a few seconds.">
      <div className="art-frame" style={{ margin: '8px 0 24px' }}>
        <BoardArt />
      </div>
      <Table head={['You do this in Trello', 'Task Sync does this']} rows={ROWS.map(([a, b]) => [<strong key={a}>{a}</strong>, b])} />
      <p>Every change also adds a row to the History tab: when, which task, what changed, from what to what, by whom, and from where.</p>
      <Callout type="warn">
        <strong>Trello is the source of truth.</strong> Edit tasks in Trello. Values typed directly into the Tasks tab are overwritten by the next update from Trello (your
        own extra columns are kept).
      </Callout>
    </DocPage>
  );
}
