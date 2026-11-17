import { btn, btnPrimary, card } from './ui';

/**
 * Download button for the sample sheet. The files are static (public/downloads/), written by the backend's
 * `npm run export:openapi` from the same headers as GET /sheet-template, so the button works without the API.
 */
const DIR = '/downloads';

const CSV_TABS = [
  ['tasks', 'Tasks'],
  ['history', 'History'],
  ['import', 'Import'],
] as const;

export function SheetTemplateDownload() {
  return (
    <div className={`${card} my-5 !p-5`}>
      <p className="!mt-0 font-semibold">Download the sample sheet</p>
      <p>
        One file with the <strong>Tasks</strong>, <strong>History</strong> and <strong>Import</strong> tabs, every header already in row 1.
      </p>
      <a href={`${DIR}/taskvane-sheet-template.xlsx`} download className={`${btn} ${btnPrimary} px-4 py-2 text-[14px] !no-underline`}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14" />
        </svg>
        Download sample sheet (.xlsx)
      </a>
      <p className="!mb-0 text-[14px] text-fg-soft">
        Only one tab’s headers, as CSV:{' '}
        {CSV_TABS.map(([tab, label], i) => (
          <span key={tab}>
            {i > 0 && ' · '}
            <a href={`${DIR}/taskvane-${tab}-template.csv`} download>
              {label}
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}
