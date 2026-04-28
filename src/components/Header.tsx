"use client";

import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  savedCount: number;
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ savedCount, cartCount, onCartClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-lg shadow-lg shadow-primary/15 group-hover:shadow-primary/25 transition-shadow">
              🍳
            </div>
            <div>
              <h1 className="text-lg font-bold font-[var(--font-display)] text-on-surface tracking-tight">
                Last-Minute Chef
              </h1>
              <p className="text-[10px] text-on-surface-variant -mt-0.5 hidden sm:block">
                Cook what you have. Order what you don&apos;t.
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            <button className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" title="Saved recipes">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">{savedCount}</span>
              )}
            </button>

            <button onClick={onCartClick} className="relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-surface-container-high hover:bg-surface-dim transition-all text-on-surface" title="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          <button className="md:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-outline-variant/15">
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-sm text-on-surface-variant hover:bg-surface-container transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Saved {savedCount > 0 && `(${savedCount})`}
              </button>
              <button onClick={() => { onCartClick(); setMobileMenuOpen(false); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-sm font-medium bg-surface-container-high hover:bg-surface-dim transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
