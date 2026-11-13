'use client';

import React, { useEffect, useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { Clock } from 'lucide-react';

export function POStatusBanner() {
  const { poPeriod } = useCompanyStore();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, isEnded: false });
  const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(poPeriod.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes, isEnded: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60_000);
    return () => clearInterval(interval);
  }, [poPeriod.endsAt]);

  const isPoActive = !timeLeft.isEnded && (poPeriod.status === 'open' || poPeriod.status === 'closing_soon');

  return (
    <div className="w-full rounded-[1.75rem] border border-brand-lavender/30 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-surface text-brand-slate border border-brand-lavender/30">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                isPoActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isPoActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isPoActive ? 'Pre-Order Dibuka' : 'Pre-Order Ditutup'}
              </span>
            </div>
            <h4 className="mt-1 font-display text-base font-bold text-brand-navy sm:text-lg">
              {poPeriod.title}
            </h4>
            {poPeriod.announcement && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                {poPeriod.announcement}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">
              Jadwal: {dateFormatter.format(new Date(poPeriod.startsAt))} – {dateFormatter.format(new Date(poPeriod.endsAt))}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
          {timeLeft.isEnded ? (
            <span className="text-xs font-semibold text-slate-500">Periode pemesanan berakhir</span>
          ) : (
            <div className="flex items-center gap-2.5 text-center">
              <div className="rounded-xl bg-brand-surface/70 px-2.5 py-1.5 border border-brand-lavender/25">
                <span className="block font-display text-base font-bold text-brand-navy sm:text-lg leading-tight">{timeLeft.days}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">hari</span>
              </div>
              <span className="text-slate-300 font-bold">:</span>
              <div className="rounded-xl bg-brand-surface/70 px-2.5 py-1.5 border border-brand-lavender/25">
                <span className="block font-display text-base font-bold text-brand-navy sm:text-lg leading-tight">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">jam</span>
              </div>
              <span className="text-slate-300 font-bold">:</span>
              <div className="rounded-xl bg-brand-surface/70 px-2.5 py-1.5 border border-brand-lavender/25">
                <span className="block font-display text-base font-bold text-brand-navy sm:text-lg leading-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">mnt</span>
              </div>
            </div>
          )}
          <div className="text-right text-xs text-slate-500">
            {poPeriod.quota > 0 && (
              <span className="block font-semibold text-brand-navy">
                {poPeriod.orderedCount}/{poPeriod.quota} pesanan
              </span>
            )}
            <span className="text-[11px] text-slate-400">Estimasi {poPeriod.productionEstimateDays} hari kerja</span>
          </div>
        </div>
      </div>
    </div>
  );
}
