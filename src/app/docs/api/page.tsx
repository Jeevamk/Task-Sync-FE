import type { Metadata } from 'next';
import Link from 'next/link';
import { ApiReference } from '@/components/ApiReference';
import { apiInfo, endpointsBySection } from '@/lib/openapi';

export const metadata: Metadata = { title: 'API reference' };

export default function ApiPage() {
  const sections = endpointsBySection();
  const count = sections.reduce((n, s) => n + s.endpoints.length, 0);
  return (
    <article className="prose max-w-none">
      <h1>API reference</h1>
      <p className="text-lg">
        Try all {count} endpoints of the {apiInfo.title} right here: no extra tools needed.
      </p>

      <ol className="mt-2">
        <li>
          <strong>Authorize</strong>: <Link href="/login/">sign in with Google</Link> (the token is picked up automatically) or paste a token below.
        </li>
        <li>
          <strong>Pick an endpoint</strong> from the list, fill in its fields and press <strong>Send</strong>. The real response appears right under it.
        </li>
        <li>
          IDs you create (organization, project, team member) are remembered and filled in for the next requests.
        </li>
      </ol>
      <p className="text-[14.5px] text-fg-soft">
        Errors come back as JSON with a readable <code>message</code>, e.g. <code>{'{ "statusCode": 400, "message": "title is required" }'}</code>. Every{' '}
        <code>/orgs/{'{orgId}'}/…</code> route also checks that you belong to that organization (403 otherwise).
      </p>

      <ApiReference sections={sections} />
    </article>
  );
}
