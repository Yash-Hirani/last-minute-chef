"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";

interface HeaderProps {
  savedCount: number;
  cartCount: number;
  onCartClick: () => void;
  onSavedClick: () => void;
  onSignInClick: () => void;
}

export default function Header({ savedCount, cartCount, onCartClick, onSavedClick, onSignInClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

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
            <button onClick={onSavedClick} className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" title="Saved recipes">
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

            <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>

            {loading ? (
               <div className="w-20 h-8 animate-pulse bg-surface-container rounded-full"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-on-surface-variant truncate max-w-[160px]">{user.email}</span>
                 <button onClick={signOut} className="text-xs font-semibold text-error hover:text-error/80 px-3 py-1.5 rounded-full hover:bg-error/10 transition-colors">Sign Out</button>
              </div>
            ) : (
              <button onClick={onSignInClick} className="text-sm font-semibold text-primary hover:text-primary-dark px-4 py-2 rounded-full hover:bg-primary/5 transition-colors">
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Auth toggle (others are in BottomNav) */}
          <div className="md:hidden flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-surface-container rounded-full"></div>
            ) : user ? (
              <>
                <span className="text-xs font-medium text-on-surface-variant truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                <button onClick={signOut} className="text-xs font-semibold text-error hover:text-error/80 px-2 py-1.5 rounded-full hover:bg-error/10 transition-colors">Sign Out</button>
              </>
            ) : (
              <button onClick={onSignInClick} className="p-2 rounded-xl text-primary hover:bg-primary/5 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
