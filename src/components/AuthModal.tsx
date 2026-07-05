"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  reason?: "ai" | "save" | "order" | null;
}

const RESEND_COOLDOWN = 30;

export default function AuthModal({ isOpen, onClose, onAuthenticated, reason }: Props) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { signInWithOtp, verifyOtp, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (!isOpen) {
      setStep("email");
      setEmail("");
      setOtp("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setResendCooldown(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    // If error, Google redirect didn't happen
    if (error) {
      setGoogleLoading(false);
      setErrorMsg(error.message);
    }
    // If no error, page redirects to Google — no need to reset loading
  };

  const sendOtp = async (isResend = false) => {
    const setter = isResend ? setResending : setLoading;
    setter(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await signInWithOtp(email);
    setter(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setResendCooldown(RESEND_COOLDOWN);
      if (isResend) {
        setSuccessMsg("Code resent! Check your inbox.");
        setOtp("");
      } else {
        setStep("otp");
      }
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setErrorMsg(null);

    const { error } = await verifyOtp(email, otp);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      onAuthenticated();
    }
  };

  const titles = {
    ai: "Sign in to use AI",
    save: "Sign in to save recipes",
    order: "Sign in to order",
    default: "Welcome to Last-Minute Chef",
  };
  const subtitles = {
    ai: "Create an account to generate AI-powered recipes.",
    save: "Sign in to save your favourite recipes.",
    order: "Sign in to order missing ingredients.",
    default: "Sign in or create an account — it's instant.",
  };

  const title = reason ? titles[reason] : titles.default;
  const subtitle = reason ? subtitles[reason] : subtitles.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-ambient-3 animate-fade-up p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-primary/15">
            🍳
          </div>
          <h3 className="font-[var(--font-display)] text-xl font-bold text-on-surface">{title}</h3>
          <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-xl text-sm font-medium text-center border border-error/15">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-secondary/10 text-secondary rounded-xl text-sm font-medium text-center border border-secondary/15">
            ✓ {successMsg}
          </div>
        )}

        {step === "email" ? (
          <div className="space-y-4">
            {/* Google Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container hover:bg-surface-container-high transition-all text-sm font-semibold text-on-surface shadow-ambient-1"
            >
              {googleLoading ? (
                <span className="spinner w-5 h-5" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-outline-variant/20" />
              <span className="text-xs text-on-surface-variant">or sign in with email</span>
              <div className="flex-1 h-px bg-outline-variant/20" />
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && isValidEmail && sendOtp(false)}
                placeholder="you@example.com"
                className="input-well w-full px-4 py-3 bg-transparent text-on-surface text-sm placeholder:text-outline outline-none focus:outline-none focus:ring-0"
                id="email-input"
                autoFocus
                autoComplete="email"
              />
            </div>

            <button
              onClick={() => sendOtp(false)}
              disabled={!isValidEmail || loading}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <span className="spinner w-5 h-5" /> : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Code
                </>
              )}
            </button>

            <p className="text-center text-xs text-on-surface-variant pt-1">
              No password needed. We&apos;ll email you a one-time code.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center bg-surface-container rounded-xl p-3">
              <p className="text-xs text-on-surface-variant">Code sent to</p>
              <p className="text-sm font-semibold text-on-surface mt-0.5 truncate">{email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">6-digit Code</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && handleVerify()}
                placeholder="— — — — — —"
                className="input-well w-full px-4 py-3.5 bg-transparent text-center text-on-surface text-xl tracking-[0.6em] font-bold placeholder:text-outline placeholder:tracking-normal placeholder:text-sm placeholder:font-normal outline-none focus:outline-none focus:ring-0"
                id="otp-input"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
              />
              <p className="text-xs text-on-surface-variant mt-2 text-center">Check your inbox (and spam folder)</p>
            </div>

            <button
              onClick={handleVerify}
              disabled={otp.length < 6 || loading}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {loading ? <span className="spinner w-5 h-5" /> : "Verify & Continue →"}
            </button>

            {/* Resend + change email row */}
            <div className="flex items-center justify-between text-sm pt-1">
              <button
                onClick={() => { setStep("email"); setOtp(""); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                ← Change email
              </button>
              <button
                onClick={() => sendOtp(true)}
                disabled={resendCooldown > 0 || resending}
                className="font-semibold text-primary hover:text-primary-dark disabled:text-on-surface-variant disabled:cursor-not-allowed transition-colors"
              >
                {resending ? (
                  <span className="flex items-center gap-1.5"><span className="spinner w-3.5 h-3.5" /> Sending…</span>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend code"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
