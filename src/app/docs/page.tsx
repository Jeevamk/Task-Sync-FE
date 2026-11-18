import type { Metadata } from 'next';
import Link from 'next/link';
import { Callout, DocPage, Table } from '@/components/Docs';
import { ArtFrame, FlowDiagram } from '@/components/Illustrations';
import { API_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Getting started' };

export default function GettingStarted() {
  return (
    <DocPage
      href="/docs/"
      title="Getting started"
      lead="Taskvane keeps Trello, a Google Sheet and Slack in step for your team. Work happens in Trello as usual; every change is recorded and shown automatically."
    >
      <ArtFrame className="mt-2 mb-6">
        <FlowDiagram />
      </ArtFrame>

      <ul>
        <li>
          The <strong>Google Sheet</strong> gets one row per task (status, assignee, dates, cycle times) and a full change <strong>History</strong>.
        </li>
        <li>
          <strong>Slack</strong> gets one thread per task, with an update for every move, assignment and note.
        </li>
        <li>
          The <strong>team rules</strong> (who may move a card where) are checked, and broken rules are flagged to the coordinator.
        </li>
      </ul>

      <h2>Words used in these docs</h2>
      <Table
        head={['Word', 'Meaning']}
        rows={[
          [<strong key="o">Organization</strong>, 'Your team or company. It has its own Trello, Slack, sheet and team list. Organizations never see each other’s data.'],
          [<strong key="p">Project</strong>, 'One Trello board, linked to one Google Sheet and one Slack channel. An organization can have many projects.'],
          [<strong key="t">Team member</strong>, <>A person in your team list, with a role: <code>COORDINATOR</code>, <code>DEV</code> or <code>QA</code>.</>],
          [<strong key="k">Task</strong>, <>A Trello card that Taskvane tracks. It gets a key like <code>TASK-12</code>.</>],
          [<strong key="s">Status lists</strong>, 'The 5 Trello lists that mean a status: To Do → Assigned → In Progress → Ready for Testing → Completed.'],
        ]}
      />

      <h2>What you need</h2>
      <Table
        head={['What', 'Notes']}
        rows={[
          ['The Taskvane API address', <>For example <code>{API_URL}</code>. In these docs it is written <code>&lt;API&gt;</code>.</>],
          ['A Trello account', 'It must be able to see (and change) the boards you want to sync.'],
          ['Slack permission to install apps', 'Only for connecting Slack, once.'],
          ['A Google account', 'To own the sheet. Taskvane can create it for you, or you share your own.'],
        ]}
      />
      <Callout type="ok">
        <strong>No Trello, Slack or Google account yet?</strong> All three are free and take a few minutes. Taskvane then creates the board, the sheet and the Slack
        channel for you. See <Link href="/docs/setup/#choose-your-path">Set up your team → Choose your path</Link>.
      </Callout>

      <h2>How to send the requests</h2>
      <p>
        Until the web app is ready, setup is done from the <Link href="/docs/api/">API reference</Link> page on this site:
      </p>
      <ol>
        <li>
          <Link href="/login/">Sign in with Google</Link>. The API page picks up your token by itself.
        </li>
        <li>Pick an endpoint from the list, for example <code>POST /orgs</code>, and fill in its fields.</li>
        <li>
          Click <strong>Send</strong>. The response appears under it.
        </li>
      </ol>
      <Callout>
        Every request can also be sent with <code>curl</code> or Postman. After you <Link href="/login/">sign in</Link>, add the header{' '}
        <code>Authorization: Bearer &lt;your token&gt;</code>. Each
        endpoint, with its fields and an example, is in the <Link href="/docs/api/">API reference</Link>.
      </Callout>
    </DocPage>
  );
}
