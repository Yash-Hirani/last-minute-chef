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

  const handleGetOtp = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1200);
  };

  const handleVerify = () => {
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("lmc_auth", JSON.stringify({ phone, name: "Chef User", ts: Date.now() }));
      onAuthenticated();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-ambient-3 animate-fade-up p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-primary/15">🛒</div>
          <h3 className="font-[var(--font-display)] text-xl font-bold text-on-surface">Sign in with Instamart</h3>
          <p className="text-sm text-on-surface-variant mt-1">Quick sign-in to save recipes & order</p>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Phone Number</label>
              <div className="flex gap-2 input-well px-4 py-3">
                <span className="text-on-surface-variant font-medium text-sm">+91</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter your number" className="flex-1 bg-transparent outline-none text-on-surface text-sm placeholder:text-outline" id="phone-input" autoFocus />
              </div>
            </div>
            <button onClick={handleGetOtp} disabled={phone.length < 10 || loading} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <span className="spinner w-5 h-5" /> : "Get OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-center text-on-surface-variant">OTP sent to +91 {phone}</p>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Enter OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="4-digit OTP" className="input-well w-full px-4 py-3 bg-transparent text-center text-on-surface text-lg tracking-[0.5em] font-bold placeholder:text-outline placeholder:tracking-normal placeholder:text-sm placeholder:font-normal outline-none" id="otp-input" maxLength={4} autoFocus />
            </div>
            <button onClick={handleVerify} disabled={otp.length < 4 || loading} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <span className="spinner w-5 h-5" /> : "Verify & Continue"}
            </button>
            <button onClick={() => { setStep("phone"); setOtp(""); }} className="w-full text-center text-sm text-primary hover:text-primary-dark transition-colors font-medium">Change number</button>
          </div>
        )}
      </div>
    </div>
  );
}
