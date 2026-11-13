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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand-slate border border-brand-lavender/30">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-slate">
                {isPoActive ? 'Pre-Order Aktif' : 'Pre-Order Ditutup'}
              </span>
            </div>
            <h4 className="mt-0.5 font-display text-base font-bold text-brand-navy sm:text-lg">
              {poPeriod.title}
            </h4>
            {poPeriod.announcement && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 font-normal">
                {poPeriod.announcement}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Jadwal: {dateFormatter.format(new Date(poPeriod.startsAt))} – {dateFormatter.format(new Date(poPeriod.endsAt))}
            </p>
          </div>
        </div>

        {/* Info Kuota & Estimasi */}
        <div className="flex items-center gap-4 text-xs sm:border-l sm:border-slate-100 sm:pl-6">
          <div>
            <span className="text-slate-400 block text-[11px]">Estimasi Pengerjaan</span>
            <span className="font-semibold text-brand-navy">
              {poPeriod.productionEstimateDays} hari kerja
            </span>
          </div>
          {poPeriod.quota > 0 && (
            <div>
              <span className="text-slate-400 block text-[11px]">Kuota Terisi</span>
              <span className="font-semibold text-brand-navy">
                {poPeriod.orderedCount} / {poPeriod.quota}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
