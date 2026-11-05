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

  return (
    <div className="w-full rounded-2xl border border-brand-lavender/30 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand-slate">
            <Clock size={19} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-brand-slate">
              {timeLeft.isEnded ? 'Ditutup' : 'Dibuka'}
            </span>
            <h4 className="mt-0.5 font-serif text-base font-bold text-brand-navy sm:text-lg">
              {poPeriod.title}
            </h4>
            {poPeriod.announcement && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                {poPeriod.announcement}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
          {timeLeft.isEnded ? (
            <span className="text-sm font-semibold text-slate-600">Periode pemesanan berakhir</span>
          ) : (
            <div className="flex items-center gap-3 text-center">
              <div>
                <span className="block font-serif text-lg font-bold text-brand-navy">{timeLeft.days}</span>
                <span className="text-[10px] text-slate-500">hari</span>
              </div>
              <span className="text-slate-300">:</span>
              <div>
                <span className="block font-serif text-lg font-bold text-brand-navy">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500">jam</span>
              </div>
              <span className="text-slate-300">:</span>
              <div>
                <span className="block font-serif text-lg font-bold text-brand-navy">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500">menit</span>
              </div>
            </div>
          )}
          <div className="text-right text-xs text-slate-500">
            {poPeriod.quota > 0 && (
              <span className="block font-semibold text-brand-navy">
                {poPeriod.orderedCount}/{poPeriod.quota} pesanan
              </span>
            )}
            <span>{poPeriod.productionEstimateDays} hari pengerjaan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
