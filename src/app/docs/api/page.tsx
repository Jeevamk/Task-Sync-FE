import type { Metadata } from 'next';
import { ApiReference } from '@/components/ApiReference';
import { Callout } from '@/components/Docs';
import { apiInfo, endpointsBySection } from '@/lib/openapi';
import { API_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'API reference' };

export default function ApiPage() {
  const sections = endpointsBySection();
  const count = sections.reduce((n, s) => n + s.endpoints.length, 0);
  return (
    <article className="prose" style={{ maxWidth: 'none' }}>
      <h1>API reference</h1>
      <p className="lead">
        All {count} endpoints of the {apiInfo.title} (v{apiInfo.version}), with their fields, rules and examples. Request fields come straight from the backend’s own API
        description, so they always match the code.
      </p>

      <h2 style={{ marginTop: 24 }}>Authentication</h2>
      <ul>
        <li>
          <strong>Bearer token</strong>: most endpoints. Get a token from <code>POST /auth/dev-login</code> or <code>POST /auth/google</code>, then send{' '}
          <code>Authorization: Bearer &lt;token&gt;</code>. Every <code>/orgs/{'{orgId}'}/…</code> route also checks that you belong to that organization (403 otherwise).
        </li>
        <li>
          <strong>X-Sync-Secret</strong>: only the sheet import, called by the Apps Script.
        </li>
        <li>
          <strong>Trello signature</strong>: only the Trello webhook, signed by Trello itself.
        </li>
      </ul>

      <h2>Errors</h2>
      <p>
        Errors return a JSON body with a readable <code>message</code>, for example{' '}
        <code>{'{ "statusCode": 400, "message": "title is required", "error": "Bad Request" }'}</code>. Validation errors also list <code>errors</code> per field.
      </p>

      <Callout>
        Try requests live in the interactive docs at{' '}
        <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer">
          <code>{API_URL}/docs</code>
        </a>{' '}
        (click Authorize and paste your token).
      </Callout>

      <ApiReference sections={sections} />
    </article>
  );
}
