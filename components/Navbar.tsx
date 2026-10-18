'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Sun, Moon, Zap, ChevronDown, Check, Menu, X } from 'lucide-react';
import { university } from '@/config/university';
import { UniQLogo } from '@/components/brand/UniQLogo';
import { MessSelector } from '@/components/ui/MessSelector';
import { useSelectedMess } from '@/hooks/useSelectedMess';

const navLinks = [
  { href: '/student', label: 'Student' },
  { href: '/staff', label: 'Staff deck' },
  { href: '/kitchen', label: 'Kitchen' },
  { href: '/impact', label: 'Impact' },
  { href: '/display', label: 'Display' },
  { href: '/case-study', label: 'Case study' },
];

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isKiosk = pathname?.includes('/display') || searchParams?.get('kiosk') === '1';

  const { messId, isChanging } = useSelectedMess();
  const [isDark, setIsDark] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme default is strictly LIGHT. Dark mode only via explicit user choice in localStorage.
  useEffect(() => {
    const html = document.documentElement;
    const urlTheme = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('theme') : null;
    const stored = urlTheme || (typeof window !== 'undefined' ? localStorage.getItem('theme') : null);

    if (stored === 'dark') {
      html.classList.remove('light');
      html.classList.add('dark');
      setIsDark(true);
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleSimulate = async () => {
    try {
      setSimRunning(true);
      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messCode: messId }),
      });
      setTimeout(() => setSimRunning(false), 30000);
    } catch {
      setSimRunning(false);
    }
  };

  if (isKiosk) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b-2 border-ink bg-bg transition-colors relative">
      <div className="max-w-[1280px] mx-auto px-2 sm:px-6 h-full flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Wordmark (UniQ in Bebas Neue at 32px, one line, nowrap) */}
        <Link
          href="/"
          className="hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0 flex items-center min-h-[48px]"
          aria-label="UniQ Home"
        >
          <UniQLogo size={32} />
        </Link>

        {/* Center: Nav links (Centered, IBM Plex Mono 14px, uppercase, 0.06em, 24px gap, saffron underline, hidden below 1100px) */}
        <nav className="hidden min-[1100px]:flex items-center gap-6 font-mono text-[14px] uppercase tracking-[0.06em] whitespace-nowrap">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-1 border-b-2 transition-all ${
                  isActive
                    ? 'border-saffron text-ink font-bold'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-saffron'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: all single-line, vertically centered, >= 48px height touch targets */}
        <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
          {/* Below 1100px: Menu button to collapse links so nothing wraps */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex min-[1100px]:hidden min-h-[48px] min-w-[48px] items-center justify-center bg-bg-raised border-2 border-ink shadow-offset-sm text-ink active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex-shrink-0"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Searchable, Grouped Mess Selector (19 Messes, nowrap, min 48px height, bottom sheet on mobile) */}
          <MessSelector />

          {/* Rush Sim Button (Hidden on <640px to prevent 320px overflow; available in mobile drawer) */}
          <button
            onClick={handleSimulate}
            disabled={simRunning}
            title="Inject simulated arrivals & service for 30s"
            className={`hidden sm:flex min-h-[48px] px-3.5 items-center gap-1.5 text-[14px] font-mono font-bold uppercase border-2 border-ink shadow-offset-sm whitespace-nowrap active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex-shrink-0 ${
              simRunning
                ? 'bg-[#B3261E] text-white animate-pulse'
                : 'bg-[#D7312B] text-white hover:bg-[#B3261E]'
            }`}
          >
            <Zap size={16} className={simRunning ? 'animate-bounce' : ''} />
            <span className="whitespace-nowrap">
              {simRunning ? 'Simulating…' : 'Rush sim'}
            </span>
          </button>

          {/* 48px Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Night Mess Theme"
            title="Toggle Night Mess Theme"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center border-2 border-ink bg-bg-raised shadow-offset-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-ink flex-shrink-0"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Sign In as plain text (Hidden on <640px; accessible in mobile menu) */}
          <Link
            href="/login"
            className="hidden sm:flex min-h-[48px] px-2 items-center font-mono text-[14px] uppercase tracking-wider text-ink-muted hover:text-ink whitespace-nowrap transition-colors flex-shrink-0"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Dropdown Menu below 1100px */}
      {mobileMenuOpen && (
        <div className="min-[1100px]:hidden absolute top-[72px] left-0 w-full bg-bg border-b-2 border-ink shadow-offset-md z-50 py-3 px-6 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-2 font-mono text-[14px] uppercase tracking-[0.06em]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`min-h-[48px] flex items-center border-b border-ink/10 transition-colors ${
                    isActive ? 'text-saffron font-bold' : 'text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Actions in Drawer */}
            <div className="pt-2 sm:hidden flex flex-col gap-2">
              <button
                onClick={() => {
                  handleSimulate();
                  setMobileMenuOpen(false);
                }}
                disabled={simRunning}
                className="w-full min-h-[48px] px-3.5 flex items-center justify-center gap-2 text-[14px] font-mono font-bold uppercase border-2 border-ink bg-[#D7312B] text-white"
              >
                <Zap size={16} />
                <span>{simRunning ? 'Simulating…' : 'Rush sim (30s)'}</span>
              </button>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[48px] flex items-center justify-center border-2 border-ink bg-bg-raised font-mono text-[14px] uppercase font-bold text-ink"
              >
                Sign in
              </Link>
            </div>

            <div className="pt-2 border-t border-ink/20 flex items-center justify-between text-[14px] font-mono">
              <span className="text-ink-muted font-bold">LPU TENANT</span>
              <span className="font-bold text-ink flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-curry-leaf" />
                19 Messes Active
              </span>
            </div>
          </nav>
        </div>
      )}

      {/* Thin animated switching progress line under nav when changing mess */}
      {isChanging && (
        <div
          id="nav-mess-switching-progress"
          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-saffron via-[#D7312B] to-saffron animate-pulse z-50"
          role="progressbar"
          aria-label="Updating mess data"
        />
      )}

      {/* 3px saffron scroll-progress line on bottom edge */}
      <div
        className="absolute bottom-0 left-0 h-[3px] bg-saffron transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </header>
  );
}
