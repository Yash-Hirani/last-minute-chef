"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export default function AuthModal({ isOpen, onClose, onAuthenticated }: Props) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep("otp"); }, 800);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      setLoading(true);
      setTimeout(() => { setLoading(false); onAuthenticated(); setStep("phone"); setPhone(""); setOtp(""); }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl p-8 w-full max-w-sm animate-fade-up shadow-2xl">
        {/* Swiggy branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl mb-3 shadow-lg shadow-orange-500/20">🛒</div>
          <h2 className="text-xl font-bold font-[var(--font-display)]">Sign in with Instamart</h2>
          <p className="text-sm text-muted mt-1">Quick sign-in to save recipes &amp; order</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-light mb-1.5">Phone Number</label>
              <div className="flex items-center gap-2 glass rounded-xl px-4 py-3 focus-within:border-saffron/50">
                <span className="text-sm text-muted">+91</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter your number" className="flex-1 bg-transparent border-none outline-none text-foreground text-sm" autoFocus />
              </div>
            </div>
            <button type="submit" disabled={phone.length < 10 || loading} className="w-full btn-glow py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              {loading ? <><div className="spinner w-4 h-4" />Sending OTP...</> : "Get OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-light mb-1.5">Enter OTP sent to +91 {phone}</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 4-digit OTP" className="w-full glass rounded-xl px-4 py-3 bg-transparent border-none outline-none text-foreground text-sm text-center tracking-[0.5em] focus:border-saffron/50" autoFocus />
              <p className="text-xs text-muted mt-2 text-center">Demo: any 4+ digits work</p>
            </div>
            <button type="submit" disabled={otp.length < 4 || loading} className="w-full btn-glow py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              {loading ? <><div className="spinner w-4 h-4" />Verifying...</> : "Verify & Continue"}
            </button>
            <button type="button" onClick={() => setStep("phone")} className="w-full text-xs text-muted hover:text-foreground transition-colors py-1">← Change number</button>
          </form>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-light/50 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
