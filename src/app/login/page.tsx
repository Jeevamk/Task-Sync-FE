import type { Metadata } from 'next';
import { GoogleSignIn } from '@/components/GoogleSignIn';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="wrap pt-14 pb-20">
      <div className="prose mx-auto max-w-[640px]">
        <h1>Sign in to Taskvane</h1>
        <GoogleSignIn />
      </div>
    </div>
  );
}
