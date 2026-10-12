import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-8 max-w-sm w-full shadow-brutal-lg">
        <h2 className="text-5xl font-black text-[#D7312B] font-display mb-1">404</h2>
        <h3 className="text-xl font-display font-bold uppercase text-[#14110F] mb-1">
          WRONG CANTEEN COUNTER
        </h3>
        <p className="font-serif text-xs text-[#5C554F] mb-6">
          The requested mess counter or ticket gate does not exist.
        </p>
        <Link
          href="/"
          className="dhaba-btn py-2.5 px-5 bg-[#F28C1B] text-[#14110F] font-display text-sm uppercase inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>BACK TO THALI HERO</span>
        </Link>
      </div>
    </div>
  );
}
