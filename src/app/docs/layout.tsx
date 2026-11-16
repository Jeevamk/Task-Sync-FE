import type { ReactNode } from 'react';
import { DocsNav } from '@/components/DocsNav';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wrap grid gap-8 pt-8 pb-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
      <DocsNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
