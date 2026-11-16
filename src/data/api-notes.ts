/**
 * Human-written notes for the API reference: a summary, what the endpoint does, and an example response.
 * Request fields and parameters come from openapi.json (exported from the backend), so they never drift.
 * Key: "METHOD /path" exactly as in openapi.json.
 */
export type ApiNote = {
  section: string;
  summary: string;
  description?: string;
  status?: string;
  bodyExample?: unknown;
  response?: unknown;
  /** Short tips shown under the endpoint. */
  tips?: string[];
};

export const SECTION_ORDER = ['Login', 'Organizations', 'Connections', 'Team', 'Projects', 'Cards', 'Sheets', 'Webhooks', 'Health'];

export const SECTION_INFO: Record<string, { title: string; intro: string }> = {
  Login: { title: 'Login', intro: 'Get a token. Send it on every other request as  Authorization: Bearer <token>. Tokens are valid for 7 days.' },
  Organizations: { title: 'Organizations', intro: 'An organization is your team. Its Trello, Slack, team list and projects are never visible to other organizations.' },
  Connections: {
    title: 'Connections',
    intro:
      'Connect the organization’s own Trello account, Slack workspace and (optionally) Google account. Tokens are stored encrypted. No account yet? Every start call returns a free signupUrl.',
  },
  Team: { title: 'Team', intro: 'The people who work on your boards and their role. Taskvane uses this list to recognise who moved a card.' },
  Projects: { title: 'Projects', intro: 'A project links one Trello board to one Google Sheet and one Slack channel.' },
  Cards: { title: 'Cards', intro: 'Create Trello cards from your own tools. They then sync like any card made in Trello.' },
  Sheets: { title: 'Sheet import', intro: 'Called by the Apps Script inside the Google Sheet (Import tab). Authenticated with the X-Sync-Secret header.' },
  Webhooks: { title: 'Trello webhook', intro: 'Called by Trello only. Every request is signed by Trello; manual calls get 401.' },
  Health: { title: 'Health', intro: 'For monitoring.' },
};

const ORG = 'a656f57d-751e-486f-b15b-4a2e067ddb1a';
const PROJECT = 'f3b1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const SIGNUP = {
  trello: { signupUrl: 'https://trello.com/signup', howTo: 'No Trello account? Create one free at the signup link, then open authorizeUrl and click Allow.' },
  slack: { signupUrl: 'https://slack.com/get-started#/createnew', howTo: 'No Slack workspace? Create one free at the signup link, then open authorizeUrl and click Allow.' },
  google: { signupUrl: 'https://accounts.google.com/signup', howTo: 'No Google account? Create one free at the signup link, then open authorizeUrl and click Allow.' },
};

