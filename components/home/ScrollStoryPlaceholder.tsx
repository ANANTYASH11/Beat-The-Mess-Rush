'use client';

import React from 'react';
import { Compass, ChevronDown } from 'lucide-react';

export function ScrollStoryPlaceholder() {
  return (
    <section
      id="story"
      className="min-h-[100vh] scroll-mt-[72px] flex flex-col justify-center items-center py-24 px-6 max-w-[1280px] mx-auto text-center border-t-2 border-ink/20"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Section Eyebrow */}
        <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-saffron px-3 py-1 bg-bg-raised border border-ink/40 shadow-offset-sm">
          <Compass size={14} className="text-saffron" />
          <span>Chapter 1 / One lunch, one student</span>
        </div>

        {/* Title */}
        <h2 className="font-condensed text-5xl sm:text-6xl lg:text-7xl uppercase text-ink tracking-tight leading-none">
          THE INTERACTIVE SCROLL STORY
        </h2>

        {/* Description */}
        <p className="font-accent italic text-lg sm:text-xl text-ink-muted leading-relaxed">
          Follow a student from the hostel hallway into the lunch rush, through the counter queue,
          and watch how portion data arrives at the cook’s chalkboard before the first ladle is served.
        </p>

        {/* Blueprint preview card */}
        <div className="p-8 bg-bg-raised border-2 border-dashed border-ink/40 max-w-lg mx-auto text-center space-y-3">
          <div className="font-mono text-xs font-bold uppercase text-ink tracking-wider">
            [ 3D Story Canvas Anchor · Built in Next Step ]
          </div>
          <p className="font-mono text-xs text-ink-faint">
            Camera pans through dorm room → campus walkway → dining hall counter → kitchen prep deck
          </p>
        </div>

        {/* Scroll indicator pointing to the Feedback Loop */}
        <div className="pt-4 flex flex-col items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted">
            Scroll to inspect the loop diagram
          </span>
          <ChevronDown size={18} className="text-saffron animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default ScrollStoryPlaceholder;
