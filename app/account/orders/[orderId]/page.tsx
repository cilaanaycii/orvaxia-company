'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  PackageCheck,
  Truck,
  CreditCard,
  MessageCircle,
  ExternalLink,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/lib/types';

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { currentUser, isAuthReady, siteSettings } = useCompanyStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!currentUser || currentUser.role !== 'customer') {
      router.replace(`/auth?tab=login&next=${encodeURIComponent(`/account/orders/${params.orderId}`)}`);
      setIsLoading(false);
      return;
    }
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.orderId);
    const lookup = isUuid
      ? supabase
          .from('company_orders')
          .select('id,details,order_status,payment_status,created_at,updated_at')
          .eq('id', params.orderId)
      : supabase
          .from('company_orders')
          .select('id,details,order_status,payment_status,created_at,updated_at')
          .eq('reference_code', params.orderId);

    void lookup.maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error('Customer order detail lookup failed', error);
      setOrder(
        data
          ? {
              ...(data.details as Order),
              id: data.id,
              orderStatus: data.order_status,
              paymentStatus: data.payment_status,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            }
          : null
      );
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [currentUser, isAuthReady, params.orderId, router]);

  const generateHelpWaLink = (currentOrder: Order) => {
    const rawNumber = siteSettings?.whatsappNumber || '0881027291245';
    const waNumber = rawNumber.replace(/^0/, '62');
    const msg = `Halo Tim ORVAXIA, saya ingin menanyakan status pesanan saya dengan nomor referensi *${currentOrder.referenceCode}*. Mohon bantuannya. Terima kasih!`;
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

  if (!isAuthReady || !currentUser || currentUser.role !== 'customer' || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-slate border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-slate-600">Memeriksa rincian pesanan...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] px-4 py-12 text-brand-navy">
        <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
          <p className="text-sm font-medium text-slate-700">Pesanan tidak ditemukan atau tidak memiliki hak akses.</p>
          <p className="text-xs text-slate-500">Pastikan nomor referensi pesanan sudah sesuai.</p>
          <div className="pt-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-slate"
            >
              <ArrowLeft size={14} /> Kembali ke Riwayat Pesanan
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusBadge = getStatusBadge(order.orderStatus);

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-28 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={32} />
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-slate transition hover:text-brand-navy"
          >
            <ArrowLeft size={14} /> Riwayat Pesanan
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
                Nomor Referensi Pesanan
              </span>
              <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-navy mt-0.5">
                {order.referenceCode}
              </h1>
              <span className="text-[11px] text-slate-400 block mt-1">
                Dipesan pada:{' '}
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium border ${statusBadge.color}`}
              >
                {statusBadge.label}
              </span>
              <span className="text-[11px] text-slate-500">
                Estimasi Pengerjaan: 5–7 Hari Kerja
              </span>
            </div>
          </div>

          {/* Two-Column Info: Customer & Payment */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
                <User size={15} className="text-brand-slate" />
                <span>Data Pemesan</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Nama:</span>
                  <span className="font-medium text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>WhatsApp:</span>
                  <span className="font-medium text-slate-900">{order.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sekolah:</span>
                  <span className="font-medium text-slate-900">{order.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kelas:</span>
                  <span className="font-medium text-slate-900">{order.className}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
                <Truck size={15} className="text-brand-slate" />
                <span>Pengantaran & Pembayaran</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Metode Antar:</span>
                  <span className="font-medium text-slate-900">
                    {order.deliveryType === 'school'
                      ? 'Antar Sekolah (SMKN 2)'
                      : order.deliveryType === 'pickup'
                      ? 'Ambil di Booth'
                      : 'Kirim ke Rumah'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Alamat:</span>
                  <span className="font-medium text-slate-900 truncate max-w-[200px]" title={order.shippingAddress}>
                    {order.shippingAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pembayaran:</span>
                  <span className="font-medium text-slate-900">
                    {order.paymentMethod === 'cash_school' ? 'Tunai di Sekolah' : order.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status Bayar:</span>
                  <span className="font-medium text-emerald-700 capitalize">
                    {order.paymentStatus === 'verified' ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Items Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-brand-navy border-b border-slate-100 pb-2">
              <PackageCheck size={16} className="text-brand-slate" />
              <span>Detail Produk yang Dipesan</span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-xl border border-slate-100 bg-[#FAF8F5] p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-brand-navy">{item.productName}</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Varian: <strong className="text-slate-800">{item.variantName}</strong> · Ukuran: <strong className="text-slate-800">{item.sizeName}</strong>
                        {item.customCharm && ` · Charm: ${item.customCharm}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-slate-900">{item.quantity} pcs</span>
                      <p className="font-semibold text-brand-navy mt-0.5">
                        Rp{item.subtotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {item.customization?.customNotes && (
                    <div className="pt-1.5 border-t border-slate-200/50 text-[11px] text-amber-900">
                      <span className="font-semibold">Catatan Custom:</span> &quot;{item.customization.customNotes}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700">
                <span className="font-semibold text-slate-800">Catatan Tambahan:</span> {order.notes}
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk:</span>
                <span className="font-medium text-slate-900">Rp{order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim:</span>
                <span className="font-medium text-slate-900">Rp{order.shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-display text-base font-bold text-brand-navy">
                <span>Total Pembayaran:</span>
                <span>Rp{order.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Action Row: WhatsApp Support CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Ada pertanyaan atau ingin mengubah catatan pesanan?
            </span>
            <a
              href={generateHelpWaLink(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-navy px-5 py-2.5 font-semibold text-white shadow-xs hover:bg-brand-slate transition-all"
            >
              <MessageCircle size={15} />
              <span>Hubungi WhatsApp ORVAXIA</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
