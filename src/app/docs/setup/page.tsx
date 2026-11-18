import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { json } from '@/lib/json';
import { Callout, DocPage, Endpoint, Table } from '@/components/Docs';
import { SheetTemplateDownload } from '@/components/SheetTemplateDownload';

export const metadata: Metadata = { title: 'Set up your team' };

const TASKS_COLUMNS =
  'Task ID | Trello Card ID | Title | Description | Status | Assignee | Labels / Priority | Due Date | Created At | Picked Up At | Started At | Ready for Testing At | Completed At | Reopen Count | Progress Notes | Trello URL | Last Updated | Last Updated By';
const HISTORY_COLUMNS = 'Timestamp | Task ID | Field | Old Value | New Value | Changed By | Source';

/** Free signup pages. Taskvane can't create these accounts (no provider allows it), so it links to them. */
const SIGNUP = {
  trello: 'https://trello.com/signup',
  slack: 'https://slack.com/get-started#/createnew',
  google: 'https://accounts.google.com/signup',
};

/** The eight steps, in order: [anchor, title, short "what to do", signup link if an outside account is needed]. */
const STEPS: [string, string, string, string | null][] = [
  ['step-1', 'Sign in', 'Sign in with Google. The API page uses your token automatically.', null],
  ['step-2', 'Create your organization', 'Copy its id: this is your orgId.', null],
  ['step-3', 'Connect Trello', 'Open the link, click Allow.', SIGNUP.trello],
  ['step-4', 'Connect Slack', 'Open the link, pick the workspace, click Allow.', SIGNUP.slack],
  ['step-5', 'Google Sheet', 'Connect Google (Taskvane makes the sheet), or share your own (sample sheet to download).', SIGNUP.google],
  ['step-6', 'Slack channel', 'Let Taskvane create it, or pick an existing one.', null],
  ['step-7', 'Add your team', 'Each person with their role and Trello username.', null],
  ['step-8', 'Create a project', 'One request. Cards are imported straight away.', null],
];

