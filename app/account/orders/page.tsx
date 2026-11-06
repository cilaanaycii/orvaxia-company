'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PackageCheck, Search } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';

export default function AccountOrdersPage() {
  const router = useRouter();
  const { currentUser, orders } = useCompanyStore();

  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <p className="text-sm font-semibold text-slate-600">Memeriksa akses histori pesanan...</p>
      </main>
    );
  }

  const userOrders = orders.filter(
    (order) => order.customerEmail === currentUser.email || order.customerPhone === currentUser.phone,
  );

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
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <span className="badge-brand">Purchase History</span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-brand-navy">Riwayat Pembelian</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-slate">
            <Search size={14} /> {userOrders.length} pesanan
          </div>
        </div>

        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-brand-lavender/40 bg-white p-8 text-center text-sm text-slate-600">
              <PackageCheck className="mx-auto mb-3 text-brand-slate" size={28} />
              Belum ada riwayat pembelian. Mulai dengan produk favorit Anda.
            </div>
          ) : (
            userOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.referenceCode}`} className="block rounded-[2rem] border border-brand-lavender/30 bg-white p-5 shadow-sm transition hover:border-brand-slate">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-slate">{order.referenceCode}</div>
                    <div className="mt-1 font-serif text-2xl font-bold text-brand-navy">{order.items[0]?.productName ?? 'Produk ORVAXIA'}</div>
                  </div>
                  <div className="text-sm font-semibold text-brand-slate">{order.paymentStatus}</div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <div>Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID')}</div>
                  <div>Jumlah: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                  <div>Total: Rp{order.totalAmount.toLocaleString('id-ID')}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
