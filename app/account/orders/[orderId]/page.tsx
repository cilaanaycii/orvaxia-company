'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PackageCheck } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/lib/types';

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { currentUser, isAuthReady } = useCompanyStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!currentUser || currentUser.role !== 'customer') {
      router.replace(`/auth?next=${encodeURIComponent(`/account/orders/${params.orderId}`)}`);
      setIsLoading(false);
      return;
    }
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const lookup = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.orderId)
      ? supabase.from('company_orders').select('id,details,order_status,payment_status,created_at,updated_at').eq('id', params.orderId)
      : supabase.from('company_orders').select('id,details,order_status,payment_status,created_at,updated_at').eq('reference_code', params.orderId);
    void lookup
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Customer order detail lookup failed', error);
        setOrder(data ? {
          ...(data.details as Order),
          id: data.id,
          orderStatus: data.order_status,
          paymentStatus: data.payment_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } : null);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser, isAuthReady, params.orderId, router]);

  if (!isAuthReady || !currentUser || currentUser.role !== 'customer' || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <p className="text-sm font-semibold text-slate-600">Memeriksa akses detail pesanan...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 text-brand-navy">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          {isLoading ? 'Memuat detail pesanan...' : 'Pesanan tidak ditemukan.'}
          <div className="mt-4"><Link href="/account/orders" className="text-brand-slate underline">Kembali ke riwayat pembelian</Link></div>
        </div>
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
          <Link href="/account/orders" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate transition hover:text-brand-navy">
            <ArrowLeft size={14} /> Kembali
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] border border-brand-lavender/30 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <span className="badge-brand">Order Detail</span>
              <h1 className="mt-3 font-serif text-3xl font-bold text-brand-navy">{order.referenceCode}</h1>
            </div>
            <div className="rounded-full border border-brand-lavender/30 bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-navy">
              {order.orderStatus}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate">Data Pemesan</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Nama: {order.customerName}</div>
                <div>Email: {order.customerEmail}</div>
                <div>WhatsApp: {order.customerPhone}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate">Ringkasan Pembayaran</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Subtotal: Rp{order.subtotal.toLocaleString('id-ID')}</div>
                <div>Ongkir: Rp{order.shippingCost.toLocaleString('id-ID')}</div>
                <div>Total: Rp{order.totalAmount.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-lavender/30 bg-brand-surface p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy"><PackageCheck size={16} /> Detail produk</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.productName} × {item.quantity} — {item.variantName} / {item.sizeName}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
