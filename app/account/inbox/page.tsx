'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';
import { supabase } from '@/lib/supabase/client';

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
      router.replace('/auth?next=%2Faccount%2Finbox');
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
        <p className="text-sm font-semibold text-slate-600">Memeriksa akses inbox...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={34} />
          </Link>
          <Link href="/account" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate transition hover:text-brand-navy">
            <ArrowLeft size={14} /> My Profile
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge-brand">Inbox</span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-brand-navy">Notifikasi customer</h1>
          </div>
        </div>

        <div className="space-y-3 rounded-[2rem] border border-brand-lavender/30 bg-white p-4 shadow-sm">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-8 text-center text-sm text-slate-600">Memuat inbox...</div>
          ) : loadError ? (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-8 text-center text-sm text-rose-700">{loadError}</div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#FAF8F5] p-8 text-center text-sm text-slate-600">
              <Bell className="mx-auto mb-3 text-brand-slate" size={24} />
              Belum ada pembaruan pesanan.
            </div>
          ) : (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/account/orders/${event.order_id}`}
                className="flex items-start gap-3 rounded-2xl border border-brand-lavender/30 bg-brand-surface p-4 text-left"
              >
                <span className="mt-1 rounded-full bg-white p-2 text-brand-slate shadow-sm">
                  <Bell size={14} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-brand-navy">Pembaruan pesanan: {event.order_status}</span>
                  {event.tracking_number && <span className="mt-1 block text-xs text-slate-600">Nomor resi: {event.tracking_number}</span>}
                  <span className="mt-1 block text-xs leading-6 text-slate-500">{new Date(event.created_at).toLocaleString('id-ID')}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
