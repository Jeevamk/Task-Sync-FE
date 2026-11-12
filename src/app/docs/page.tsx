import type { Metadata } from 'next';
import Link from 'next/link';
import { Callout, DocPage, Table } from '@/components/Docs';
import { FlowDiagram } from '@/components/Illustrations';
import { API_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Getting started' };

export default function GettingStarted() {
  return (
    <DocPage
      href="/docs/"
      title="Getting started"
      lead="Task Sync keeps Trello, a Google Sheet and Slack in step for your team. Work happens in Trello as usual; every change is recorded and shown automatically."
    >
      <div className="art-frame" style={{ margin: '8px 0 24px' }}>
        <FlowDiagram />
      </div>

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
          [<strong key="k">Task</strong>, <>A Trello card that Task Sync tracks. It gets a key like <code>TASK-12</code>.</>],
          [<strong key="s">Status lists</strong>, 'The 5 Trello lists that mean a status: To Do → Assigned → In Progress → Ready for Testing → Completed.'],
        ]}
      />

      <h2>What you need</h2>
      <Table
        head={['What', 'Notes']}
        rows={[
          ['The Task Sync API address', <>For example <code>{API_URL}</code>. In these docs it is written <code>&lt;API&gt;</code>.</>],
          ['A Trello account', 'It must be able to see (and change) the boards you want to sync.'],
          ['Slack permission to install apps', 'Only for connecting Slack, once.'],
          ['A Google account', 'To own the sheet and share it with Task Sync.'],
        ]}
      />

      <h2>How to send the requests</h2>
      <p>
        Until the web app is ready, setup uses the interactive API page at{' '}
        <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer">
          <code>&lt;API&gt;/docs</code>
        </a>
        :
      </p>
      <ol>
        <li>Open the page and click an endpoint, for example <code>POST /orgs</code>.</li>
        <li>
          Click <strong>Try it out</strong>, fill the parameters and the body, then click <strong>Execute</strong>.
        </li>
        <li>The response appears under it.</li>
      </ol>
      <Callout>
        Every request can also be sent with <code>curl</code> or Postman. After logging in, add the header <code>Authorization: Bearer &lt;your token&gt;</code>. Each
        endpoint, with its fields and an example, is in the <Link href="/docs/api/">API reference</Link>.
      </Callout>
    </DocPage>
  );
}
