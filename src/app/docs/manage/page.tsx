import type { Metadata } from 'next';
import { Callout, DocPage, Endpoint, Table } from '@/components/Docs';

export const metadata: Metadata = { title: 'Managing projects' };

const TASKS: [string, string, string][] = [
  ['List projects', 'GET', '/orgs/{orgId}/projects'],
  ['Project details', 'GET', '/orgs/{orgId}/projects/{projectId}'],
  ['Who is on the board (Trello member IDs)', 'GET', '/orgs/{orgId}/projects/{projectId}/board-members'],
  ['Import open cards again (known cards are skipped)', 'POST', '/orgs/{orgId}/projects/{projectId}/import'],
  ['Register the Trello webhook again (e.g. the API address changed)', 'POST', '/orgs/{orgId}/projects/{projectId}/webhook'],
  ['Stop syncing a project (data is kept)', 'DELETE', '/orgs/{orgId}/projects/{projectId}'],
  ['Add or update a team member (same email = update)', 'POST', '/orgs/{orgId}/team'],
  ['Remove a team member (kept in history)', 'DELETE', '/orgs/{orgId}/team/{memberId}'],
  ['Disconnect Trello or Slack', 'DELETE', '/orgs/{orgId}/connections/{provider}'],
];

export default function Manage() {
  return (
    <DocPage href="/docs/manage/" title="Managing projects and the team">
      <Table head={['Task', 'Request']} rows={TASKS.map(([t, m, p]) => [t, <Endpoint key={p + m} method={m} path={p} />])} />

      <h2>Adding lists later</h2>
      <p>
        Lists you add by hand in Trello are simply not tracked, which is what you want for lists like Backlog. To add them when the project is created, use{' '}
        <code>extraLists</code>. To rename a <strong>status</strong> list, rename it in Trello: the link is by list ID, so it keeps working.
      </p>

      <h2>Changing the channel or the sheet</h2>
      <Callout>
        Changing the Slack channel or the sheet of an existing project is not possible yet. Stop the project and create it again: the cards are imported again and the old
        sheet keeps its rows.
      </Callout>
    </DocPage>
  );
}
