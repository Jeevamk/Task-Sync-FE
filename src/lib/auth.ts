/**
 * Sign-in with Google, done in the browser:
 * Google's button gives us an ID token → we send it to the API (POST /auth/google) → the API answers with a Taskvane token.
 * Only the Google *client ID* is needed here. It is public by design (it is visible in every Google sign-in page);
 * the client *secret* stays on the API server and is never used by this site.
 */
import { API_URL } from './site';

/** The same OAuth client ID as GOOGLE_OAUTH_CLIENT_ID on the API. Read at build time. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export interface Session {
  token: string;
  user: { id: string; email: string; name: string };
}

export interface Me {
  id: string;
  email: string;
  name: string;
  organizations: { id: string; name: string; role: string }[];
}

const KEY = 'taskvane.session';

/** The saved session, or null when there is none or its token has expired (Taskvane tokens last 7 days). */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session.token && !isExpired(session.token) ? session : (clearSession(), null);
  } catch {
    return null; // storage blocked (private window) or a damaged value: treat as signed out
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage blocked: the user stays signed in until the page is closed */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Reads the expiry from the token itself (the middle part of a JWT is plain base64url JSON). */
function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/** Calls the API and turns its errors into one readable message. */
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
  } catch {
    // fetch only throws when there is no answer at all: the API is down, or it refused this site (CORS).
    throw new Error(
      `Could not reach the Taskvane API at ${API_URL}. If it is online, its WEB_APP_URL setting must be this site's address (${window.location.origin}).`,
    );
  }
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  if (!res.ok) throw new Error(body?.message || `The API answered ${res.status}`);
  return body as T;
}

/** Exchanges Google's ID token for a Taskvane session. */
export function signInWithGoogle(idToken: string): Promise<Session> {
  return api<Session>('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) });
}

/** The signed-in user and their organizations. */
export function fetchMe(token: string): Promise<Me> {
  return api<Me>('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}
