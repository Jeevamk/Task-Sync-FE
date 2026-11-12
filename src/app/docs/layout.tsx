import type { ReactNode } from 'react';
import { DocsNav } from '@/components/DocsNav';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container docs">
      <DocsNav />
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
