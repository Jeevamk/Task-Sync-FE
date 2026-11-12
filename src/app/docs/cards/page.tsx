import type { Metadata } from 'next';
import { CodeBlock } from '@/components/CodeBlock';
import { json } from '@/lib/json';
import { Callout, DocPage, Endpoint, Table } from '@/components/Docs';

export const metadata: Metadata = { title: 'Creating cards' };

export default function Cards() {
  return (
    <DocPage
      href="/docs/cards/"
      title="Creating cards from outside Trello"
      lead="Besides creating cards in Trello, you can create them from the Google Sheet (many at once) or from your own tools with the API. Either way, the card then syncs like any other."
    >
      <h2 id="sheet">Option A: from the Google Sheet (Import tab)</h2>
      <p>Good for adding many tasks at once. Only coordinators can do this.</p>

      <h3>One-time setup per sheet</h3>
      <ol>
        <li>
          In the sheet: <strong>Extensions → Apps Script</strong>.
        </li>
        <li>
          Replace the code with the content of <code>apps-script/Import.gs</code> (in the backend project) and click <strong>Save</strong>.
        </li>
        <li>
          <strong>Project Settings → Script properties</strong>, add <code>API_URL</code> (the API address, no <code>/</code> at the end) and <code>SYNC_SECRET</code> (the
          backend’s <code>SHEET_SYNC_SECRET</code>).
        </li>
        <li>
          Reload the sheet. In the new <strong>Task Sync</strong> menu, click <strong>Set up Import tab</strong>.
        </li>
      </ol>

      <h3>Each time</h3>
      <Table
        head={['Import column', 'Notes']}
        rows={[
          [<strong key="t">Title</strong>, 'Required.'],
          ['Description', 'Optional.'],
          ['List', 'List name. Empty = Assigned if there is an assignee, otherwise To Do.'],
          ['Assignee', 'Team member name or email (in the team list, with a Trello username).'],
          ['Due Date', '2026-11-20 = due at 18:00 India time.'],
          ['Labels', 'Comma-separated label names that exist on the board, e.g. High, Frontend.'],
          ['Status, Trello Card, Row Key', 'Filled by Task Sync. Do not edit.'],
        ]}
      />
      <p>
        Fill the rows, then click <strong>Task Sync → Create Trello cards</strong>. Each row’s Status shows <code>created</code> with the card link, <code>already created</code>,
        or the error for that row. Rows already created are never created twice.
      </p>

      <h2 id="api">Option B: with the API</h2>
      <p>
        <Endpoint method="POST" path="/orgs/{orgId}/projects/{projectId}/cards" />
      </p>
      <CodeBlock
        lang="json"
        title="Request body"
        code={json({
          title: 'Fix login button',
          description: 'The login button does nothing on Safari.',
          list: 'To Do',
          memberIds: ['5f1b2c3d4e5f6a7b8c9d0e1f'],
          dueDate: '2026-11-20',
          labels: ['High', 'Frontend'],
          position: 'top',
        })}
      />
      <Table
        head={['Field', 'Notes']}
        rows={[
          [<code key="t">title</code>, 'Required.'],
          [<code key="d">description</code>, 'Optional.'],
          [<code key="l">list</code>, <>List name. Empty = Assigned when <code>memberIds</code> are given, otherwise To Do.</>],
          [<code key="m">memberIds</code>, <>Trello member IDs, from <Endpoint method="GET" path="/orgs/{orgId}/projects/{projectId}/board-members" />. They must be on the board.</>],
          [<code key="du">dueDate</code>, <><code>2026-11-20</code> (due 18:00 India time) or an exact time with a zone, <code>2026-11-20T10:00:00Z</code>.</>],
          [<code key="lb">labels</code>, 'Label names that exist on the board.'],
          [<code key="p">position</code>, <><code>top</code> or <code>bottom</code> (default).</>],
        ]}
      />
      <CodeBlock
        lang="json"
        title="Response 201"
        code={json({ id: '6734a1b2…', url: 'https://trello.com/c/AbCd1234', list: 'To Do', members: ['Athira Shivaram'], labels: ['High', 'Frontend'], due: '2026-11-20T12:30:00.000Z' })}
      />
      <Callout>A wrong list, member, label or date returns 400 with the valid choices in the message. The card syncs to the sheet and Slack within seconds.</Callout>
    </DocPage>
  );
}
