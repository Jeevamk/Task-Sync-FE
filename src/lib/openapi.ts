/**
 * Reads the API description exported from the backend (src/data/openapi.json, via
 * `npm run export:openapi` in task-sync-backend) and shapes it for the API reference page.
 */
import spec from '@/data/openapi.json';
import { API_NOTES, ApiNote, SECTION_INFO, SECTION_ORDER } from '@/data/api-notes';
import { slugFor } from '@/lib/slug';

type Schema = {
  $ref?: string;
  type?: string;
  format?: string;
  description?: string;
  example?: unknown;
  default?: unknown;
  enum?: unknown[];
  items?: Schema;
  properties?: Record<string, Schema>;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  maxItems?: number;
};

type Operation = {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: { name: string; in: string; required?: boolean; schema?: Schema; description?: string }[];
  requestBody?: { content?: Record<string, { schema?: Schema }> };
  responses?: Record<string, { description?: string; content?: Record<string, { schema?: Schema }> }>;
  security?: Record<string, string[]>[];
};

const doc = spec as unknown as {
  info: { title: string; version: string; description?: string };
  paths: Record<string, Record<string, Operation>>;
  components: { schemas: Record<string, Schema> };
};

export const apiInfo = doc.info;

function resolve(schema: Schema | undefined): Schema | undefined {
  if (!schema?.$ref) return schema;
  const name = schema.$ref.split('/').pop()!;
  return doc.components.schemas[name];
}

function refName(schema: Schema | undefined): string | undefined {
  return schema?.$ref?.split('/').pop() ?? (schema?.items?.$ref ? schema.items.$ref.split('/').pop() : undefined);
}

/** An example value built from the schema (uses the examples written in the backend DTOs). */
export function exampleFor(schema: Schema | undefined, depth = 0): unknown {
  const s = resolve(schema);
  if (!s || depth > 5) return null;
  if (s.example !== undefined) return s.example;
  if (s.default !== undefined) return s.default;
  if (s.enum?.length) return s.enum[0];
  if (s.type === 'array') return [exampleFor(s.items, depth + 1)];
  if (s.type === 'object' || s.properties) {
    const out: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(s.properties ?? {})) out[key] = exampleFor(prop, depth + 1);
    return out;
  }
  if (s.type === 'number' || s.type === 'integer') return 0;
  if (s.type === 'boolean') return false;
  return 'string';
}

export type Field = {
  name: string;
  type: string;
  required: boolean;
  description: string;
  /** Fields of the objects inside an array (e.g. "rows"). */
  children?: Field[];
};

function typeLabel(s: Schema | undefined): string {
  const r = resolve(s);
  if (!r) return 'any';
  if (r.enum?.length) return r.enum.map((v) => JSON.stringify(v)).join(' | ');
  if (r.type === 'array') return `${typeLabel(r.items)}[]`;
  if (s?.$ref) return 'object';
  return r.type ?? 'object';
}

function rules(s: Schema): string[] {
  const out: string[] = [];
  if (s.maxLength) out.push(`max ${s.maxLength} characters`);
  if (s.minLength && s.minLength > 1) out.push(`min ${s.minLength} characters`);
  if (s.maxItems) out.push(`max ${s.maxItems} items`);
  if (s.default !== undefined) out.push(`default ${JSON.stringify(s.default)}`);
  return out;
}

export function fieldsOf(schema: Schema | undefined, depth = 0): Field[] {
  const s = resolve(schema);
  if (!s?.properties || depth > 2) return [];
  return Object.entries(s.properties).map(([name, prop]) => {
    const r = resolve(prop) ?? prop;
    const extra = rules(prop);
    const itemSchema = r.type === 'array' ? resolve(r.items) : undefined;
    return {
      name,
      type: typeLabel(prop),
      required: (s.required ?? []).includes(name),
      description: [prop.description ?? r.description, extra.length ? `(${extra.join(', ')})` : ''].filter(Boolean).join(' '),
      children: itemSchema?.properties ? fieldsOf(r.items, depth + 1) : undefined,
    };
  });
}

export type Auth = 'bearer' | 'sync-secret' | 'trello-signature' | 'none';

export type Endpoint = {
  id: string;
  method: string;
  path: string;
  section: string;
  summary: string;
  description?: string;
  auth: Auth;
  params: { name: string; in: string; required: boolean; description: string }[];
  bodyName?: string;
  bodyFields: Field[];
  bodyExample?: unknown;
  status: string;
  responseExample?: unknown;
  note?: ApiNote;
};

function authOf(op: Operation, path: string): Auth {
  if (path.startsWith('/webhooks/trello')) return 'trello-signature';
  const names = (op.security ?? []).flatMap((s) => Object.keys(s));
  if (names.includes('sync-secret')) return 'sync-secret';
  if (names.includes('bearer')) return 'bearer';
  return 'none';
}

const PARAM_HELP: Record<string, string> = {
  orgId: 'Organization ID (from POST /orgs or GET /orgs)',
  projectId: 'Project ID (from GET /orgs/{orgId}/projects)',
  memberId: 'Team member ID (from GET /orgs/{orgId}/team)',
  provider: '"trello" or "slack"',
};

/** Every endpoint, grouped into sections in a fixed order. HEAD requests are left out. */
export function endpointsBySection(): { section: string; title: string; intro: string; endpoints: Endpoint[] }[] {
  const all: Endpoint[] = [];
  for (const [path, ops] of Object.entries(doc.paths)) {
    for (const [method, op] of Object.entries(ops)) {
      if (method === 'head') continue;
      const key = `${method.toUpperCase()} ${path}`;
      const note = API_NOTES[key];
      const bodySchema = op.requestBody?.content?.['application/json']?.schema;
      const [status, response] = Object.entries(op.responses ?? {})[0] ?? ['200', undefined];
      const responseSchema = response?.content?.['application/json']?.schema;
      all.push({
        id: slugFor(method, path),
        method: method.toUpperCase(),
        path,
        section: note?.section ?? op.tags?.[0] ?? 'Other',
        summary: op.summary ?? note?.summary ?? key,
        description: note?.description ?? op.description,
        auth: authOf(op, path),
        params: (op.parameters ?? []).map((p) => ({
          name: p.name,
          in: p.in,
          required: !!p.required,
          description: p.description ?? PARAM_HELP[p.name] ?? '',
        })),
        bodyName: refName(bodySchema),
        bodyFields: fieldsOf(bodySchema),
        bodyExample: note?.bodyExample ?? (bodySchema ? exampleFor(bodySchema) : undefined),
        status: note?.status ?? status,
        responseExample: note?.response ?? (responseSchema ? exampleFor(responseSchema) : undefined),
        note,
      });
    }
  }
  const sections = [...SECTION_ORDER, ...new Set(all.map((e) => e.section).filter((s) => !SECTION_ORDER.includes(s)))];
  return sections
    .map((section) => ({
      section,
      title: SECTION_INFO[section]?.title ?? section,
      intro: SECTION_INFO[section]?.intro ?? '',
      endpoints: all.filter((e) => e.section === section),
    }))
    .filter((s) => s.endpoints.length);
}
