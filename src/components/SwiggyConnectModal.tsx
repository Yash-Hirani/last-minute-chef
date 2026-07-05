"use client";

import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export default function SwiggyConnectModal({ isOpen, onClose, onConnected }: Props) {
  const [step, setStep] = useState<"intro" | "connecting" | "success">("intro");

  useEffect(() => {
    if (!isOpen) {
      setStep("intro");
    }
  }, [isOpen]);

  const handleConnect = () => {
    setStep("connecting");
    // Simulate OAuth delay
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onConnected();
      }, 1500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 backdrop-blur-md p-4 transition-all">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-[28px] shadow-ambient-3 slide-in-up md:animate-fade-up overflow-hidden relative">
        {step === "intro" && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-surface-container-high/50 hover:bg-surface-container-high transition-colors z-10">
            <svg className="w-5 h-5 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        <div className="p-8 text-center flex flex-col items-center">
          {step === "intro" ? (
            <>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-3xl shadow-lg shadow-primary/20">
                  🍳
                </div>
                <div className="flex gap-1.5 items-center text-outline-variant/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#FF5200] flex items-center justify-center shadow-lg shadow-[#FF5200]/20">
                  <svg width="32" height="32" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#fff" d="M31.996 23.565v-6.216a.735.735 0 0 0-.731-.732.735.735 0 0 0-.733.732v7.302c0 .414.336.744.744.744h.714c10.374 0 11.454.54 10.806 2.73-.03.108-.066.21-.102.324a.98.98 0 0 1-.018.066c-2.724 8.214-10.092 18.492-12.27 21.432a.764.764 0 0 1-1.23 0c-1.314-1.776-4.53-6.24-7.464-11.304-.198-.462-.294-1.542 2.964-1.542h3.984c.222 0 .402.18.402.402v3.216c0 .384.282.738.666.768a.73.73 0 0 0 .582-.216.701.701 0 0 0 .216-.516v-4.362a.76.76 0 0 0-.756-.756h-8.052c-1.404 0-2.256-1.2-2.814-2.292-1.752-3.672-3.006-7.296-3.006-10.152 0-7.314 5.832-13.896 13.884-13.896 7.17 0 12.6 5.214 13.704 11.52.007.054.048.294.054.342.288 3.096-7.788 2.742-11.184 2.76a.357.357 0 0 1-.36-.36v.006Z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-on-surface mb-2 font-[var(--font-display)]">Connect Swiggy</h2>
              <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                Allow <strong>Last-Minute Chef</strong> to create carts and place orders on Swiggy Instamart on your behalf using the MCP protocol.
              </p>
              <button onClick={handleConnect} className="w-full bg-[#FF5200] hover:bg-[#D24200] text-white py-3.5 rounded-[20px] font-bold shadow-lg shadow-[#FF5200]/20 transition-all active:scale-[0.98]">
                Authorize & Continue
              </button>
            </>
          ) : step === "connecting" ? (
            <div className="py-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-surface-container-high border-t-[#FF5200] animate-spin mb-6"></div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Authenticating...</h3>
              <p className="text-sm text-on-surface-variant">Securely connecting to Swiggy MCP</p>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-6 scale-in">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-1">Connected!</h3>
              <p className="text-sm text-on-surface-variant">Redirecting back to cart...</p>
            </div>
          )}
        </div>
        
        {step === "intro" && (
          <div className="bg-surface-container px-6 py-4 border-t border-outline-variant/10">
            <p className="text-[11px] text-on-surface-variant text-center leading-relaxed">
              By authorizing, you agree to the Swiggy Builders Club MCP terms of service and privacy policy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
