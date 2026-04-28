"use client";

import { CartItem } from "@/lib/types";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, items, subtotal, deliveryFee, total, onCheckout }: Props) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      onCheckout();
      setCheckingOut(false);
      setOrderPlaced(true);
      setTimeout(() => setOrderPlaced(false), 4000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-strong h-full slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <h2 className="text-lg font-bold font-[var(--font-display)]">Your Cart</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-saffron/20 text-saffron">{items.length} items</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-light/50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Order success */}
        {orderPlaced && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-cardamom/10 border border-cardamom/20 animate-fade-up">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✅</span>
              <span className="font-semibold text-cardamom">Order Confirmed!</span>
            </div>
            <p className="text-sm text-muted">Estimated delivery: 15-25 minutes</p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-muted text-sm">Your cart is empty</p>
              <p className="text-xs text-muted/60 mt-1">Order missing ingredients to fill it up!</p>
            </div>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface/40">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-lg">🥗</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                  <p className="text-xs text-muted">{item.product.brand} · {item.product.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-saffron">₹{item.product.price}</p>
                  <p className="text-xs text-muted">×{item.quantity}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-card-border space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Delivery</span><span className="text-cardamom">₹{deliveryFee}</span></div>
              <div className="flex justify-between text-base font-bold pt-1.5 border-t border-card-border"><span>Total</span><span className="text-saffron">₹{total}</span></div>
            </div>
            <button onClick={handleCheckout} disabled={checkingOut} className="w-full btn-glow py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              {checkingOut ? <><div className="spinner w-4 h-4" />Processing...</> : <>Checkout with Instamart · ₹{total}</>}
            </button>
            <p className="text-xs text-center text-muted">⚡ Delivery in 15-25 minutes</p>
          </div>
        )}
      </div>
    </div>
  );
}
