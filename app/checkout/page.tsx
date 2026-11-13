'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  MapPin,
  Clock,
  Lock,
  Plus,
  Minus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { TopNav } from '@/components/navigation/TopNav';
import { useCompanyStore } from '@/lib/store/company-store';
import { Order } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    siteSettings,
    poPeriod,
    currentUser,
    isAuthReady,
  } = useCompanyStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [waPopupBlocked, setWaPopupBlocked] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [schoolName, setSchoolName] = useState('SMKN 2 Buduran Sidoarjo');
  const [className, setClassName] = useState('XII DKV 1');
  const [deliveryType, setDeliveryType] = useState<'school' | 'home' | 'pickup'>('school');
  const [shippingAddress, setShippingAddress] = useState('Lingkungan SMKN 2 Buduran');
  const [distanceKm, setDistanceKm] = useState<number>(0.5);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_school' | 'qris' | 'bank_transfer'>('cash_school');

  // Auth gate check
  useEffect(() => {
    if (isAuthReady && (!currentUser || currentUser.role !== 'customer')) {
      router.replace('/auth?tab=login&next=%2Fcheckout');
    }
  }, [currentUser, isAuthReady, router]);

  // Pre-fill profile data once loaded
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      if (currentUser.fullName) setCustomerName(currentUser.fullName);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.email && currentUser.email.includes('@')) {
        setCustomerEmail(currentUser.email);
      }
    }
  }, [currentUser]);

  // Subtotal & Shipping calculation
  const subtotal = cart.reduce((acc, it) => acc + it.subtotal, 0);

  const calculateShipping = (km: number, type: 'school' | 'home' | 'pickup') => {
    if (type === 'school' || type === 'pickup') return 0;
    if (km <= 2) return siteSettings.shippingRules.range1To2Km;
    if (km <= 5) return siteSettings.shippingRules.range3To5Km;
    if (km <= 7) return siteSettings.shippingRules.range6To7Km;
    return siteSettings.shippingRules.rangeAbove7Km;
  };

  const shippingCost = calculateShipping(distanceKm, deliveryType);
  const grandTotal = subtotal + shippingCost;

  // Build clean and detailed WhatsApp message
  const generateWhatsAppLink = (order: Order) => {
    const rawNumber = siteSettings?.whatsappNumber || '0881027291245';
    const waNumber = rawNumber.replace(/^0/, '62');

    const itemsText = order.items
      .map((it, idx) => {
        const charmPart = it.customCharm ? ` (Charm: ${it.customCharm})` : '';
        const notesPart = it.customization?.customNotes
          ? `\n   - Catatan Custom: ${it.customization.customNotes}`
          : '';
        return `${idx + 1}. ${it.productName} [${it.variantName}, ${it.sizeName}]${charmPart}\n   - Jumlah: ${it.quantity} pcs\n   - Subtotal: Rp${it.subtotal.toLocaleString('id-ID')}${notesPart}`;
      })
      .join('\n\n');

    const deliveryLabel =
      order.deliveryType === 'school'
        ? 'Pengantaran Internal Sekolah (SMKN 2 Buduran)'
        : order.deliveryType === 'pickup'
        ? 'Ambil Langsung di Booth Pameran'
        : `Kirim ke Rumah (${order.distanceKm} km)`;

    const paymentLabel =
      order.paymentMethod === 'cash_school'
        ? 'Tunai di Sekolah'
        : order.paymentMethod === 'qris'
        ? 'QRIS Resmi'
        : order.paymentMethod === 'bank_transfer'
        ? 'Transfer Bank'
        : String(order.paymentMethod).toUpperCase();

    const msg = `Halo Tim ORVAXIA, saya ingin mengonfirmasi pesanan yang sudah saya buat di website.

*Nomor Referensi:* ${order.referenceCode}
*Nama Pemesan:* ${order.customerName}
*WhatsApp:* ${order.customerPhone}
*Sekolah:* ${order.schoolName}
*Kelas:* ${order.className}

*Detail Produk Dipesan:*
${itemsText}

*Rincian Pembayaran:*
- Subtotal Produk: Rp${order.subtotal.toLocaleString('id-ID')}
- Ongkos Kirim: Rp${order.shippingCost.toLocaleString('id-ID')} (${deliveryLabel})
- *Total Pembayaran:* Rp${order.totalAmount.toLocaleString('id-ID')}
- *Metode Pembayaran:* ${paymentLabel}
- *Alamat / Tujuan:* ${order.shippingAddress}
${order.notes ? `\n*Catatan Tambahan:*\n${order.notes}\n` : ''}
Pesanan ini sudah tersimpan di sistem. Mohon konfirmasi jadwal perajutan. Terima kasih!`;

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  // Submit order to Supabase API
  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang belanja Anda masih kosong.');
      return;
    }
    if (!currentUser || currentUser.role !== 'customer') {
      router.replace('/auth?tab=login&next=%2Fcheckout');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Mohon masukkan nama lengkap pemesan.');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Mohon masukkan nomor WhatsApp aktif.');
      return;
    }
    if (deliveryType === 'home' && !shippingAddress.trim()) {
      toast.error('Mohon lengkapi alamat pengiriman rumah.');
      return;
    }

    setIsSubmitting(true);
    setWaPopupBlocked(false);

    try {
      idempotencyKeyRef.current ||= crypto.randomUUID();

      const orderPayload = {
        idempotencyKey: idempotencyKeyRef.current,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || `${customerPhone.replace(/\D/g, '')}@orvaxia.com`,
        customerPhone: customerPhone.trim(),
        schoolName: schoolName.trim() || 'SMKN 2 Buduran Sidoarjo',
        className: className.trim() || 'Umum',
        deliveryType,
        shippingAddress:
          deliveryType === 'school'
            ? `Pengantaran ke Kelas: ${className}, ${schoolName}`
            : deliveryType === 'pickup'
            ? 'Pengambilan Langsung di Booth SMKN 2 Buduran'
            : shippingAddress.trim(),
        distanceKm,
        shippingCost,
        subtotal,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: 'pending' as const,
        orderStatus: 'pending_confirmation' as const,
        poPeriodId: poPeriod.id,
        items: cart.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: it.productName,
          variantName: it.variantName,
          sizeName: it.sizeName,
          customCharm: it.customCharm,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          subtotal: it.subtotal,
          customization: {
            bottleSize: it.sizeName,
            variantColor: it.variantName,
            customCharm: it.customCharm,
            customNotes: it.customizationNotes || '',
            customImageRefName: it.customImageRefName,
          },
        })),
        notes: orderNotes.trim(),
      };

      const savedOrder = await createOrder(orderPayload);
      setCompletedOrder(savedOrder);
      idempotencyKeyRef.current = null;
      toast.success(`Pesanan ${savedOrder.referenceCode} berhasil disimpan!`);

      // Attempt automatic redirect to WhatsApp
      const waLink = generateWhatsAppLink(savedOrder);
      try {
        const popup = window.open(waLink, '_blank', 'noopener,noreferrer');
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          setWaPopupBlocked(true);
        }
      } catch {
        setWaPopupBlocked(true);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
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

  // ================= SUCCESS VIEW =================
  if (completedOrder) {
    const waLink = generateWhatsAppLink(completedOrder);

    return (
      <main className="min-h-screen bg-[#FAF8F5] pb-24 text-brand-navy">
        <TopNav />
        <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
          <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-medium text-brand-slate border border-brand-lavender/30">
                Pesanan Berhasil Disimpan
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-navy mt-3">
                Terima Kasih atas Pesanan Anda
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                Pesanan Anda telah resmi tercatat di sistem kami dengan kode referensi di bawah ini. Silakan teruskan konfirmasi ke WhatsApp ORVAXIA untuk jadwal perajutan.
              </p>
            </div>

            {/* Reference Code Card */}
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-brand-slate bg-brand-surface/60 p-5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Nomor Referensi Pesanan
              </span>
              <p className="font-mono text-2xl font-bold text-brand-navy tracking-wider mt-1">
                {completedOrder.referenceCode}
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-600">
                <Clock size={14} className="text-brand-slate" />
                <span>Estimasi Pengerjaan: 5–7 Hari Kerja</span>
              </div>
            </div>

            {/* Order Details Brief */}
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Nama Pemesan:</span>
                <span className="font-medium text-slate-900">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sekolah / Kelas:</span>
                <span className="font-medium text-slate-900">{completedOrder.schoolName} — {completedOrder.className}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Metode Pembayaran:</span>
                <span className="font-medium text-slate-900">
                  {completedOrder.paymentMethod === 'cash_school' ? 'Tunai di Sekolah' : completedOrder.paymentMethod.toUpperCase()}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-brand-navy">
                <span>Total Pembayaran:</span>
                <span>Rp{completedOrder.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* WhatsApp Call To Action */}
            <div className="mx-auto max-w-md space-y-3 pt-2">
              {waPopupBlocked && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Jendela pesan otomatis terhalang oleh browser. Klik tombol di bawah ini untuk membuka WhatsApp ORVAXIA secara manual.
                  </span>
                </div>
              )}

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy px-6 py-3.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-slate transition-all"
              >
                <MessageCircle size={17} />
                <span>Lanjut ke WhatsApp ORVAXIA</span>
                <ExternalLink size={14} />
              </a>

              <p className="text-[11px] text-slate-500">
                Pesanan sudah tersimpan aman di database. Mengirim WhatsApp akan langsung menghubungkan Anda dengan perwakilan tim produksi dan finance kami.
              </p>
            </div>

            {/* Navigation Shortcuts */}
            <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
              <Link
                href="/account/orders"
                className="text-brand-slate hover:text-brand-navy underline-offset-4 hover:underline"
              >
                Lihat Riwayat Pesanan Saya
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/"
                className="text-slate-600 hover:text-brand-navy"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ================= MAIN CHECKOUT VIEW =================
  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-28 text-brand-navy">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-lavender/30 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-medium text-brand-slate border border-brand-lavender/30">
                Pemesanan Resmi Rovella
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight mt-1">
              Checkout & Konfirmasi Pesanan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Periksa kembali data pemesan, pilihan pengantaran, dan rincian rajutan Anda sebelum mengirim konfirmasi.
            </p>
          </div>

          <Link
            href="/#shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-slate hover:text-brand-navy"
          >
            <ArrowLeft size={14} /> Tambah Produk Lain
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="h-14 w-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h2 className="font-display text-base font-bold text-slate-800">
              Keranjang Belanja Masih Kosong
            </h2>
            <p className="text-xs text-slate-500">
              Pilih produk rajutan Rovella by Orvaxia terlebih dahulu dari katalog kami untuk memulai pemesanan.
            </p>
            <Link
              href="/#shop"
              className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-slate transition-all"
            >
              Lihat Katalog Produk <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Customer Data, Delivery, Payment, Notes */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Customer Information */}
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User size={18} className="text-brand-slate" />
                  <h2 className="font-display text-base font-bold text-brand-navy">
                    Data Pemesan
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-medium text-slate-800 block mb-1">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-800 block mb-1">
                      Nomor WhatsApp Terverifikasi *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={customerPhone}
                      readOnly
                      title="Nomor WhatsApp sesuai akun yang login"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 cursor-not-allowed focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Terkunci sesuai nomor akun terverifikasi.
                    </p>
                  </div>

                  <div>
                    <label className="font-medium text-slate-800 block mb-1">
                      Nama Sekolah / Institusi
                    </label>
                    <input
                      type="text"
                      placeholder="SMKN 2 Buduran / Umum"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-800 block mb-1">
                      Kelas / Jurusan (Khusus Siswa & Guru)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: XII DKV 1 / XI RPL 2"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-brand-slate focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Method */}
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Truck size={18} className="text-brand-slate" />
                  <h2 className="font-display text-base font-bold text-brand-navy">
                    Metode Pengantaran
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType('school');
                      setDistanceKm(0.2);
                    }}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      deliveryType === 'school'
                        ? 'border-brand-navy bg-brand-surface font-semibold text-brand-navy shadow-xs ring-1 ring-brand-navy'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-xs">Antar ke Sekolah</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Khusus SMKN 2 Buduran
                    </p>
                    <span className="inline-block mt-2 font-semibold text-emerald-700 text-[10px]">
                      Gratis Ongkir
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('home')}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      deliveryType === 'home'
                        ? 'border-brand-navy bg-brand-surface font-semibold text-brand-navy shadow-xs ring-1 ring-brand-navy'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-xs">Kirim ke Rumah</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kurir / Ekspedisi lokal
                    </p>
                    <span className="inline-block mt-2 font-semibold text-brand-slate text-[10px]">
                      Berdasarkan Jarak
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType('pickup');
                      setDistanceKm(0);
                    }}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-brand-navy bg-brand-surface font-semibold text-brand-navy shadow-xs ring-1 ring-brand-navy'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-xs">Ambil di Booth</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pameran SMKN 2 Buduran
                    </p>
                    <span className="inline-block mt-2 font-semibold text-emerald-700 text-[10px]">
                      Gratis (Rp0)
                    </span>
                  </button>
                </div>

                {deliveryType === 'home' && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-3">
                    <div>
                      <label className="font-medium text-slate-800 block mb-1">
                        Alamat Lengkap Pengiriman Rumah *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kabupaten"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-brand-slate focus:outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-medium text-slate-800">
                          Estimasi Jarak dari SMKN 2 Buduran: {distanceKm} km
                        </label>
                        <span className="font-bold text-brand-navy">
                          Ongkir: Rp{shippingCost.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={15}
                        step={0.5}
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                        className="w-full accent-brand-navy"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>1–2 km (Rp0)</span>
                        <span>3–5 km (Rp3.000)</span>
                        <span>6–7 km (Rp4.000)</span>
                        <span>&gt;7 km (Rp5.000)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Payment Method */}
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard size={18} className="text-brand-slate" />
                  <h2 className="font-display text-base font-bold text-brand-navy">
                    Metode Pembayaran
                  </h2>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Cash at school */}
                  <div
                    onClick={() => setPaymentMethod('cash_school')}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      paymentMethod === 'cash_school'
                        ? 'border-brand-navy bg-brand-surface ring-1 ring-brand-navy shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cash_school'}
                          onChange={() => setPaymentMethod('cash_school')}
                          className="accent-brand-navy"
                        />
                        <div>
                          <p className="font-semibold text-brand-navy">
                            Pembayaran Tunai di Sekolah (SMKN 2 Buduran)
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Serahkan uang pas kepada perwakilan Finance atau Sales kelas saat jam istirahat.
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-medium hidden sm:inline-block">
                        Internal Sekolah
                      </span>
                    </div>
                  </div>

                  {/* QRIS */}
                  <div
                    onClick={() => setPaymentMethod('qris')}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      paymentMethod === 'qris'
                        ? 'border-brand-navy bg-brand-surface ring-1 ring-brand-navy shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'qris'}
                          onChange={() => setPaymentMethod('qris')}
                          className="accent-brand-navy"
                        />
                        <div>
                          <p className="font-semibold text-brand-navy">
                            QRIS Resmi ORVAXIA
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            BCA, Mandiri, GoPay, OVO, ShopeePay, DANA, dan aplikasi perbankan lainnya.
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 text-[10px] font-medium hidden sm:inline-block">
                        QRIS Instan
                      </span>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-brand-navy bg-brand-surface ring-1 ring-brand-navy shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="accent-brand-navy"
                        />
                        <div>
                          <p className="font-semibold text-brand-navy">
                            Transfer Bank
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {siteSettings.paymentInfo.bankName}: {siteSettings.paymentInfo.accountNumber} a.n {siteSettings.paymentInfo.accountHolder}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-medium hidden sm:inline-block">
                        Transfer Bank
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Customization & Extra Notes */}
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="font-display text-base font-bold text-brand-navy">
                    Catatan Khusus Rajutan & Pesanan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tuliskan ukuran botol spesifik, preferensi warna tambahan, atau instruksi khusus untuk tim perajut Rovella.
                  </p>
                </div>

                <div className="text-xs">
                  <textarea
                    rows={3}
                    placeholder="Contoh: Botol Lock&Lock diameter 7.5cm, tinggi 22cm. Tali selempang dibuat panjang 110cm."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Cart Items, Summary & Submit Button (Sticky) */}
            <div className="lg:col-span-5 sticky top-20 space-y-4">
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="font-display text-base font-bold text-brand-navy">
                    Ringkasan Pesanan
                  </h2>
                  <span className="text-xs font-medium text-slate-500">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} Produk
                  </span>
                </div>

                {/* Items in Cart */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-3 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-brand-slate border border-slate-200">
                            {item.variantName}
                          </span>
                          <h3 className="font-semibold text-brand-navy mt-1">
                            {item.productName}
                          </h3>
                          <p className="text-[11px] text-slate-600">
                            Ukuran: {item.sizeName}
                            {item.customCharm && ` · Charm: ${item.customCharm}`}
                          </p>
                          {item.customizationNotes && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5">
                              &quot;{item.customizationNotes}&quot;
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Hapus item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                        {/* Quantity controls */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 rounded bg-slate-50 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-7 text-center font-semibold text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 rounded bg-slate-50 font-bold hover:bg-slate-100 flex items-center justify-center text-xs"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <span className="font-semibold text-xs text-brand-navy">
                          Rp{item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Produk:</span>
                    <span className="font-medium text-slate-900">
                      Rp{subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkos Kirim:</span>
                    <span className="font-medium text-slate-900">
                      {shippingCost === 0 ? 'Rp0 (Gratis)' : `Rp${shippingCost.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-display text-base font-bold text-brand-navy">
                    <span>Total Pembayaran:</span>
                    <span>Rp{grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Single Main Confirm Action */}
                <button
                  type="button"
                  disabled={isSubmitting || cart.length === 0}
                  onClick={handleCompleteOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy py-3.5 px-5 text-xs font-semibold text-white shadow-sm hover:bg-brand-slate transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Konfirmasi & Buat Pesanan</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Pesanan resmi terhubung ke sistem produksi ORVAXIA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
