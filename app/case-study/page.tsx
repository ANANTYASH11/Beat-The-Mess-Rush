'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Github,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { StampBadge } from '@/components/ui/StampBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { ThaliOutlineIcon, LadleIcon, SteelGlassIcon, TiffinIcon } from '@/components/ui/DhabaIcons';
import { university } from '@/config/university';

export default function CaseStudyPage() {
  const techBadges = [
    { name: 'React 18', role: 'UI Components & Custom Hooks', color: 'bg-[#FAF5E8]' },
    { name: 'Next.js 14 (App Router)', role: 'SSR, Server Handlers & Middleware', color: 'bg-[#F28C1B] text-[#14110F]' },
    { name: 'TypeScript', role: 'Strict End-to-End Type Safety', color: 'bg-[#FAF5E8]' },
    { name: 'Prisma ORM', role: 'SQLite Local + Postgres Deploy Ready', color: 'bg-[#FAF5E8]' },
    { name: 'Tailwind CSS', role: 'Neo-Brutalist Dhaba Design System', color: 'bg-[#FAF5E8]' },
    { name: 'Framer Motion & GSAP', role: 'Physical Spring Physics & Scroll Story', color: 'bg-[#2F6B3A] text-[#FAF5E8]' },
    { name: 'SWR', role: 'Real-time Polling & Local Fallbacks', color: 'bg-[#FAF5E8]' },
    { name: 'Canvas Confetti', role: 'Rice Grains & Chilli Flakes FX', color: 'bg-[#FAF5E8]' },
  ];

  const keyDecisions = [
    {
      title: '1. Useful at 30-50% Adoption (No Penalties)',
      subtitle: 'Designing for Human Reality over Authoritarian Compliance',
      desc: `Most food-app MVPs fail in university messes because they mandate 100% adoption and punish walk-ins. In UniQ, walk-in students are always admitted without penalty. Shifting just 35% of students off the ${university.peakWindows.lunch} bottleneck flattens the line peak for everyone, creating natural social proof.`,
      badge: 'ADOPTION MODEL',
    },
    {
      title: '2. Soft Capacity Windows over Hard Cutoffs',
      subtitle: 'Zero Turnaways at the Door',
      desc: `Arrival slots are ${university.slotLengthMinutes}-minute guidance buckets, not rigid train boarding gates. If 80 students book a slot with nominal capacity of 60, the system displays higher wait estimates rather than turning hungry students away. This builds user trust and avoids counter arguments.`,
      badge: 'QUEUE DYNAMICS',
    },
    {
      title: '3. Honest Wait Ranges over Fake Exact Minutes',
      subtitle: 'Psychological Trust Engineering',
      desc: 'Saying "Wait is 7 minutes" creates frustration when it takes 8 minutes. Saying "6-11 min" sets accurate expectations based on service rate variance. In user testing, honesty reduced line anxiety significantly.',
      badge: 'UX RESEARCH',
    },
    {
      title: '4. 100% Hardware-Free & Zero Biometrics',
      subtitle: 'Deployable Tomorrow on Existing Phones and 1 Tablet',
      desc: `No face-recognition turnstiles, no RFID readers, no thermal cameras that fail under Indian mess humidity. Staff at ${university.messes[0].name} use a 1-tap tablet with huge touch targets. Check-in uses an optional 4-digit numeric code spoken aloud, requiring zero camera scanning.`,
      badge: 'OPERATIONAL PRAGMATISM',
    },
  ];

  return (
    <div className="w-full space-y-10 pb-20 max-w-5xl mx-auto" id="case-study-page">
      {/* 1. HERO MASTHEAD */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-10 shadow-brutal-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#14110F]/15">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase tracking-widest bg-[#14110F] text-[#FAF5E8] px-3 py-1 rounded">
              STUDENT CASE STUDY • {university.shortName}
            </span>
            <span className="font-serif italic text-xs text-[#5C554F]">
              उत्पाद एवं तकनीकी विश्लेषण
            </span>
          </div>

          <StampBadge text="FULL-STACK MVP" color="curry" />
        </div>

        <div className="mt-6 space-y-3">
          <h1 className="font-display text-4xl sm:text-6xl font-black text-[#14110F] uppercase tracking-wide leading-tight">
            UniQ: MESS KI LINE AB ONLINE!
          </h1>
          <p className="font-accent italic text-xl text-[#F28C1B] font-bold">
            How Product Architecture Cuts Hostel Queues &amp; Food Waste
          </p>
          <p className="font-serif text-lg text-[#5C554F] leading-relaxed max-w-3xl">
            A real-world engineering case study addressing two linked campus crises at {university.messes[0].name}: 20-minute peak meal queues and food waste across {university.messes[0].students} hostel residents.
          </p>
        </div>

        {/* Live Demo & Repo Links */}
        <div className="mt-8 pt-6 border-t-2 border-[#14110F]/15 flex flex-wrap items-center gap-4">
          <Link href="/student">
            <TactileButton variant="saffron" size="md">
              <span className="flex items-center gap-1.5">
                <span>TEST LIVE DEMO</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </TactileButton>
          </Link>
          <a
            href={university.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="dhaba-btn px-4 py-2.5 min-h-[48px] bg-[#FAF5E8] text-[#14110F] hover:bg-[#EAE1CA] text-[14px] font-mono font-bold flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            <span>VIEW SOURCE ON GITHUB</span>
            <ExternalLink className="w-3 h-3 text-[#5C554F]" />
          </a>
        </div>
      </div>

      {/* WHY UNIQ? Callout Card */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-7 shadow-brutal-md space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[14px] font-black uppercase tracking-widest bg-saffron text-ink px-3 py-1 rounded">
            BRAND IDENTITY
          </span>
          <h3 className="font-display text-2xl font-black uppercase text-[#14110F]">
            WHY UNIQ?
          </h3>
        </div>
        <p className="font-serif text-sm text-[#14110F] leading-relaxed">
          <strong>UniQ = University + Queue.</strong> The name blends higher education campus life with the daily reality of the hostel mess line. Visually, the letter <strong>“Q”</strong> is drawn as a traditional matte black mess thali with a thin brass rim, a central saffron dot, and a queue tail line extending toward express service.
        </p>
      </div>

      {/* 2. THE PROBLEM STATEMENT & CONTEXT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-3">
          <div className="font-mono text-xs font-black text-[#D7312B] uppercase tracking-wider">
            THE CAMPUS PAIN POINT
          </div>
          <h2 className="font-display text-3xl font-black uppercase text-[#14110F]">
            The {university.peakWindows.lunch} Bottleneck &amp; Cooking Surpluses
          </h2>
          <p className="font-serif text-sm text-[#5C554F] leading-relaxed">
            In collegiate hostel dining halls like {university.messes[0].name}, class schedules release hundreds of students simultaneously around {university.peakWindows.lunch}. Lines snake out the door, generating 18-24 minute wait times during the lunch rush.
          </p>
          <p className="font-serif text-sm text-[#5C554F] leading-relaxed">
            Meanwhile, mess staff cook based on static headcount estimates. Fluctuation in attendance leads to plate waste and leftover vats. At ₹{university.costPerKgFood}/kg bulk cost, right-sizing portions saves significant resources.
          </p>
        </div>

        <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-3">
          <div className="font-mono text-xs font-black text-[#2F6B3A] uppercase tracking-wider">
            THE REAL-WORLD CONSTRAINTS
          </div>
          <h2 className="font-display text-3xl font-black uppercase text-[#14110F]">
            Hostel Operational Reality
          </h2>
          <ul className="space-y-2 text-xs font-serif text-[#14110F] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold font-mono text-[#D7312B]">01.</span>
              <span><strong>Patchy Campus Wi-Fi:</strong> Mobile app must load under 300 KB and cache offline token requests safely in IndexedDB.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold font-mono text-[#D7312B]">02.</span>
              <span><strong>Mess Humidity &amp; Spills:</strong> Staff interface uses high-contrast giant buttons designed for grease-resistant tablet operation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold font-mono text-[#D7312B]">03.</span>
              <span><strong>Zero Punitive Turnaways:</strong> Walk-ins are always fed; early bookings simply receive priority lane access.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. PRIVACY BY DESIGN & ARCHITECTURE */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#2F6B3A]" />
          <h2 className="font-display text-3xl font-black uppercase text-[#14110F]">
            PRIVACY BY DESIGN &amp; STUDENT DATA HONESTY
          </h2>
        </div>

        <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl text-xs font-serif leading-relaxed text-[#14110F] space-y-2">
          <p>
            <strong>Plain-Language Privacy Policy:</strong> UniQ is engineered to protect student privacy. We store only anonymized campus roll numbers matching the format <code>{university.rollNumberFormat}</code> (e.g. <code>{university.rollNumberExample}</code>). We do <strong>not</strong> collect names, phone numbers, email addresses, biometric scans, or GPS location.
          </p>
          <p>
            Staff and kitchen consoles see aggregated counts only (e.g., &ldquo;42 regular veg portions expected at 12:45&rdquo;). Individual student check-in verification codes are strictly ephemeral.
          </p>
          <p className="font-mono text-[11px] text-[#5C554F]">
            * Data Disclosure: Historical charts in the initial build are tagged as [SIMULATED DATA]. As pilot measurements are collected, they are explicitly marked as [MEASURED BASELINE] or [MEASURED PILOT].
          </p>
        </div>
      </div>

      {/* 4. KEY ARCHITECTURAL & PRODUCT DECISIONS */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-xs font-black bg-[#2F6B3A] text-[#FAF5E8] px-2 py-0.5 rounded">
            TRADE-OFF RATIONALE
          </span>
          <h2 className="font-display text-3xl font-black uppercase text-[#14110F] mt-1">
            KEY PRODUCT DECISIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {keyDecisions.map((dec) => (
            <div
              key={dec.title}
              className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 shadow-brutal-md space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-[#14110F]/15">
                  <span className="font-mono text-[9px] font-black uppercase text-[#F28C1B] bg-[#14110F] px-2 py-0.5 rounded">
                    {dec.badge}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold uppercase text-[#14110F] mt-2">
                  {dec.title}
                </h3>
                <div className="font-mono text-xs font-bold text-[#2F6B3A] mb-1">
                  {dec.subtitle}
                </div>
                <p className="font-serif text-xs text-[#5C554F] leading-relaxed">
                  {dec.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TECH STACK BADGES */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-4">
        <div>
          <span className="font-mono text-xs font-black bg-[#F28C1B] text-[#14110F] px-2 py-0.5 rounded border border-[#14110F]">
            PRODUCTION STACK
          </span>
          <h2 className="font-display text-3xl font-black uppercase text-[#14110F] mt-1">
            TECHNOLOGY &amp; TOOLING
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {techBadges.map((badge) => (
            <div
              key={badge.name}
              className={`p-3.5 border-2 border-[#14110F] rounded-xl shadow-brutal-xs flex flex-col justify-between ${badge.color}`}
            >
              <div className="font-display text-lg font-bold uppercase">{badge.name}</div>
              <div className="font-mono text-[10px] text-[#5C554F] mt-1 font-semibold">
                {badge.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AUTHOR & PROJECT CONTEXT */}
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-lg space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#F28C1B]" />
          <h2 className="font-display text-3xl font-black uppercase text-[#14110F]">
            AUTHOR CONTEXT &amp; DISCLAIMER
          </h2>
        </div>

        {/* EDIT ME: personal intro */}
        <div className="p-4 bg-[#F4ECD8] border-2 border-[#14110F] rounded-xl space-y-2 text-xs font-serif text-[#14110F]">
          <p>
            <strong>Project Creator:</strong> {university.yourName} ({university.yourCourse}).
          </p>
          <p className="font-mono text-xs text-saffron font-bold">
            Project name: UniQ = University + Queue
          </p>
          <p>
            I designed &ldquo;UniQ&rdquo; while standing in daily rush-hour lunch lines at {university.messes[0].name} ({university.city}). The goal was to solve two persistent hostel problems using software ergonomics instead of authoritarian rules or heavy surveillance hardware.
          </p>
          <p className="font-mono text-[11px] text-[#D7312B] font-bold">
            Built as a student project for LPU. Not an official LPU service. UniQ makes no claim that LPU has approved or adopted this application.
          </p>
        </div>

        {/* Future Scope */}
        <div className="p-4 bg-[#FAF5E8] border-2 border-dashed border-[#14110F] rounded-xl space-y-2 text-xs font-serif text-[#14110F]">
          <h3 className="font-mono text-xs font-black uppercase text-[#14110F]">
            FUTURE SCOPE &amp; ROADMAP
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-[#5C554F]">
            <li>
              <strong>A La Carte Ordering:</strong> Skipped for the initial multi-tenant rollout to keep food production baselines predictable. Meal plans (Standard 4-meal vs Basic 3-meal) govern pre-bookings; individual canteen extras and on-demand live counters will be introduced in Phase 2.
            </li>
            <li>
              <strong>Physical Line Sensor Calibration:</strong> Overhead ultrasonic beam sensors for automated headcount drift correction.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
