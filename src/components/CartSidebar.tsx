"use client";

import { CartItem } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (name: string) => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, items, onRemove, onCheckout }: Props) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 25 : 0;
  const total = subtotal + delivery;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:justify-end bg-on-surface/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full md:max-w-md bg-surface-container-lowest h-[85vh] md:h-full rounded-t-[32px] md:rounded-none shadow-ambient-3 slide-in-up md:slide-in-right flex flex-col relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="md:hidden w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mt-4 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-2 md:pt-6 md:px-6 border-b border-outline-variant/15">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <h3 className="font-[var(--font-display)] text-lg font-bold text-on-surface">Your Cart</h3>
            {items.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/15">{items.length} item{items.length > 1 ? "s" : ""}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4 animate-float">🛒</div>
              <p className="text-on-surface-variant text-sm">Your cart is empty</p>
              <p className="text-on-surface-variant/60 text-xs mt-1">Order missing ingredients from recipes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.name} className="flex items-center gap-4 p-3.5 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-lg">🥬</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.brand} · {item.unit}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary">₹{item.price}</p>
                    <p className="text-xs text-on-surface-variant">×{item.quantity}</p>
                  </div>
                  <button onClick={() => onRemove(item.name)} className="p-1.5 rounded-lg hover:bg-error/8 text-outline hover:text-error transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 bg-surface-container-lowest border-t border-outline-variant/15 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none pb-safe">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Delivery fee</span>
              <span>₹{delivery}</span>
            </div>
            <div className="w-full h-px bg-outline-variant/20"></div>
            <div className="flex justify-between text-base font-bold text-on-surface">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-ambient-1 hover:shadow-ambient-2 transition-shadow"
          >
            Checkout on Instamart
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
