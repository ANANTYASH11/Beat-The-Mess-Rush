'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Zap, ChevronDown, Check, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/student', label: 'Student' },
  { href: '/staff', label: 'Staff deck' },
  { href: '/kitchen', label: 'Kitchen' },
  { href: '/impact', label: 'Impact' },
  { href: '/case-study', label: 'Case study' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [selectedMess, setSelectedMess] = useState('North Hostel Mess');
  const [messDropdownOpen, setMessDropdownOpen] = useState(false);
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
        body: JSON.stringify({ messCode: 'mess-1' }),
      });
      setTimeout(() => setSimRunning(false), 30000);
    } catch {
      setSimRunning(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b-2 border-ink bg-bg/95 backdrop-blur-md transition-colors relative">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 h-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Wordmark (Bebas Neue at 32px, one line, white-space: nowrap, no bigger) */}
        <Link
          href="/"
          className="font-condensed text-[26px] sm:text-[32px] tracking-wide text-ink hover:text-saffron transition-colors uppercase whitespace-nowrap flex-shrink-0 leading-none"
        >
          BEAT THE MESS RUSH
        </Link>

        {/* Center: Nav links (Centered, IBM Plex Mono 13px, uppercase, 0.06em, 24px gap, saffron underline, hidden below 1100px) */}
        <nav className="hidden min-[1100px]:flex items-center gap-6 font-mono text-[13px] uppercase tracking-[0.06em] whitespace-nowrap">
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

        {/* Right side: all single-line, vertically centered, same 40px height */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Below 1100px: Menu button to collapse links so nothing wraps */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex min-[1100px]:hidden h-10 w-10 items-center justify-center bg-bg-raised border-2 border-ink shadow-offset-sm text-ink active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex-shrink-0"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Compact Mess Selector ("North Hostel Mess", nowrap, 2px ink border, 40px height) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setMessDropdownOpen(!messDropdownOpen)}
              className="h-10 px-3 flex items-center gap-1.5 text-xs font-mono font-bold bg-bg-raised border-2 border-ink shadow-offset-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none whitespace-nowrap transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-curry-leaf flex-shrink-0" />
              <span className="whitespace-nowrap">{selectedMess}</span>
              <ChevronDown size={14} className="flex-shrink-0" />
            </button>
            {messDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-bg-raised border-2 border-ink shadow-offset-md py-1 z-50 text-xs font-mono">
                {['North Hostel Mess', 'Satellite Mess B'].map((mess) => (
                  <button
                    key={mess}
                    onClick={() => {
                      setSelectedMess(mess);
                      setMessDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-saffron hover:text-white flex items-center justify-between"
                  >
                    <span>{mess}</span>
                    {selectedMess === mess && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rush Sim Button (red #D7312B, hard shadow, 40px height, single-line) */}
          <button
            onClick={handleSimulate}
            disabled={simRunning}
            title="Inject simulated arrivals & service for 30s"
            className={`h-10 px-2.5 sm:px-3.5 flex items-center gap-1.5 text-xs font-mono font-bold uppercase border-2 border-ink shadow-offset-sm whitespace-nowrap active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex-shrink-0 ${
              simRunning
                ? 'bg-[#B3261E] text-white animate-pulse'
                : 'bg-[#D7312B] text-white hover:bg-[#B3261E]'
            }`}
          >
            <Zap size={14} className={simRunning ? 'animate-bounce' : ''} />
            <span className="hidden min-[480px]:inline whitespace-nowrap">
              {simRunning ? 'Simulating…' : 'Rush sim'}
            </span>
          </button>

          {/* 40px Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Night Mess Theme"
            title="Toggle Night Mess Theme"
            className="w-10 h-10 flex items-center justify-center border-2 border-ink bg-bg-raised shadow-offset-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-ink flex-shrink-0"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Sign In as plain text (height 40px, centered) */}
          <Link
            href="/login"
            className="h-10 px-1 sm:px-2 flex items-center font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink whitespace-nowrap transition-colors flex-shrink-0"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Dropdown Menu below 1100px */}
      {mobileMenuOpen && (
        <div className="min-[1100px]:hidden absolute top-[72px] left-0 w-full bg-bg border-b-2 border-ink shadow-offset-md z-50 py-3 px-6 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-3 font-mono text-[13px] uppercase tracking-[0.06em]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-1.5 border-b border-ink/10 transition-colors ${
                    isActive ? 'text-saffron font-bold' : 'text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-ink/20 flex items-center justify-between md:hidden text-xs font-mono">
              <span className="font-bold text-ink">{selectedMess}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-curry-leaf" />
            </div>
          </nav>
        </div>
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
