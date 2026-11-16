import type { Metadata } from 'next';
import { CodeBlock } from '@/components/CodeBlock';
import { DocPage, Table } from '@/components/Docs';
import { ArtFrame, SheetArt, SlackArt } from '@/components/Illustrations';

export const metadata: Metadata = { title: 'Sheet & Slack output' };

const THREAD = `TASK-7 · Fix login button
Status: In Progress · Assignee: @Athira
Open Trello card
   └─ 👤 @Athira is now working on this (assigned by Athira).
   └─ Athira moved this from Assigned → In Progress (via Trello)
   └─ 📝 Progress note from Athira: "Root cause found, fixing now"
   └─ Athira moved this from In Progress → Ready for Testing (via Trello)
      🧪 Ready for testing — QA, please pick it up.     ← also shown in the channel`;

export default function SheetAndSlack() {
  return (
    <DocPage href="/docs/sheet-and-slack/" title="What you see in the sheet and in Slack">
      <h2>The Google Sheet</h2>
      <ArtFrame className="mt-2 mb-6">
        <SheetArt />
      </ArtFrame>
      <p>
        <strong>Tasks tab</strong>: one row per task, found by <code>Task ID</code> and updated in place.
      </p>
      <Table
        head={['Column', 'Filled with']}
        rows={[
          ['Task ID', 'TASK-1, TASK-2, …'],
          ['Trello Card ID, Trello URL', 'The card'],
          ['Title, Description, Labels / Priority, Due Date', 'From the card'],
          ['Status', 'To Do / Assigned / In Progress / Ready for Testing / Completed / Archived'],
          ['Assignee', 'Team member name'],
          ['Created At, Picked Up At, Started At, Ready for Testing At, Completed At', 'When the task first reached that point (India time)'],
          ['Reopen Count', 'How many times it went backwards'],
          ['Progress Notes', 'The latest Trello comment'],
          ['Last Updated, Last Updated By', 'e.g. 2026-11-12 22:55, Athira (Trello)'],
        ]}
      />
      <p>
        <strong>History tab</strong>: one new row per change, with <code>Timestamp | Task ID | Field | Old Value | New Value | Changed By | Source</code>.
      </p>

      <h2>Slack</h2>
      <ArtFrame className="mt-2 mb-6">
        <SlackArt />
      </ArtFrame>
      <p>Each task gets one message in the project channel. Every later update is a reply in its thread:</p>
      <CodeBlock lang="text" title="#proj-website" code={THREAD} />
      <p>
        Important updates (<strong>Ready for Testing</strong>, <strong>Completed</strong>, <strong>Reopened</strong>) are also posted to the channel. People are @mentioned
        when their team email matches their Slack account.
      </p>
    </DocPage>
  );
}
