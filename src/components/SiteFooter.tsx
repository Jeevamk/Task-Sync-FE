import Link from 'next/link';
import { API_URL } from '@/lib/site';
import { LogoMark } from './Logo';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div>
          <div className="logo" style={{ fontSize: 15 }}>
            <LogoMark size={22} /> Task Sync
          </div>
          <p style={{ margin: '8px 0 0' }}>Trello, Google Sheets and Slack, always in step.</p>
        </div>
        <nav aria-label="Footer">
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
