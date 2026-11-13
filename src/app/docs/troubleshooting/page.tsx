import type { Metadata } from 'next';
import { DocPage, Table } from '@/components/Docs';

export const metadata: Metadata = { title: 'Troubleshooting' };

const ROWS: [string, string][] = [
  ['401 Unauthorized on /orgs/…', 'Not logged in or the token expired (7 days). Log in again and click Authorize.'],
  ['403 on an organization', 'You are not a member of that organization. Check the orgId with GET /orgs.'],
  ['Connect Trello first / Add Taskvane to Slack first', 'Connect Trello or Slack for this organization (setup steps 3 and 4).'],
  ['This connect link expired', 'Connect links last 10 minutes and work once. Start the step again.'],
  ['Google Sheets 403 … share the sheet with …', 'Share the sheet with the shareWith email as Editor.'],
  ['The sheet needs a "Tasks" tab / a "Task ID" header', 'Fix the tab name and row 1. Names must match exactly.'],
  ['This sheet is already used by a project', 'Use a separate sheet per project.'],
  ['Slack channel not found / Invite the bot …', 'Private channel: type /invite @Taskvane in it, then try again.'],
  ['The board is missing these lists', 'Rename the lists in Trello, send "lists" with your names, or send "createMissingLists": true.'],
  ['Warning: Trello webhook not registered yet', 'Trello could not reach the API address. Make sure it is online, then POST …/projects/{projectId}/webhook.'],
  ['Cards change in Trello but nothing happens', 'The webhook is missing or points to an old address (ngrok addresses change on restart): POST …/projects/{projectId}/webhook. Cards in non-status lists are ignored on purpose.'],
  ['Every Slack update says “This move is not allowed by the team rules”', 'The person moving cards is not recognised: add them to the team of the project’s organization, with their Trello username.'],
  ['Slack shows the full Trello name instead of the team name', 'Same cause: that Trello account is not in this organization’s team list.'],
  ['Assignee stays empty', 'The Trello member on the card is not in the team list, or has no Trello username there.'],
  ['No @mention in Slack', 'The team email does not match their Slack email. Update the member.'],
  ['Sheet import: … is not in the team list / Only a coordinator …', 'The Google account clicking Create Trello cards must be a COORDINATOR in the team, with the same email.'],
  ['Sheet import: Missing or invalid X-Sync-Secret', 'SYNC_SECRET in the Apps Script properties is wrong.'],
  ['POST /webhooks/trello returns 401 “Invalid Trello signature”', 'Expected for manual calls: only Trello can sign these requests. To test, move a card on a synced board.'],
  ['Sheet or Slack updates arrive late', 'Failed deliveries retry automatically (up to 8 times, with growing gaps). Finished steps never repeat, so there are no duplicates.'],
];

export default function Troubleshooting() {
  return (
    <DocPage href="/docs/troubleshooting/" title="Troubleshooting" lead="The message or symptom you see, why it happens, and the fix.">
      <Table head={['What you see', 'Why, and the fix']} rows={ROWS.map(([a, b]) => [<strong key={a}>{a}</strong>, b])} />
    </DocPage>
  );
}
