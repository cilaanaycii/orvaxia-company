'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PackageCheck, MessageCircle, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/lib/types';

export default function AccountOrdersPage() {
  const router = useRouter();
  const { currentUser, isAuthReady, siteSettings } = useCompanyStore();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isAuthReady) return;
    if (!currentUser || currentUser.role !== 'customer') {
      router.replace('/auth?tab=login&next=%2Faccount%2Forders');
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
      .from('company_orders')
      .select('id,details,order_status,payment_status,created_at,updated_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Customer order history load failed', error);
          setLoadError('Riwayat pesanan gagal dimuat.');
          setUserOrders([]);
        } else {
          setUserOrders(
            (data || []).map((row) => ({
              ...(row.details as Order),
              id: row.id,
              orderStatus: row.order_status,
              paymentStatus: row.payment_status,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            }))
          );
        }
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser, isAuthReady, router]);

  const generateHelpWaLink = (order: Order) => {
    const rawNumber = siteSettings?.whatsappNumber || '0881027291245';
    const waNumber = rawNumber.replace(/^0/, '62');
    const msg = `Halo Tim ORVAXIA, saya ingin menanyakan perkembangan pesanan saya dengan nomor referensi *${order.referenceCode}*. Mohon informasinya. Terima kasih!`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_production':
        return { label: 'Sedang Dirajut', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'quality_check':
        return { label: 'Pemeriksaan Mutu', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'packaging':
        return { label: 'Proses Kemas', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ready_to_ship':
        return { label: 'Siap Dikirim', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'completed':
        return { label: 'Selesai', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'pending_confirmation':
        return { label: 'Menunggu Konfirmasi', color: 'bg-slate-50 text-slate-700 border-slate-200' };
      default:
        return { label: status.replace(/_/g, ' '), color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  if (!isAuthReady || !currentUser || currentUser.role !== 'customer') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-slate border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-slate-600">Memeriksa akun pelanggan...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-28 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={32} />
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-slate transition hover:text-brand-navy"
          >
            <ArrowLeft size={14} /> Profil Saya
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-lavender/30 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-medium text-brand-slate border border-brand-lavender/30">
                Pesanan Saya
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight mt-1">
              Riwayat Pesanan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau status pengerjaan, antrean rajut, dan jadwal pengantaran pesanan Rovella Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-slate self-start sm:self-auto">
            <span>{userOrders.length} Pesanan Tercatat</span>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-navy border-t-transparent mx-auto" />
              <p>Memuat riwayat pesanan Anda...</p>
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center text-xs text-rose-700"
            >
              {loadError}
            </div>
          ) : userOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-lavender/40 bg-white p-12 text-center text-xs text-slate-600 space-y-3">
              <PackageCheck className="mx-auto text-brand-slate" size={32} />
              <p className="font-medium text-slate-800">Belum ada riwayat pesanan</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                Anda belum melakukan pemesanan rajutan Rovella. Silakan jelajahi katalog produk kami.
              </p>
              <Link
                href="/#shop"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-slate transition-all mt-2"
              >
                Buka Katalog Produk <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            userOrders.map((order) => {
              const statusBadge = getStatusBadge(order.orderStatus);
              const totalItems = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-brand-lavender/30 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-brand-slate transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-navy">
                          {order.referenceCode}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Dibuat pada:{' '}
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-[11px] text-slate-500 block">Total Tagihan:</span>
                      <span className="font-display font-bold text-base text-brand-navy">
                        Rp{order.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5 text-xs">
                    {(order.items || []).map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between text-slate-700">
                        <span>
                          {item.productName} ({item.variantName}, {item.sizeName})
                          {item.customCharm && ` · Charm: ${item.customCharm}`}
                        </span>
                        <span className="font-medium text-slate-900">{item.quantity} pcs</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                    <a
                      href={generateHelpWaLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      <MessageCircle size={14} /> Tanya Progres ke WhatsApp
                    </a>

                    <Link
                      href={`/account/orders/${order.referenceCode}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-1.5 font-semibold text-white shadow-xs hover:bg-brand-slate transition-all"
                    >
                      <span>Lihat Rincian Pesanan</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