const link = (url: string) => (
  <a href={url} target="_blank" rel="noreferrer">
    {url.replace('https://', '').replace(/#.*$/, '')}
  </a>
);

/** "Don't have an account?" box, the same in every connect step. */
function NoAccount({ what, url, extra }: { what: string; url: string; extra?: ReactNode }) {
  return (
    <Callout>
      <strong>No {what} yet?</strong> Create one free at {link(url)}, then come back and open the <code>authorizeUrl</code>. The same link is in the response as{' '}
      <code>signupUrl</code>.{extra ? <> {extra}</> : null}
    </Callout>
  );
}

/** One numbered step with an anchor, so the overview table can link to it. */
function Step({ n, children }: { n: number; children: ReactNode }) {
  const [id, title] = STEPS[n - 1];
  return (
    <li
      id={id}
      className="relative mt-0 mb-6 ml-[15px] border-l-2 border-line pb-2 pl-8 [counter-increment:step] before:absolute before:top-0 before:-left-4 before:grid before:size-[30px] before:place-items-center before:rounded-full before:bg-brand before:text-sm before:font-bold before:text-on-brand before:content-[counter(step)]"
    >
      <h3 className="mt-0.5">{title}</h3>
      {children}
    </li>
  );
}

export default function Setup() {
  return (
    <DocPage
      href="/docs/setup/"
      title="Set up your team"
      lead="Eight steps, once per team. You can start with nothing: Taskvane links you to the free signup pages and then creates the Trello board, the Google Sheet and the Slack channel for you."
    >
      <h2 id="choose-your-path">Choose your path</h2>
      <Table
        head={['You have…', 'Do this']}
        rows={[
          [
            <strong key="a">Nothing yet (new user)</strong>,
            <>
              Create the free accounts as you go (links in steps 3–5), connect all three, and send <code>&quot;new&quot;</code> for the board, sheet and channel in
              step 8. Step 6 needs nothing.
            </>,
          ],
          [
            <strong key="b">An existing board, sheet and channel</strong>,
            <>
              Connect Trello and Slack, share your sheet with Taskvane (step 5, option B), pick the channel (step 6), and send their links and IDs in step 8. Connect
              Google is not needed.
            </>,
          ],
        ]}
      />
      <p>
        You can also mix, for example your own board with a new sheet and a new channel. Taskvane can’t create the Trello, Slack or Google <em>accounts</em> themselves
        (no provider allows that), but all three are free.
      </p>

      <h2 id="overview">The steps at a glance</h2>
      <Table
        head={['#', 'Step', 'What to do', 'Free signup']}
        rows={STEPS.map(([id, title, what, url], i) => [
          i + 1,
          <a key="t" href={`#${id}`}>
            <strong>{title}</strong>
          </a>,
          what,
          url ? link(url) : '—',
        ])}
      />
      <Callout type="ok">
        <p>
          <strong>Lost track?</strong> <Endpoint method="GET" path="/orgs/{orgId}/setup" /> (after step 2) lists every step, whether it is done, the request to send next
          and the signup link for anything not connected yet.
        </p>
      </Callout>
      <CodeBlock
        lang="json"
        title="GET /orgs/{orgId}/setup (part)"
        code={json({
          ready: false,
          nextStep: 'Add Taskvane to Slack',
          steps: [
            { step: 'Connect Trello', done: true, account: 'Athira Shivaram (@athirashivaram)' },
            {
              step: 'Add Taskvane to Slack',
              done: false,
              next: 'POST /orgs/{orgId}/connections/slack/start',
              signupUrl: SIGNUP.slack,
              howTo: 'No Slack workspace? Create one free at the signup link, then open authorizeUrl and click Allow.',
            },
          ],
        })}
      />

      <h2 id="steps">Step by step</h2>
      <ol className="list-none p-0 [counter-reset:step]">
        <Step n={1}>
          <p>
            Open <Link href="/login/">Sign in</Link> and click <strong>Sign in with Google</strong>. The page shows your <strong>token</strong> with a Copy button.
            No Google account? Create one free at{' '}
            <a href="https://accounts.google.com/signup" target="_blank" rel="noreferrer">
              accounts.google.com/signup
            </a>
            .
          </p>
          <p>
            Running the API yourself for testing? <Endpoint method="POST" path="/auth/dev-login" /> works too (only when the server has <code>ALLOW_DEV_LOGIN=true</code>{' '}
            and is not in production):
          </p>
          <CodeBlock lang="json" title="Request body" code={json({ email: 'you@company.com', name: 'Your Name' })} />
          <CodeBlock lang="json" title="Response" code={json({ token: 'eyJhbGciOi…', user: { id: '…', email: 'you@company.com', name: 'Your Name' } })} />
          <p>
            The <Link href="/docs/api/">API reference</Link> page now uses your <strong>token</strong> automatically (it shows <em>Authorized as …</em>). It is valid for <strong>7 days</strong>.
          </p>
          <Callout>
            Use the <strong>same email as your Slack account</strong> if you can: in step 8 Taskvane invites you to a new Slack channel by this email.
          </Callout>
        </Step>

        <Step n={2}>
          <p>
            <Endpoint method="POST" path="/orgs" />
          </p>
          <CodeBlock lang="json" title="Request body" code={json({ name: 'Acme Dev Team' })} />
          <p>
            Copy the <strong>id</strong> from the response. This is your <code>orgId</code>: every following request needs it.
          </p>
          <Callout type="warn">
            <p>
              <strong>Create the organization once.</strong> The team list, Trello, Slack, Google and projects all belong to one organization. If the team is added to one
              organization and the project to another, Taskvane does not recognise your team on that board, and every move is flagged as “not allowed”. Check with{' '}
              <Endpoint method="GET" path="/orgs" />.
            </p>
          </Callout>
        </Step>

        <Step n={3}>
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
          <CodeBlock
            lang="json"
            title="Response"
            code={json({
              authorizeUrl: 'https://trello.com/1/authorize?expiration=never&scope=read,write&…',
              signupUrl: SIGNUP.trello,
              howTo: 'No Trello account? Create one free at the signup link, then open authorizeUrl and click Allow.',
            })}
          />
          <NoAccount what="Trello account" url={SIGNUP.trello} />
          <p>Taskvane acts in Trello as this account. Use an account that is a member of every board you want to sync.</p>
          <p>Every connect link (steps 3–5) works once, for 10 minutes. If it expired, send the start request again.</p>
        </Step>

        <Step n={4}>
          <ol>
            <li>
              Send <Endpoint method="POST" path="/orgs/{orgId}/connections/slack/start" />.
            </li>
            <li>
              Open the <code>authorizeUrl</code>, pick your workspace (top right) and click <strong>Allow</strong>.
            </li>
            <li>
              The page shows <strong>✅ Taskvane was added to the Slack workspace …</strong>
            </li>
          </ol>
          <NoAccount what="Slack workspace" url={SIGNUP.slack} extra="You become its admin, so you are allowed to add Taskvane." />
          <Callout type="warn">
            Connected Slack before <code>slackChannelId: &quot;new&quot;</code> existed? Click <strong>Add to Slack</strong> once more: creating channels needs two new
            permissions (<code>channels:manage</code>, <code>channels:join</code>).
          </Callout>
        </Step>

        <Step n={5}>
          <p>Every project needs its own Google Sheet. Pick one option:</p>

          <h4>Option A (easiest): Taskvane creates the sheet</h4>
          <ol>
            <li>
              Send <Endpoint method="POST" path="/orgs/{orgId}/connections/google/start" />.
            </li>
            <li>
              Open the <code>authorizeUrl</code>, pick your Google account and click <strong>Allow</strong>. Keep the <strong>Google Drive</strong> box ticked.
            </li>
            <li>
              The page shows <strong>✅ Google connected as …</strong>
            </li>
          </ol>
          <NoAccount what="Google account" url={SIGNUP.google} />
          <p>
            Connect once; then send <code>&quot;sheet&quot;: &quot;new&quot;</code> in step 8. Taskvane creates the sheet <strong>in your own Drive</strong> (you own it),
            with the <strong>Tasks</strong>, <strong>History</strong> and <strong>Import</strong> tabs ready, and shares it with itself. Taskvane can only see the files it
            created, nothing else in your Drive.
          </p>

          <h4>Option B: use your own sheet</h4>
          <ol>
            <li>
              Download the sample sheet:
              <SheetTemplateDownload />
            </li>
            <li>
              Open <a href="https://sheets.new" target="_blank" rel="noreferrer">a new Google Sheet</a>, click <strong>File → Import → Upload</strong>, pick the file and
              choose <strong>Replace spreadsheet</strong>. (Or upload the file to Google Drive and pick <strong>Open with → Google Sheets</strong>.)
            </li>
            <li>
              Click <strong>Share</strong> and add the Taskvane email as <strong>Editor</strong>. The email is <code>googleSheets.shareWith</code> in{' '}
              <Endpoint method="GET" path="/orgs/{orgId}" />.
            </li>
            <li>Copy the sheet link from the address bar: that is your <code>sheet</code> in step 8.</li>
          </ol>
          <details className="my-4">
            <summary className="cursor-pointer font-semibold">Prefer to type the headers yourself?</summary>
            <p>
              Add a tab named exactly <strong>Tasks</strong>. Only <code>Task ID</code> is required in row 1; Taskvane fills the other columns when they exist, in any
              order. Columns with other names (your notes, formulas) are never overwritten.
            </p>
            <CodeBlock lang="text" title="Tasks tab, row 1" code={TASKS_COLUMNS} />
            <p>
              A <strong>History</strong> tab is recommended:
            </p>
            <CodeBlock lang="text" title="History tab, row 1" code={HISTORY_COLUMNS} />
          </details>
          <Callout>
            Either way, the Import tab’s <strong>Taskvane</strong> menu (creating cards from the sheet) needs the Apps Script pasted in by hand once. See{' '}
            <Link href="/docs/cards/">Creating cards</Link>.
          </Callout>
        </Step>

        <Step n={6}>
          <h4>Option A (easiest): Taskvane creates the channel</h4>
          <p>
            Nothing to do now. Send <code>&quot;slackChannelId&quot;: &quot;new&quot;</code> in step 8: Taskvane creates a public channel named after the project (or{' '}
            <code>newChannelName</code>) and invites you. If a public channel with that name already exists, Taskvane joins it and uses it.
          </p>
          <h4>Option B: pick an existing channel</h4>
          <p>
            <Endpoint method="GET" path="/orgs/{orgId}/slack/channels" /> lists the channels. Copy the <code>id</code> of the one for updates.
          </p>
          <CodeBlock lang="json" title="Response" code={json([{ id: 'C0123456789', name: 'proj-website', is_private: false, is_member: true }])} />
          <Callout>
            Private channel? Open it in Slack and type <code>/invite @Taskvane</code> first.
          </Callout>
        </Step>

        <Step n={7}>
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
            Read the <code>notes</code> in the response: they say what was matched in Trello and Slack. You need at least one <strong>COORDINATOR</strong> (usually you).
          </p>
        </Step>

        <Step n={8}>
          <p>
            <Endpoint method="POST" path="/orgs/{orgId}/projects" />. Send <code>&quot;new&quot;</code> for anything Taskvane should create, or your own link / ID.
          </p>

          <h4>Option A: new user, Taskvane creates everything</h4>
          <p>Needs Trello, Slack and Google connected (steps 3–5, option A).</p>
          <CodeBlock lang="json" title="Request body" code={json({ name: 'Website Revamp', trelloBoard: 'new', sheet: 'new', slackChannelId: 'new' })} />

          <h4>Option B: use what you already have</h4>
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
            <Endpoint method="GET" path="/orgs/{orgId}/trello/boards" /> lists the boards the connected Trello account can see. Mixing is fine, e.g. your own board with{' '}
            <code>&quot;sheet&quot;: &quot;new&quot;</code>.
          </p>

          <h4>All fields</h4>
          <Table
            head={['Field', 'Notes']}
            rows={[
              [<code key="n">name</code>, 'Project name (required).'],
              [<code key="b">trelloBoard</code>, <>Board link, short code or ID, or <code>&quot;new&quot;</code> (required).</>],
              [<code key="s">sheet</code>, <>Sheet link or ID shared with Taskvane, or <code>&quot;new&quot;</code> (needs Connect Google) (required). One sheet per project.</>],
              [<code key="ch">slackChannelId</code>, <>Channel ID from step 6, or <code>&quot;new&quot;</code> (required).</>],
              [<code key="bn">newBoardName</code>, <>With <code>trelloBoard: &quot;new&quot;</code>: the board name (default: the project name).</>],
              [<code key="sn">newSheetName</code>, <>With <code>sheet: &quot;new&quot;</code>: the sheet name (default: <code>Taskvane – &lt;project name&gt;</code>).</>],
              [<code key="cn">newChannelName</code>, <>With <code>slackChannelId: &quot;new&quot;</code>: the channel name (default: the project name, e.g. <code>website-revamp</code>).</>],
              [<code key="w">trelloWorkspaceId</code>, <>With <code>trelloBoard: &quot;new&quot;</code>: the Trello workspace to create it in (default: your default workspace).</>],
              [<code key="l">lists</code>, <>Only if your lists have other names, e.g. <code>{'{ "IN_PROGRESS": "Doing" }'}</code>.</>],
              [<code key="c">createMissingLists</code>, <><code>true</code> creates any missing status list instead of failing. Always on for a new board.</>],
              [<code key="x">extraLists</code>, <>Extra lists such as <code>[&quot;Backlog&quot;]</code>, placed at the left of the board. Cards in them are not tracked.</>],
            ]}
          />

          <h4>What happens</h4>
          <ol>
            <li>
              <strong>Checks first, nothing changes yet:</strong> the board, sheet and channel you gave are usable, and Trello, Slack and Google are connected where needed.
            </li>
            <li>
              <strong>Creates what you asked for</strong>, in this order: sheet → Slack channel (you are invited) → board with all five lists.
            </li>
            <li>
              <strong>Starts syncing:</strong> registers the Trello webhook and imports the open cards. Each gets a Tasks row and a Slack message.
            </li>
          </ol>
          <CodeBlock
            lang="json"
            title="Response"
            code={json({
              project: {
                id: '…',
                name: 'Website Revamp',
                board: 'Website Revamp',
                boardUrl: 'https://trello.com/b/AbC12xYz',
                sheet: 'Taskvane – Website Revamp',
                sheetUrl: 'https://docs.google.com/spreadsheets/d/1Qqwr…/edit',
                slackChannel: '#website-revamp',
                slackChannelId: 'C0123456789',
              },
              webhook: { id: '…', callback: '<API>/webhooks/trello' },
              imported: { imported: 0, skipped: 0 },
              warnings: [],
            })}
          />
          <p>
            Always read <code>warnings</code>. If a step fails after something was already created, the error lists what was made and the values to retry with (for example{' '}
            <code>sheet: &quot;1Qqwr…&quot;</code>), so nothing is created twice. More in <Link href="/docs/troubleshooting/">Troubleshooting</Link>.
          </p>
          <Callout type="ok">
            <strong>Setup is done.</strong> From now on, just work in Trello. See <Link href="/docs/daily-use/">Daily use</Link>.
          </Callout>
        </Step>
      </ol>
    </DocPage>
  );
}
