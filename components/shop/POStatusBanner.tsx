'use client';

import React, { useEffect, useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export function POStatusBanner() {
  const { poPeriod } = useCompanyStore();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(poPeriod.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [poPeriod.endsAt]);

  const percentage =
    poPeriod.quota > 0
      ? Math.min(100, Math.round((poPeriod.orderedCount / poPeriod.quota) * 100))
      : 0;

  return (
    <div className="w-full rounded-2xl border border-brand-lavender/40 bg-gradient-to-r from-brand-surface via-white to-brand-cream p-5 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Info & Status */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-slate text-white shadow-sm shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                PO ACTIVE: BATCH 01
              </span>
              <span className="text-xs text-slate-500">
                Tutup: 24 November 2026
              </span>
            </div>
            <h4 className="font-serif text-lg font-bold text-brand-navy mt-0.5">
              {poPeriod.title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {poPeriod.announcement}
            </p>
          </div>
        </div>

        {/* Live Countdown Timer & Quota */}
        <div className="flex items-center gap-5 shrink-0">
          {/* Countdown Clock */}
          <div className="flex items-center gap-2 text-center">
            <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs min-w-[48px]">
              <span className="font-serif text-base font-bold text-brand-navy block leading-none">
                {timeLeft.days}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">Hari</span>
            </div>
            <span className="font-bold text-slate-300">:</span>
            <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs min-w-[48px]">
              <span className="font-serif text-base font-bold text-brand-navy block leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">Jam</span>
            </div>
            <span className="font-bold text-slate-300">:</span>
            <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs min-w-[48px]">
              <span className="font-serif text-base font-bold text-brand-navy block leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">Mnt</span>
            </div>
            <span className="font-bold text-slate-300">:</span>
            <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs min-w-[48px]">
              <span className="font-serif text-base font-bold text-brand-slate block leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">Dtk</span>
            </div>
          </div>

          {/* Quota Progress */}
          <div className="hidden sm:flex flex-col w-32 text-right">
            <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
              <span>Kuota PO:</span>
              <span className="text-brand-slate">{poPeriod.orderedCount}/{poPeriod.quota}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <div
                className="h-full rounded-full bg-brand-slate transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">
              Estimasi: {poPeriod.productionEstimateDays} hari kerja
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
