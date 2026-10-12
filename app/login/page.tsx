'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Users, ChefHat, AlertCircle, ShieldCheck } from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';
import { StampBadge } from '@/components/ui/StampBadge';
import { ThaliOutlineIcon } from '@/components/ui/DhabaIcons';
import { playDhabaSound } from '@/components/ui/CraftedInteractions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next');
  const initialRole = (searchParams.get('role') as any) || 'student';

  const [role, setRole] = useState<'student' | 'staff' | 'kitchen' | 'admin'>(initialRole);
  const [rollNumber, setRollNumber] = useState('22CS014');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const executeLogin = async (targetRole: string, targetRoll: string, targetPin: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: targetRole,
          rollNumber: targetRoll,
          pin: targetPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      playDhabaSound('ding');

      const destination =
        nextUrl ||
        (targetRole === 'student'
          ? '/student'
          : targetRole === 'staff'
          ? '/staff'
          : '/kitchen');

      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(role, rollNumber, pin);
  };

  const handlePreset = (presetRole: 'student' | 'staff' | 'kitchen') => {
    playDhabaSound('press');
    setRole(presetRole);
    if (presetRole === 'student') {
      setRollNumber('22CS014');
      setPin('');
      executeLogin('student', '22CS014', '');
    } else if (presetRole === 'staff') {
      setPin('1234');
      executeLogin('staff', '', '1234');
    } else {
      setPin('5678');
      executeLogin('kitchen', '', '5678');
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 px-2 select-none">
      <div className="bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-2xl p-6 sm:p-8 shadow-brutal-xl space-y-6 relative">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#F28C1B] border-2 border-[#14110F] mx-auto flex items-center justify-center p-2.5 shadow-brutal-sm">
            <ThaliOutlineIcon className="w-full h-full" />
          </div>
          <h1 className="font-display text-3xl font-black text-[#14110F] uppercase tracking-wide">
            SIGN IN TO MESS HUB
          </h1>
          <p className="font-serif text-xs text-[#5C554F]">
            Select role or choose a 1-click evaluation profile.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-3 gap-2 bg-[#E8DFC7] p-1.5 rounded-xl border-2 border-[#14110F]">
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setError('');
              playDhabaSound('press');
            }}
            className={`py-2 text-xs font-mono font-black uppercase rounded-lg border-2 transition flex items-center justify-center gap-1 ${
              role === 'student'
                ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs'
                : 'bg-transparent border-transparent text-[#5C554F] hover:text-[#14110F]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('staff');
              setPin('1234');
              setError('');
              playDhabaSound('press');
            }}
            className={`py-2 text-xs font-mono font-black uppercase rounded-lg border-2 transition flex items-center justify-center gap-1 ${
              role === 'staff'
                ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs'
                : 'bg-transparent border-transparent text-[#5C554F] hover:text-[#14110F]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('kitchen');
              setPin('5678');
              setError('');
              playDhabaSound('press');
            }}
            className={`py-2 text-xs font-mono font-black uppercase rounded-lg border-2 transition flex items-center justify-center gap-1 ${
              role === 'kitchen'
                ? 'bg-[#14110F] text-[#FAF5E8] border-[#14110F] shadow-brutal-xs'
                : 'bg-transparent border-transparent text-[#5C554F] hover:text-[#14110F]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#D7312B]/15 border-2 border-[#D7312B] text-[#D7312B] text-xs font-mono font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'student' ? (
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#14110F] mb-1.5">
                STUDENT ROLL NUMBER
              </label>
              <input
                id="input-roll-number"
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 22CS014"
                className="w-full bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-xl px-4 py-3 text-[#14110F] font-mono text-xl font-black tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
              />
              <p className="font-serif text-[10px] text-[#5C554F] mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B3A]" />
                <span>Privacy preserved: only student roll number is stored.</span>
              </p>
            </div>
          ) : (
            <div>
              <label className="block font-mono text-xs font-black uppercase text-[#14110F] mb-1.5">
                {role === 'staff' ? 'STAFF PIN' : 'KITCHEN PIN'}
              </label>
              <input
                id="input-pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={role === 'staff' ? 'Enter 1234' : 'Enter 5678'}
                className="w-full bg-[#FAF5E8] border-[3px] border-[#14110F] rounded-xl px-4 py-3 text-[#14110F] font-mono text-2xl font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#F28C1B]"
              />
              <p className="font-mono text-[10px] text-[#5C554F] mt-1 text-center font-bold">
                EVALUATION PIN: <strong className="text-[#14110F]">{role === 'staff' ? '1234' : '5678'}</strong>
              </p>
            </div>
          )}

          <TactileButton
            id="btn-sign-in"
            type="submit"
            variant="saffron"
            size="lg"
            disabled={loading}
            className="w-full text-base py-3.5"
          >
            SIGN IN TO {role.toUpperCase()}
          </TactileButton>
        </form>

        {/* 1-Click Evaluation Presets */}
        <div className="pt-4 border-t-2 border-[#14110F]/15 text-center">
          <div className="font-mono text-[10px] font-black uppercase text-[#5C554F] mb-2.5">
            1-CLICK EVALUATION PROFILES:
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handlePreset('student')}
              className="px-3 py-1.5 bg-[#FAF5E8] text-[#14110F] text-xs font-mono font-bold rounded-lg border-2 border-[#14110F] hover:bg-[#F28C1B] transition shadow-brutal-xs"
            >
              Demo Student (22CS014)
            </button>
            <button
              type="button"
              onClick={() => handlePreset('staff')}
              className="px-3 py-1.5 bg-[#FAF5E8] text-[#14110F] text-xs font-mono font-bold rounded-lg border-2 border-[#14110F] hover:bg-[#F28C1B] transition shadow-brutal-xs"
            >
              Demo Staff (1234)
            </button>
            <button
              type="button"
              onClick={() => handlePreset('kitchen')}
              className="px-3 py-1.5 bg-[#FAF5E8] text-[#14110F] text-xs font-mono font-bold rounded-lg border-2 border-[#14110F] hover:bg-[#F28C1B] transition shadow-brutal-xs"
            >
              Demo Kitchen (5678)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-[#5C554F] text-xs font-mono">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
