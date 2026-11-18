import type { Metadata } from 'next';
import { DocPage, Table } from '@/components/Docs';

export const metadata: Metadata = { title: 'Troubleshooting' };

const ROWS: [string, string][] = [
  ['401 Unauthorized on /orgs/…', 'Not signed in, or the token expired (7 days). Sign in again on the Sign in page; the API page picks up the new token.'],
  ['Sign in: “Google sign-in is not set up on this site yet”', 'The site was built without NEXT_PUBLIC_GOOGLE_CLIENT_ID. Whoever runs Taskvane sets it and redeploys the site (see the FE README).'],
  ['Sign in: “Could not reach the Taskvane API at …”', 'The API is offline, or it does not accept this site: its WEB_APP_URL must be exactly this site’s address (no / at the end). Fix it and redeploy the API.'],
  ['Sign in: Google shows “Error 400: origin_mismatch” or “The given origin is not allowed”', 'This site’s address is missing from the OAuth client’s Authorized JavaScript origins in Google Cloud Console. Add it; it can take a few minutes to apply.'],
  ['Sign in: “Google sign-in could not be verified”', 'The site and the API use different Google client IDs: NEXT_PUBLIC_GOOGLE_CLIENT_ID (site) must equal GOOGLE_OAUTH_CLIENT_ID (API). Developers testing by hand: the ID token expired (about 1 hour) or came from another client.'],
  ['Dev login is disabled', 'Expected on the live API (production). Use the Sign in page instead.'],
  ['403 “This access token is read-only”', 'The tv_pat_ token has scope read, which only allows GET requests. Create one with scope "read+write" for changes.'],
  ['401 “This access token is invalid, expired or revoked”', 'Create a new access token (POST /auth/tokens) and use it instead. GET /auth/tokens shows which ones are still active.'],
  ['403 “Manage tokens while logged in …”', 'Creating, listing and revoking access tokens needs your login token from the Sign in page, not an access token.'],
  ['403 on an organization', 'You are not a member of that organization. Check the orgId with GET /orgs.'],
  ['Connect Trello first / Add Taskvane to Slack first', 'Connect Trello or Slack for this organization (setup steps 3 and 4). No account yet? The start response has a free signupUrl (see Set up your team).'],
  ['This connect link expired', 'Connect links last 10 minutes and work once. Start the step again.'],
  ['Connect Google first …', 'You sent sheet: "new" without Google connected. Do step 5 option A (POST …/connections/google/start), or send your own sheet link.'],
  ['Connect Google is not set up on this server', 'The server has no GOOGLE_OAUTH_CLIENT_SECRET. Ask whoever runs the API, or use your own sheet link.'],
  ['The Google connection stopped working. Connect Google again.', 'Access was removed in your Google account, or it expired. Connect Google again (step 5).'],
  ['Google did not return a refresh token', 'Remove Taskvane at myaccount.google.com/permissions, then connect Google again.'],
  ['Please allow Taskvane to create files in your Google Drive', 'The Google Drive box was unticked on the Google page. Connect again and keep it ticked.'],
  ['The sheet was created … but could not be shared', 'Share that sheet with the shareWith email as Editor yourself, then create the project with its link.'],
  ['Taskvane needs a new Slack permission to create channels', 'Your Slack was connected before slackChannelId "new" existed. Click Add to Slack again (step 4), then retry.'],
  ['Slack channel name … is taken by a private or archived channel', 'Send another newChannelName, or unarchive the channel and pass its id.'],
  ['… Already created: sheet …, Slack channel …', 'A later step failed. Fix the cause, then retry with the sheet and slackChannelId values in the message instead of "new".'],
  ['Warning: you were not found in the Slack workspace', 'Your login email is not a member of that Slack workspace. Join the new channel yourself.'],
  ['Google Sheets 403 … share the sheet with …', 'Share the sheet with the shareWith email as Editor.'],
  ['The sheet needs a "Tasks" tab / a "Task ID" header', 'Fix the tab name and row 1 (names must match exactly), or start from the sample sheet: Set up your team, step 5, Download sample sheet.'],
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
