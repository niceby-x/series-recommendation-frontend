'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Mail, Lock, Eye, EyeOff, Check, Heart, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Logo from './Logo';
import FlowerIcon from './FlowerIcon';

type Mode = 'login' | 'register';

const FEATURES = [
  { icon: FlowerIcon, title: 'Curated Picks' },
  { icon: Heart, title: 'Mood Discovery' },
  { icon: Sparkles, title: 'Smart Recommendations' },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3.02c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.28a12 12 0 0 0 0 10.8l4.01-3.11Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.6l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}

export default function AuthModal({
  isOpen,
  initialMode,
  onClose,
}: {
  isOpen: boolean;
  initialMode: Mode;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset to whichever mode the caller asked for each time the modal opens
  // (e.g. WatchlistButton always wants 'login', navbar's Sign up wants
  // 'register') and clear any stale state from a previous open. Adjusted
  // during render (rather than in an effect) so the reset is visible in the
  // same commit the modal opens in, with no flash of stale state.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMode(initialMode);
      setMessage('');
    }
  }

  // Escape to close, lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit() {
    setLoading(true);
    setMessage('');

    if (mode === 'register') {
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
        window.location.href = '/';
      }
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setMessage('Enter your email above first, then click "Forgot password?"');
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage(error.message);
      setMessageType('error');
    } else {
      setMessage('Password reset email sent -- check your inbox.');
      setMessageType('success');
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    });
    if (error) {
      setMessage(error.message);
      setMessageType('error');
      setLoading(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  // Shared field/button markup so the login and register panels stay
  // pixel-identical in height (no jump when sliding) -- the only real
  // difference between them is the remember-me/forgot-password row and
  // the heading copy.
  function renderFields(panelMode: Mode) {
    return (
      <div className="flex flex-col gap-2.5">
        <div>
          <label className="block text-foreground text-[13px] font-semibold mb-1">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-xl pl-11 pr-4 py-2 text-[14px] focus:outline-none focus:border-ring transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-foreground text-[13px] font-semibold mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-xl pl-11 pr-11 py-2 text-[14px] focus:outline-none focus:border-ring transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {panelMode === 'login' ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRememberMe((v) => !v)}
              className="flex items-center gap-2 text-[13px] text-foreground/70"
            >
              <span
                className={
                  'flex items-center justify-center size-4 rounded-[5px] border transition-colors ' +
                  (rememberMe ? 'bg-primary border-primary' : 'border-border bg-background')
                }
              >
                {rememberMe && <Check className="size-3 text-white" strokeWidth={3} />}
              </span>
              Remember me
            </button>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-primary text-[13px] font-semibold hover:opacity-80 transition-opacity"
            >
              Forgot password?
            </button>
          </div>
        ) : (
          // Invisible spacer matching the row above, so both panels are the
          // same height and the slide never jumps.
          <div className="h-4" aria-hidden="true" />
        )}

        {message && (
          <p className={'text-[13px] ' + (messageType === 'error' ? 'text-destructive' : 'text-primary')}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 bg-brand-gradient disabled:opacity-60 text-white py-2 rounded-full text-[14px] font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          {loading ? 'Please wait...' : (
            <>
              <FlowerIcon className="size-4" />
              {panelMode === 'register' ? 'Create Account' : 'Sign In'}
            </>
          )}
        </button>

        <div className="flex items-center gap-3 text-muted-foreground text-[12px]">
          <span className="h-px flex-1 bg-border" />
          or continue with
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 bg-background disabled:opacity-60 border border-border text-foreground py-2 rounded-full text-[14px] font-semibold hover:bg-muted transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          onClick={() => setMode(panelMode === 'login' ? 'register' : 'login')}
          className="text-muted-foreground hover:text-primary text-[13px] transition-colors"
        >
          {panelMode === 'login' ? (
            <>Don&apos;t have an account? <span className="text-primary font-semibold">Sign up</span></>
          ) : (
            'Already have an account? Sign in'
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden bg-card rounded-xl shadow-2xl grid lg:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex items-center justify-center size-8 rounded-full bg-background/80 backdrop-blur text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Left: scaled-down brand panel, hidden below lg -- swaps sides
            with the form panel via layout animation when mode toggles */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 160, damping: 26 }}
          className={'hidden lg:block relative overflow-hidden ' + (mode === 'register' ? 'order-2' : 'order-1')}
        >
          <Image src="/hero-bg-v3.png" alt="" fill sizes="380px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" aria-hidden="true" />

          <div className="relative h-full flex flex-col justify-center px-8 py-8">
            <Logo variant="full" theme="brand" size={26} className="mb-6" />
            <h2 className="font-heading text-3xl font-normal text-foreground leading-[1.1] mb-3">
              Where Stories<br />
              <span className="text-brand-gradient">Bloom</span>
            </h2>
            <p className="text-foreground/70 text-[13px] mb-6">
              Curated BL series, movies, and anime through moods, tropes, and heartfelt recommendations.
            </p>
            <div className="flex flex-col gap-3">
              {FEATURES.map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-center gap-2.5">
                  <span className="shrink-0 flex items-center justify-center size-8 rounded-full bg-white/70 backdrop-blur shadow-sm">
                    <Icon className="size-3.5 text-primary" strokeWidth={1.75} />
                  </span>
                  <p className="font-heading text-[13px] text-foreground">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: sliding login/register form -- also swaps sides with the
            brand panel above via the same layout animation */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 160, damping: 26 }}
          className={'p-6 sm:p-7 flex flex-col justify-center ' + (mode === 'register' ? 'order-1' : 'order-2')}
        >
          <div className="flex flex-col items-center text-center mb-4">
            <Logo variant="icon" theme="brand" size={36} className="mb-2" />
            <h2 className="font-heading text-xl font-normal text-foreground mb-1">
              {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-muted-foreground text-[13px]">
              {mode === 'register' ? 'Join BLumi and start discovering.' : 'Sign in to continue your journey.'}
            </p>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: mode === 'login' ? 'translateX(0%)' : 'translateX(-50%)' }}
            >
              <div className="w-1/2 shrink-0 pr-1">{renderFields('login')}</div>
              <div className="w-1/2 shrink-0 pl-1">{renderFields('register')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}