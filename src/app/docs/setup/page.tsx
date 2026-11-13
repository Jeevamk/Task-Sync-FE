import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { json } from '@/lib/json';
import { Callout, DocPage, Endpoint, Table } from '@/components/Docs';

export const metadata: Metadata = { title: 'Set up your team' };

const TASKS_COLUMNS =
  'Task ID | Trello Card ID | Title | Description | Status | Assignee | Labels / Priority | Due Date | Created At | Picked Up At | Started At | Ready for Testing At | Completed At | Reopen Count | Progress Notes | Trello URL | Last Updated | Last Updated By';
const HISTORY_COLUMNS = 'Timestamp | Task ID | Field | Old Value | New Value | Changed By | Source';

export default function Setup() {
  return (
    <DocPage href="/docs/setup/" title="Set up your team" lead="Eight steps, once per team. Each step shows the request to send and what to check in the response.">
      <ol className="steps">
        <li>
          <h3>Log in</h3>
          <p>
            While testing, use <Endpoint method="POST" path="/auth/dev-login" /> (only when the server has <code>ALLOW_DEV_LOGIN=true</code> and is not in production). The
            web app uses <Endpoint method="POST" path="/auth/google" />.
          </p>
          <CodeBlock lang="json" title="Request body" code={json({ email: 'you@company.com', name: 'Your Name' })} />
          <CodeBlock lang="json" title="Response" code={json({ token: 'eyJhbGciOi…', user: { id: '…', email: 'you@company.com', name: 'Your Name' } })} />
          <p>
            Copy the <strong>token</strong>. On the <code>/docs</code> page, click <strong>Authorize</strong>, paste it and confirm. It is valid for <strong>7 days</strong>.
          </p>
        </li>

        <li>
          <h3>Create your organization</h3>
          <p>
            <Endpoint method="POST" path="/orgs" />
          </p>
          <CodeBlock lang="json" title="Request body" code={json({ name: 'Acme Dev Team' })} />
          <p>
            Copy the <strong>id</strong> from the response. This is your <code>orgId</code>; almost every other request needs it.
          </p>
          <Callout type="warn">
            <p>
              <strong>Create the organization once.</strong> The team list, Trello, Slack and projects all belong to one organization. If the team is added to one
              organization and the project to another, Taskvane does not recognise your team on that board, and every move is flagged as “not allowed”. Check with{' '}
              <Endpoint method="GET" path="/orgs" />.
            </p>
          </Callout>
        </li>

        <li>
          <h3>Connect Trello</h3>
          <ol>
            <li>
              Send <Endpoint method="POST" path="/orgs/{orgId}/connections/trello/start" />.
            </li>
            <li>
              Open the <code>authorizeUrl</code> from the response in your browser, log in to Trello if asked, and click <strong>Allow</strong>.
            </li>
            <li>
              The page shows <strong>✅ Trello connected</strong>. You can close it.
            </li>
          </ol>
          <p>Taskvane acts in Trello as this account. Use an account that is a member of every board you want to sync.</p>
          <Callout>The connect link works once, for 10 minutes. If it expired, start again.</Callout>
        </li>

        <li>
          <h3>Add Taskvane to Slack</h3>
          <ol>
            <li>
              Send <Endpoint method="POST" path="/orgs/{orgId}/connections/slack/start" />.
            </li>
            <li>
              Open the <code>authorizeUrl</code>, pick your workspace (top right) and click <strong>Allow</strong>.
            </li>
          </ol>
          <p>
            Then check both with <Endpoint method="GET" path="/orgs/{orgId}" />. Note the <code>googleSheets.shareWith</code> email for the next step.
          </p>
          <CodeBlock
            lang="json"
            title="Response (part)"
            code={json({
              connections: { trello: { connected: true, account: 'Athira Shivaram (@athirashivaram)' }, slack: { connected: true, account: 'Acme workspace' } },
              googleSheets: { shareWith: 'taskvane@your-project.iam.gserviceaccount.com' },
            })}
          />
        </li>

        <li>
          <h3>Prepare the Google Sheet</h3>
          <ol>
            <li>Create a new Google Sheet, one per project.</li>
            <li>
              Add a tab named exactly <strong>Tasks</strong>. In row 1, put the column headers you want. Only <code>Task ID</code> is required; Taskvane fills these when
              they exist, in any order:
              <CodeBlock lang="text" title="Tasks tab, row 1" code={TASKS_COLUMNS} />
              Columns with other names (your notes, formulas) are never overwritten.
            </li>
            <li>
              Add a tab named <strong>History</strong> (recommended), with this row 1:
              <CodeBlock lang="text" title="History tab, row 1" code={HISTORY_COLUMNS} />
            </li>
            <li>
              Click <strong>Share</strong> and add the <code>shareWith</code> email as <strong>Editor</strong>.
            </li>
          </ol>
        </li>

        <li>
          <h3>Pick the Slack channel</h3>
          <p>
            <Endpoint method="GET" path="/orgs/{orgId}/slack/channels" /> lists the channels. Copy the <code>id</code> of the one for updates.
          </p>
          <Callout>
            Private channel? Open it in Slack and type <code>/invite @Taskvane</code> first.
          </Callout>
        </li>

        <li>
          <h3>Add your team members</h3>
          <p>
            Taskvane uses the team list to know <strong>who</strong> moved a card: for the rules, Slack mentions and the Assignee column. Send{' '}
            <Endpoint method="POST" path="/orgs/{orgId}/team" /> for each person:
          </p>
          <CodeBlock lang="json" title="Request body" code={json({ name: 'Athira', email: 'athira@company.com', role: 'COORDINATOR', trello: '@athirashivaram' })} />
          <Table
            head={['Field', 'Notes']}
            rows={[
              [<code key="n">name</code>, 'Shown in the sheet and in Slack.'],
              [<code key="e">email</code>, 'Use the same email as their Slack account, so they get @mentions. The same email again updates the member.'],
              [<code key="r">role</code>, <><code>COORDINATOR</code>, <code>DEV</code> or <code>QA</code>. See <Link href="/docs/rules/">Team rules</Link>.</>],
              [<code key="t">trello</code>, 'Their Trello username, with or without @. Without it, their moves are not recognised.'],
            ]}
          />
          <p>
            Read the <code>notes</code> in the response: they say what was matched in Trello and Slack. You need at least one <strong>COORDINATOR</strong>.
          </p>
        </li>

        <li>
          <h3>Create a project</h3>
          <p>
            <Endpoint method="POST" path="/orgs/{orgId}/projects" /> with an existing board:
          </p>
          <CodeBlock
            lang="json"
            title="Request body"
            code={json({
              name: 'Website Revamp',
              trelloBoard: 'https://trello.com/b/AbC12xYz/website-revamp',
              sheet: 'https://docs.google.com/spreadsheets/d/1Qqwr…/edit',
              slackChannelId: 'C0123456789',
            })}
          />
          <p>
            Or send <code>&quot;trelloBoard&quot;: &quot;new&quot;</code> to create a fresh board with all five lists and your team on it. Add{' '}
            <code>&quot;extraLists&quot;: [&quot;Backlog&quot;]</code> for lists that are not tracked.
          </p>
          <Table
            head={['Option', 'Notes']}
            rows={[
              [<code key="l">lists</code>, <>Only if your lists have other names, e.g. <code>{'{ "IN_PROGRESS": "Doing" }'}</code>.</>],
              [<code key="c">createMissingLists</code>, <><code>true</code> creates any missing status list instead of failing.</>],
              [<code key="x">extraLists</code>, 'Extra lists placed at the left of the board. Cards in them are not tracked.'],
              [<code key="b">newBoardName</code>, <>With <code>&quot;new&quot;</code>: the board name (default: the project name).</>],
            ]}
          />
          <p>
            Taskvane checks everything first (nothing changes if a check fails), sets up the board, registers the Trello webhook and imports the open cards: each gets a
            Tasks row and a Slack message. Always read <code>warnings</code> in the response.
          </p>
          <Callout type="ok">
            <strong>Setup is done.</strong> From now on, just work in Trello. See <Link href="/docs/daily-use/">Daily use</Link>.
          </Callout>
        </li>
      </ol>
    </DocPage>
  );
}
