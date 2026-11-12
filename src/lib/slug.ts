/** Anchor id for an endpoint, e.g. ("POST", "/orgs/{orgId}/team") -> "post-orgs-orgid-team". */
export function slugFor(method: string, path: string): string {
  return `${method}-${path}`
    .toLowerCase()
    .replace(/[{}]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