export const API_NOTES: Record<string, ApiNote> = {
  // ── Login ──
  'POST /auth/dev-login': {
    section: 'Login',
    summary: 'Log in with an email (testing only)',
    description: 'Creates the user on first use. Only works when the server has ALLOW_DEV_LOGIN=true and is not in production.',
    response: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…', user: { id: '11111111-…', email: 'you@example.com', name: 'Your Name' } },
  },
  'POST /auth/google': {
    section: 'Login',
    summary: 'Log in with Google',
    description: 'Send the ID token from Google Sign-In (used by the web app). Returns the same token as dev login.',
    response: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…', user: { id: '11111111-…', email: 'you@company.com', name: 'Your Name' } },
  },
  'GET /auth/me': {
    section: 'Login',
    summary: 'Who am I',
    description: 'The logged-in user and the organizations they belong to.',
    response: { id: '11111111-…', email: 'you@company.com', name: 'Your Name', organizations: [{ id: ORG, name: 'Acme Dev Team', role: 'OWNER' }] },
  },

  // ── Organizations ──
  'POST /orgs': {
    section: 'Organizations',
    summary: 'Create an organization',
    description: 'You become its OWNER. Copy the id: it is the orgId of every other request.',
    status: '201',
    response: { id: ORG, name: 'Acme Dev Team', role: 'OWNER' },
    tips: ['Create it once. The team list and the projects must be in the same organization, or moves are not recognised.'],
  },
  'GET /orgs': {
    section: 'Organizations',
    summary: 'List my organizations',
    response: [{ id: ORG, name: 'Acme Dev Team', role: 'OWNER' }],
  },
  'GET /orgs/{orgId}': {
    section: 'Organizations',
    summary: 'Organization overview',
    description: 'Connection status, counts, and the email your Google Sheets must be shared with.',
    response: {
      id: ORG,
      name: 'Acme Dev Team',
      connections: {
        trello: { connected: true, account: 'Athira Shivaram (@athirashivaram)', since: '2026-11-12T16:40:00.000Z' },
        slack: { connected: true, account: 'Acme workspace', since: '2026-11-12T16:42:00.000Z' },
        google: { connected: true, account: 'athira@company.com', since: '2026-11-12T16:45:00.000Z' },
      },
      googleSheets: { shareWith: 'taskvane@your-project.iam.gserviceaccount.com', howTo: 'Share your tracker sheet with this email as Editor' },
      projects: 1,
      teamMembers: 4,
    },
  },

  // ── Connections ──
  'GET /orgs/{orgId}/setup': {
    section: 'Connections',
    summary: 'Setup checklist (new users start here)',
    description:
      'Every setup step in order, whether it is done, and the request to send next. Steps not done yet include a free signupUrl. "ready" is true once Trello and Slack are connected and a project exists; Google is optional (only for sheet: "new").',
    response: {
      ready: false,
      nextStep: 'Add Taskvane to Slack',
      steps: [
        { step: 'Connect Trello', done: true, account: 'Athira Shivaram (@athirashivaram)' },
        { step: 'Add Taskvane to Slack', done: false, next: `POST /orgs/${ORG}/connections/slack/start`, ...SIGNUP.slack },
        {
          step: 'Connect Google',
          done: false,
          next: `POST /orgs/${ORG}/connections/google/start`,
          ...SIGNUP.google,
          optional: 'Only needed for sheet: "new". Skip it if you share your own sheet.',
        },
        {
          step: 'Create a project',
          done: false,
          next: `POST /orgs/${ORG}/projects`,
          example: { name: 'My Project', trelloBoard: 'new', sheet: 'new', slackChannelId: 'new' },
        },
      ],
    },
    tips: ['Call it again after each step: nextStep always names what to do now.'],
  },
  'GET /orgs/{orgId}/connections': {
    section: 'Connections',
    summary: 'Connection status',
    description: 'Trello, Slack and Google. A provider that is not connected yet shows where to create a free account.',
    response: {
      trello: { connected: true, account: 'Athira Shivaram (@athirashivaram)', since: '2026-11-12T16:40:00.000Z' },
      slack: { connected: false, ...SIGNUP.slack },
      google: { connected: false, ...SIGNUP.google },
    },
  },
  'POST /orgs/{orgId}/connections/trello/start': {
    section: 'Connections',
    summary: 'Connect Trello',
    description:
      'Returns a link. Open it in the browser, click Allow, and the page confirms “Trello connected”. The link works once, for 10 minutes. No Trello account? Create one at signupUrl first.',
    status: '201',
    response: { authorizeUrl: 'https://trello.com/1/authorize?expiration=never&scope=read,write&…', ...SIGNUP.trello },
  },
  'POST /orgs/{orgId}/connections/slack/start': {
    section: 'Connections',
    summary: 'Add Taskvane to Slack',
    description:
      'Returns a link. Open it, pick the workspace and click Allow. The link works once, for 10 minutes. No workspace? Create one free at signupUrl: you are then its admin and can install apps.',
    status: '201',
    response: { authorizeUrl: 'https://slack.com/oauth/v2/authorize?client_id=…&scope=chat:write,…,channels:manage,channels:join', ...SIGNUP.slack },
    tips: ['Connected Slack before slackChannelId "new" existed? Click Add to Slack once more: creating channels needs two new permissions.'],
  },
  'POST /orgs/{orgId}/connections/google/start': {
    section: 'Connections',
    summary: 'Connect Google',
    description:
      'Optional: only needed so Taskvane can create the project sheet for you (sheet: "new"). Returns a link: open it, pick your Google account and click Allow (keep the Google Drive box ticked). Taskvane can only see the files it creates, nothing else in your Drive.',
    status: '201',
    response: { authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=openid%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&…', ...SIGNUP.google },
    tips: ['Returns 400 “Connect Google is not set up on this server” until the server has GOOGLE_OAUTH_CLIENT_SECRET.'],
  },
  'DELETE /orgs/{orgId}/connections/{provider}': {
    section: 'Connections',
    summary: 'Disconnect Trello, Slack or Google',
    description: 'provider is trello, slack or google. Deletes the stored token. Projects stop syncing until you connect Trello or Slack again; disconnecting Google only stops sheet: "new" (existing sheets keep working).',
    response: { ok: true },
  },

  // ── Team ──
  'GET /orgs/{orgId}/team': {
    section: 'Team',
    summary: 'List the team',
    response: [
      { id: '7c1e…', name: 'Athira', email: 'athira@company.com', role: 'COORDINATOR', trelloMemberId: '6aec770a5c35277898138c83', slackUserId: 'U0123456789', active: true },
    ],
  },
  'POST /orgs/{orgId}/team': {
    section: 'Team',
    summary: 'Add or update a team member',
    description:
      'Matched by email: sending the same email again updates the member. The Trello account is looked up from the username, the Slack user from the email. Read "notes" to see what was matched.',
    status: '201',
    bodyExample: { name: 'Athira', email: 'athira@company.com', role: 'COORDINATOR', trello: '@athirashivaram' },
    response: {
      member: { id: '7c1e…', name: 'Athira', email: 'athira@company.com', role: 'COORDINATOR', trelloMemberId: '6aec770a5c35277898138c83', slackUserId: 'U0123456789', active: true },
      notes: ['Trello: Athira Shivaram (@athirashivaram)', 'Slack: found by email'],
    },
    tips: ['Use the same email as the person’s Slack account, so they get @mentions.'],
  },
  'DELETE /orgs/{orgId}/team/{memberId}': {
    section: 'Team',
    summary: 'Remove a team member',
    description: 'The member is deactivated, not deleted: their name stays in the history.',
    response: { ok: true },
  },

  // ── Projects ──
  'GET /orgs/{orgId}/trello/boards': {
    section: 'Projects',
    summary: 'Trello boards you can use',
    description: 'Open boards the connected Trello account can see.',
    response: [{ id: '6730b1…', name: 'Website Revamp', url: 'https://trello.com/b/AbC12xYz/website-revamp' }],
  },
  'GET /orgs/{orgId}/slack/channels': {
    section: 'Projects',
    summary: 'Slack channels you can use',
    description: 'Channels in the connected workspace. For a private channel, first type /invite @Taskvane in it. Or skip this and create the project with slackChannelId "new".',
    response: [{ id: 'C0123456789', name: 'proj-website', is_private: false, is_member: true }],
  },
  'GET /orgs/{orgId}/projects': {
    section: 'Projects',
    summary: 'List projects',
    response: [{ id: PROJECT, name: 'Website Revamp', trelloBoardId: '6730b1…', sheetId: '1Qqwr…', slackChannelId: 'C0123456789', active: true, _count: { tasks: 12 } }],
  },
  'POST /orgs/{orgId}/projects': {
    section: 'Projects',
    summary: 'Create a project',
    description:
      'Uses your board, sheet and channel, or creates any of them when you send "new". Everything is checked first (nothing changes if a check fails). Then new things are created in the order sheet → Slack channel → board, the Trello webhook is registered and the open cards are imported.',
    status: '201',
    bodyExample: {
      name: 'Website Revamp',
      trelloBoard: 'new',
      sheet: 'new',
      slackChannelId: 'new',
      extraLists: ['Backlog'],
    },
    response: {
      project: {
        id: PROJECT,
        name: 'Website Revamp',
        board: 'Website Revamp',
        boardUrl: 'https://trello.com/b/AbC12xYz',
        sheet: 'Taskvane – Website Revamp',
        sheetUrl: 'https://docs.google.com/spreadsheets/d/1Qqwr…/edit',
        slackChannel: '#website-revamp',
        slackChannelId: 'C0123456789',
      },
      webhook: { id: '6734…', callback: 'https://api.example.com/webhooks/trello' },
      imported: { imported: 4, skipped: 0 },
      warnings: ['Created the extra list "Backlog" on the board (cards there are not tracked)'],
    },
    tips: [
      'New user? Send "new" for trelloBoard, sheet and slackChannelId and Taskvane creates all three. sheet "new" needs Connect Google; the others only need Trello and Slack connected.',
      'Or use your own: a board link, a sheet link shared with the Taskvane email, and a channel id from …/slack/channels. You can mix both.',
      'newBoardName, newSheetName and newChannelName set the names (defaults: the project name, “Taskvane – <name>”, and the slugified name).',
      'If a step fails after something was created, the 400 lists what was made and the ids to retry with, so nothing is created twice.',
      'Always read "warnings".',
    ],
  },
  'GET /orgs/{orgId}/projects/{projectId}': {
    section: 'Projects',
    summary: 'Project details',
    response: { id: PROJECT, name: 'Website Revamp', trelloBoardId: '6730b1…', listMap: { '6730b2…': 'TODO', '6730b3…': 'ASSIGNED' }, sheetId: '1Qqwr…', slackChannelId: 'C0123456789', active: true },
  },
  'DELETE /orgs/{orgId}/projects/{projectId}': {
    section: 'Projects',
    summary: 'Stop syncing a project',
    description: 'Removes the Trello webhook and deactivates the project; its tasks and history are kept.',
    response: { ok: true },
  },
  'GET /orgs/{orgId}/projects/{projectId}/board-members': {
    section: 'Projects',
    summary: 'Members of the project board',
    description: 'Use the id values as memberIds when creating a card.',
    response: [{ id: '6aec770a5c35277898138c83', fullName: 'Athira Shivaram', username: 'athirashivaram' }],
  },
  'POST /orgs/{orgId}/projects/{projectId}/webhook': {
    section: 'Projects',
    summary: 'Register the Trello webhook again',
    description: 'Needed when the API address changed (for example a new ngrok address) or Trello stopped sending changes.',
    status: '201',
    response: { id: '6734…', callback: 'https://api.example.com/webhooks/trello' },
  },
  'POST /orgs/{orgId}/projects/{projectId}/import': {
    section: 'Projects',
    summary: 'Import open cards again',
    description: 'Cards Taskvane already knows are skipped.',
    status: '201',
    response: { imported: 2, skipped: 10 },
  },

  // ── Cards ──
  'POST /orgs/{orgId}/projects/{projectId}/cards': {
    section: 'Cards',
    summary: 'Create a Trello card',
    tips: [
      'No list given: the card goes to Assigned when memberIds are given, otherwise To Do.',
      'A wrong list, member, label or date returns 400 with the valid choices.',
    ],
  },

  // ── Sheet import ──
  'POST /webhooks/sheets/import': {
    section: 'Sheets',
    summary: 'Create Trello cards from sheet rows',
    tips: ['The editor must be a COORDINATOR in the team of the organization that owns the sheet.', 'Up to 100 rows per request. The same row key never creates a second card.'],
  },

  // ── Webhooks ──
  'GET /webhooks/trello': {
    section: 'Webhooks',
    summary: 'Webhook check',
    description: 'Trello calls this (and HEAD) when the webhook is registered. Always answers 200.',
    response: { ok: true },
  },
  'POST /webhooks/trello': {
    section: 'Webhooks',
    summary: 'Receive a Trello change',
    description:
      'Trello sends every change on a registered board here. The X-Trello-Webhook header must be Base64(HMAC-SHA1(app secret, body + callback URL)); anything else gets 401 “Invalid Trello signature”.',
    response: { ok: true, outcome: 'applied' },
  },

  // ── Health ──
  'GET /health': {
    section: 'Health',
    summary: 'Health check',
    description: '200 when the database is up, 503 otherwise. n8n is optional.',
    response: {
      status: 'ok',
      checks: { database: { status: 'up' }, n8n: { status: 'not-configured' } },
      outbox: { SENT: 128, PENDING: 0 },
      time: '2026-11-12T17:30:00.000Z',
    },
  },
};
