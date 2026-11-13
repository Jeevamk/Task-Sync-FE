/** Address of the Taskvane API (backend project). Set NEXT_PUBLIC_API_URL when building. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const SITE = {
  name: 'Taskvane',
  tagline: 'Trello, Google Sheets and Slack, always in step.',
  description:
    'Taskvane keeps Trello, a Google Sheet and Slack in step for your team: every card change is recorded in the sheet, posted to a Slack thread, and checked against your team rules.',
};

/** Documentation pages, in reading order (used by the sidebar and the previous/next links). */
export const DOCS_NAV: { group: string; items: { href: string; title: string }[] }[] = [
  {
    group: 'Guide',
    items: [
      { href: '/docs/', title: 'Getting started' },
      { href: '/docs/setup/', title: 'Set up your team' },
      { href: '/docs/daily-use/', title: 'Daily use' },
      { href: '/docs/cards/', title: 'Creating cards' },
      { href: '/docs/rules/', title: 'Team rules' },
      { href: '/docs/sheet-and-slack/', title: 'Sheet & Slack output' },
      { href: '/docs/manage/', title: 'Managing projects' },
      { href: '/docs/troubleshooting/', title: 'Troubleshooting' },
    ],
  },
  { group: 'Reference', items: [{ href: '/docs/api/', title: 'API reference' }] },
];
