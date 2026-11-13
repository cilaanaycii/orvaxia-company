'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, PackageCheck, Clock, ExternalLink } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';
import { supabase } from '@/lib/supabase/client';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';

export default function AccountInboxPage() {
  const router = useRouter();
  const { currentUser, isAuthReady } = useCompanyStore();
  const [events, setEvents] = useState<Array<{
    id: string;
    order_id: string;
    order_status: string;
    tracking_number: string | null;
    created_at: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isAuthReady) return;
    if (!currentUser || currentUser.role !== 'customer') {
      router.replace('/auth?tab=login&next=%2Faccount%2Finbox');
      setIsLoading(false);
      return;
    }
    if (!supabase) {
      setLoadError('Supabase belum dikonfigurasi.');
      setIsLoading(false);
      return;
    }
    let active = true;
    void supabase
      .from('company_order_events')
      .select('id,order_id,order_status,tracking_number,created_at')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Customer inbox load failed', error);
          setLoadError('Inbox gagal dimuat.');
        } else {
          setEvents(data || []);
        }
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser, isAuthReady, router]);

  if (!isAuthReady || !currentUser || currentUser.role !== 'customer') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <div className="flex items-center gap-3 rounded-2xl border border-brand-lavender/30 bg-white p-6 shadow-xs text-xs font-semibold text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-slate border-t-transparent" />
          <span>Memeriksa akses inbox akun...</span>
        </div>
      </main>
    );
  }

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" aria-label="ORVAXIA Home" className="transition-transform active:scale-95">
            <OrvaxiaLogo size={34} />
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full border border-brand-lavender/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-navy shadow-xs transition-all duration-150 hover:border-brand-slate hover:bg-brand-surface active:scale-95"
          >
            <ArrowLeft size={14} className="text-brand-slate" />
            <span>Profil Akun</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6">
          <span className="badge-brand">
            <Bell size={12} className="text-brand-slate" />
            Notifikasi Pelanggan
          </span>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
            Inbox Pesanan
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Status terkini, tahapan produksi, dan resi pengiriman pesanan Anda
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-brand-lavender/35 bg-white p-5 shadow-xs">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-xs text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-slate border-t-transparent" />
              <span>Memuat notifikasi pesanan...</span>
            </div>
          ) : loadError ? (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center text-xs text-rose-700">
              {loadError}
            </div>
          ) : events.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-brand-surface text-brand-slate shadow-xs">
                <Bell size={24} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-brand-navy">
                Belum ada pembaruan pesanan
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                Setiap perubahan tahapan pesanan Rovella Anda akan dicatat dan diinformasikan di sini.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-slate active:scale-95"
              >
                Jelajahi Produk Rovella
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/account/orders/${event.order_id}`}
                  className="group flex items-start gap-4 p-4 text-left transition-all duration-150 hover:bg-brand-surface/60 rounded-2xl"
                >
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-lavender/30 bg-brand-surface text-brand-slate shadow-xs group-hover:bg-white transition-colors">
                    <PackageCheck size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold text-brand-navy group-hover:text-brand-slate transition-colors">
                        Status Pesanan: {event.order_status}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock size={11} />
                        {formatDateTime(event.created_at)}
                      </span>
                    </div>
                    {event.tracking_number && (
                      <p className="mt-1 text-xs font-mono font-semibold text-brand-slate">
                        Nomor Resi: {event.tracking_number}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <span>Buka detail pesanan</span>
                      <ExternalLink size={10} />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <MagicNavigation />
    </main>
  );
}
