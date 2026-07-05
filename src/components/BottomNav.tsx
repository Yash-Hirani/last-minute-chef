"use client";

interface BottomNavProps {
  savedCount: number;
  cartCount: number;
  onSavedClick: () => void;
  onCartClick: () => void;
  onHomeClick: () => void;
}

export default function BottomNav({ savedCount, cartCount, onSavedClick, onCartClick, onHomeClick }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/20 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <button onClick={onHomeClick} className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button onClick={onSavedClick} className="relative flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-[10px] font-medium">Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-1 right-[25%] w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] flex items-center justify-center font-bold shadow-sm">{savedCount}</span>
          )}
        </button>

        <button onClick={onCartClick} className="relative flex flex-col items-center justify-center w-full h-full text-on-surface-variant hover:text-primary transition-colors">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span className="text-[10px] font-medium">Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-[25%] w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] flex items-center justify-center font-bold shadow-sm">{cartCount}</span>
          )}
        </button>
      </div>
    </nav>
  );
}
