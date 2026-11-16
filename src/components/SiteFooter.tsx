import Link from 'next/link';
import { API_URL } from '@/lib/site';
import { LogoMark } from './Logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-soft pt-8 pb-10 text-sm text-fg-faint">
      <div className="wrap flex flex-wrap justify-between gap-x-8 gap-y-4">
        <div>
          <div className="inline-flex items-center gap-2.5 text-[15px] font-bold whitespace-nowrap text-fg">
            <LogoMark size={22} /> Taskvane
          </div>
          <p className="mt-2 mb-0">Trello, Google Sheets and Slack, always in step.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 [&_a]:text-fg-soft">
          <Link href="/docs/">Getting started</Link>
          <Link href="/docs/setup/">Setup guide</Link>
          <Link href="/docs/api/">API reference</Link>
          <Link href="/docs/troubleshooting/">Troubleshooting</Link>
          <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer">
            Live API (Swagger)
          </a>
        </nav>
      </div>
    </footer>
  );
}
