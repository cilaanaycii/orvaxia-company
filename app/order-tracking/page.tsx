'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Truck } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/company-store';

interface TrackingResult {
  referenceCode: string;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  events: { order_status: string; tracking_number: string | null; created_at: string }[];
}

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function OrderTrackingPage() {
  const { orders } = useCompanyStore();
  const [referenceCode, setReferenceCode] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!result) return;
    const refreshTracking = async () => {
      try {
        const query = new URLSearchParams({ referenceCode, phone });
        const response = await fetch(`/api/orders/track?${query}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        setResult(data as TrackingResult);
      } catch (refreshError) {
        console.error('Automatic order tracking refresh failed', refreshError);
      }
    };
    const interval = setInterval(() => void refreshTracking(), 30_000);
    return () => clearInterval(interval);
  }, [result?.referenceCode, referenceCode, phone]);

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const cleanRef = referenceCode.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const query = new URLSearchParams({ referenceCode: cleanRef, phone });
      const response = await fetch(`/api/orders/track?${query}`, { cache: 'no-store' });
      const data = await response.json();

      if (response.ok) {
        setResult(data as TrackingResult);
        return;
      }

      // Fallback ke data store lokal
      const matchedOrder = orders.find((o) => {
        const oRef = o.referenceCode?.trim().toUpperCase();
        const oPhone = o.customerPhone?.replace(/\D/g, '');
        return oRef === cleanRef && oPhone === cleanPhone;
      });

      if (matchedOrder) {
        setResult({
          referenceCode: matchedOrder.referenceCode || cleanRef,
          status: matchedOrder.orderStatus,
          trackingNumber: matchedOrder.trackingNumber || null,
          createdAt: matchedOrder.createdAt,
          updatedAt: matchedOrder.updatedAt || matchedOrder.createdAt,
          events: [
            {
              order_status: matchedOrder.orderStatus,
              tracking_number: matchedOrder.trackingNumber || null,
              created_at: matchedOrder.updatedAt || matchedOrder.createdAt,
            },
          ],
        });
        return;
      }

      setError(data.error || 'Pesanan tidak dapat ditemukan. Periksa kembali kode pesanan dan nomor WhatsApp.');
    } catch {
      // Fallback jika jaringan/server bermasalah
      const matchedOrder = orders.find((o) => {
        const oRef = o.referenceCode?.trim().toUpperCase();
        const oPhone = o.customerPhone?.replace(/\D/g, '');
        return oRef === cleanRef && oPhone === cleanPhone;
      });

      if (matchedOrder) {
        setResult({
          referenceCode: matchedOrder.referenceCode || cleanRef,
          status: matchedOrder.orderStatus,
          trackingNumber: matchedOrder.trackingNumber || null,
          createdAt: matchedOrder.createdAt,
          updatedAt: matchedOrder.updatedAt || matchedOrder.createdAt,
          events: [
            {
              order_status: matchedOrder.orderStatus,
              tracking_number: matchedOrder.trackingNumber || null,
              created_at: matchedOrder.updatedAt || matchedOrder.createdAt,
            },
          ],
        });
      } else {
        setError('Pesanan tidak ditemukan atau koneksi bermasalah.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 text-brand-navy">
      <div className="mx-auto max-w-xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-slate hover:underline">
          <ArrowLeft size={16} /> Kembali ke beranda
        </Link>
        <section className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand-slate">
            <Truck size={23} />
          </div>
          <h1 className="font-serif text-2xl font-bold">Lacak Pesanan</h1>
          <p className="mt-2 text-sm text-slate-600">
            Masukkan kode pesanan dan nomor WhatsApp yang digunakan saat checkout.
          </p>
          <form onSubmit={handleLookup} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Kode pesanan
              <input
                required
                value={referenceCode}
                onChange={(event) => setReferenceCode(event.target.value)}
                placeholder="ORV-..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono uppercase"
              />
            </label>
            <label className="block text-sm font-medium">
              Nomor WhatsApp
              <input
                required
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="08..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>
            <button
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-slate disabled:opacity-60"
            >
              <Search size={16} /> {loading ? 'Mencari...' : 'Cek Status'}
            </button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        </section>

        {result && (
          <section className="rounded-3xl border border-brand-lavender/40 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Kode pesanan</p>
                <p className="font-mono font-bold text-brand-navy text-lg">{result.referenceCode}</p>
              </div>
              <span className="rounded-full bg-brand-surface border border-brand-lavender/40 px-3 py-1 text-xs font-bold text-brand-navy">
                {formatStatus(result.status)}
              </span>
            </div>
            {result.trackingNumber && (
              <p className="mt-4 text-sm"><strong>Nomor resi:</strong> {result.trackingNumber}</p>
            )}
            <h2 className="mt-6 border-b border-slate-100 pb-2 font-semibold">Riwayat status</h2>
            <ol className="mt-3 space-y-3">
              {result.events.map((item, index) => (
                <li key={`${item.created_at}-${index}`} className="border-l-2 border-brand-slate pl-3 text-sm">
                  <p className="font-medium text-brand-navy">{formatStatus(item.order_status)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString('id-ID')}
                    {item.tracking_number ? ` · Resi ${item.tracking_number}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
