'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Reads ?mode=register once on mount so the navbar's "Sign up" button
  // (which links to /login?mode=register) opens directly into the create-
  // account form instead of defaulting to sign-in with an extra click.
  const [isRegister, setIsRegister] = useState(() => searchParams.get('mode') === 'register');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  async function handleSubmit() {
    setLoading(true);
    setMessage('');

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setMessage('Account created! Check your email to confirm.');
        setMessageType('success');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        window.location.href = '/series';
      }
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-blush/30 via-transparent to-brand-lilac/30 blur-2xl" />

        <div className="text-center mb-6">
          <Link href="/" className="font-heading text-2xl text-foreground inline-flex items-center gap-1.5">
            🌸 BLumi
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(88,54,99,0.1)] p-8">
          <h1 className="font-heading text-2xl font-normal text-foreground mb-1.5">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground text-[14px] mb-6">
            {isRegister ? 'Join BLumi and start discovering.' : 'Sign in to continue your journey.'}
          </p>

          <div className="flex flex-col gap-3.5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-ring transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-ring transition-colors"
            />

            {message && (
              <p className={'text-[13px] ' + (messageType === 'error' ? 'text-destructive' : 'text-primary')}>
                {message}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-brand-gradient disabled:opacity-60 text-white py-3 rounded-full text-[14px] font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>

            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-muted-foreground hover:text-primary text-[13px] transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
