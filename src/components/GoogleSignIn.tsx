'use client';
import Link from 'next/link';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clearSession, fetchMe, GOOGLE_CLIENT_ID, loadSession, Me, saveSession, Session, signInWithGoogle } from '@/lib/auth';
import { CodeBlock } from './CodeBlock';
import { Callout } from './Docs';
import { btn, btnGhost, btnPrimary, card } from './ui';

/** The parts of Google Identity Services (https://accounts.google.com/gsi/client) used here. */
type GoogleId = {
  initialize(options: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean; context?: string }): void;
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
  disableAutoSelect(): void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

type State = { kind: 'loading' } | { kind: 'signed-out'; error?: string } | { kind: 'signing-in' } | { kind: 'signed-in'; session: Session };

/** "Sign in with Google" → Taskvane token, plus what to do with it. */
export function GoogleSignIn() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [googleReady, setGoogleReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // A saved session (from an earlier visit) is only readable in the browser, so check it after the first render.
  useEffect(() => {
    const saved = loadSession();
    setState(saved ? { kind: 'signed-in', session: saved } : { kind: 'signed-out' });
  }, []);

  const onCredential = useCallback(async ({ credential }: { credential: string }) => {
    setState({ kind: 'signing-in' });
    try {
      const session = await signInWithGoogle(credential);
      saveSession(session);
      setState({ kind: 'signed-in', session });
    } catch (err) {
      setState({ kind: 'signed-out', error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  // Draw Google's button whenever the signed-out view is on screen.
  useEffect(() => {
    const google = window.google?.accounts.id;
    if (!googleReady || !google || state.kind !== 'signed-out' || !buttonRef.current) return;
    google.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onCredential, auto_select: false, context: 'signin' });
    google.renderButton(buttonRef.current, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 280 });
  }, [googleReady, state.kind, onCredential]);

  const signOut = () => {
    clearSession();
    window.google?.accounts.id.disableAutoSelect(); // don't sign the same account straight back in
    setState({ kind: 'signed-out' });
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Callout type="warn">
        Google sign-in is not set up on this site yet: <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> was not set when it was built. Whoever runs Taskvane needs to add it
        (see the README).
      </Callout>
    );
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setGoogleReady(true)} />
      {state.kind === 'signed-in' ? (
        <SignedIn session={state.session} onSignOut={signOut} />
      ) : (
        <div className={`${card} flex flex-col items-center gap-4 text-center`}>
          <p className="!m-0 text-fg-soft">Use your Google account. No password to create, and Taskvane never sees your Google password.</p>
          {state.kind === 'signing-in' || state.kind === 'loading' ? (
            <p className="!m-0 h-[44px] leading-[44px] font-medium" role="status">
              {state.kind === 'signing-in' ? 'Signing you in…' : 'Loading…'}
            </p>
          ) : (
            <div ref={buttonRef} className="min-h-[44px]" aria-label="Sign in with Google" />
          )}
          {state.kind === 'signed-out' && !googleReady && <p className="!m-0 text-[14px] text-fg-faint">Loading Google sign-in…</p>}
          {state.kind === 'signed-out' && state.error && (
            <div className="w-full text-left">
              <Callout type="warn">
                <strong>Sign-in failed.</strong> {state.error}
              </Callout>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SignedIn({ session, onSignOut }: { session: Session; onSignOut: () => void }) {
  const [me, setMe] = useState<Me | null>(null);
  const [meError, setMeError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe(session.token).then(setMe, (err: unknown) => setMeError(err instanceof Error ? err.message : String(err)));
  }, [session.token]);

  return (
    <div className="flex flex-col gap-5">
      <div className={`${card} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <p className="!m-0 text-[14px] text-fg-faint">Signed in as</p>
          <p className="!m-0 text-[17px] font-semibold">{session.user.name}</p>
          <p className="!m-0 text-fg-soft">{session.user.email}</p>
        </div>
        <button type="button" onClick={onSignOut} className={`${btn} ${btnGhost} cursor-pointer px-4 py-2 text-[14px]`}>
          Sign out
        </button>
      </div>

      <div>
        <h2 className="!mt-0">Your organizations</h2>
        {meError ? (
          <Callout type="warn">{meError}</Callout>
        ) : !me ? (
          <p className="text-fg-soft">Loading…</p>
        ) : me.organizations.length === 0 ? (
          <p>
            None yet. Create one in step 2 of <Link href="/docs/setup/">Set up your team</Link>.
          </p>
        ) : (
          <ul>
            {me.organizations.map((o) => (
              <li key={o.id}>
                <strong>{o.name}</strong> ({o.role.toLowerCase()}) · <code>{o.id}</code>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Use the API</h2>
        <p>
          Until the Taskvane app is ready, you set things up through the API. The API reference page uses your sign-in automatically: pick an endpoint and press
          <strong> Send</strong>. The token works for <strong>7 days</strong>; after that, sign in here again.
        </p>
        <CodeBlock lang="text" title="Your Taskvane token (keep it private)" code={session.token} />
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/api/" className={`${btn} ${btnPrimary} px-4 py-2 text-[14px] !no-underline`}>
            Try the API
          </Link>
          <Link href="/docs/setup/" className={`${btn} ${btnGhost} px-4 py-2 text-[14px] !no-underline`}>
            Next: set up your team
          </Link>
        </div>
      </div>
    </div>
  );
}
