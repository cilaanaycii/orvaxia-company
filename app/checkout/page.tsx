'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCompanyStore } from '@/lib/store/company-store';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import {
  ShoppingBag,
  User,
  Sliders,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    createOrder,
    siteSettings,
    poPeriod,
    currentUser,
  } = useCompanyStore();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // STEP 2: Customer & Delivery Info
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [schoolName, setSchoolName] = useState('SMKN 2 Buduran Sidoarjo');
  const [className, setClassName] = useState('XII DKV 1');
  const [deliveryType, setDeliveryType] = useState<'school' | 'home' | 'pickup'>('school');
  const [shippingAddress, setShippingAddress] = useState('Lingkungan SMKN 2 Buduran');
  const [distanceKm, setDistanceKm] = useState<number>(0.5);
  const [orderNotes, setOrderNotes] = useState('');

  // STEP 3: Customization
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFilePreview, setCustomFilePreview] = useState<string>('');
  const [customRequirementNotes, setCustomRequirementNotes] = useState('');

  // STEP 5: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'cash_school' | 'qris' | 'bank_transfer'>('cash_school');

  // Calculate items subtotal
  const subtotal = cart.reduce((acc, it) => acc + it.subtotal, 0);

  // Calculate shipping cost based on official rules from SMKN 2 Buduran
  const calculateShipping = (km: number, type: 'school' | 'home' | 'pickup') => {
    if (type === 'school' || type === 'pickup') return 0;
    if (km <= 2) return siteSettings.shippingRules.range1To2Km; // 0
    if (km <= 5) return siteSettings.shippingRules.range3To5Km; // 3000
    if (km <= 7) return siteSettings.shippingRules.range6To7Km; // admin configured (4000)
    return siteSettings.shippingRules.rangeAbove7Km; // 5000
  };

  const shippingCost = calculateShipping(distanceKm, deliveryType);
  const grandTotal = subtotal + shippingCost;

  // Handle custom image upload validation (Max 5MB, JPG/PNG only)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format file harus JPG, PNG, atau WEBP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setCustomFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCustomFilePreview(reader.result as string);
      toast.success('Referensi gambar berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  // Submit Order
  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang belanja kosong');
      return;
    }
    if (!customerName || !customerPhone) {
      toast.error('Mohon lengkapi nama dan nomor WhatsApp');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customerName,
        customerEmail: customerEmail || 'customer@orvaxia.com',
        customerPhone,
        schoolName,
        className,
        deliveryType,
        shippingAddress:
          deliveryType === 'school'
            ? `Pengantaran ke Kelas: ${className}, ${schoolName}`
            : deliveryType === 'pickup'
            ? 'Pengambilan Langsung di SMKN 2 Buduran'
            : shippingAddress,
        distanceKm,
        shippingCost,
        subtotal,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash_school' ? 'pending' : 'pending',
        orderStatus: 'pending_confirmation',
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
            customNotes: `${it.customizationNotes || ''} ${customRequirementNotes}`.trim(),
            customImageRefName: customFile ? customFile.name : undefined,
          },
        })),
        notes: orderNotes,
      });

      setCompletedOrder(order);
      setStep(6);
      toast.success(`Pesanan ${order.referenceCode} berhasil disimpan!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memproses pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate WhatsApp message URL encoded
  const generateWhatsAppLink = () => {
    if (!completedOrder) return '#';
    const waNumber = siteSettings.whatsappNumber.replace(/^0/, '62');
    const itemsText = completedOrder.items
      .map(
        (it: any) =>
          `• ${it.productName} (${it.variantName}, ${it.sizeName})${it.customCharm ? ` + ${it.customCharm}` : ''} x${it.quantity} = Rp${it.subtotal.toLocaleString('id-ID')}`
      )
      .join('\n');

    const msg = `Halo ORVAXIA COMPANY, saya ingin mengonfirmasi pesanan.

Kode Pesanan: ${completedOrder.referenceCode}
Nama: ${completedOrder.customerName}
Kelas: ${completedOrder.className}
Sekolah: ${completedOrder.schoolName}
WhatsApp: ${completedOrder.customerPhone}

Produk:
${itemsText}

Subtotal: Rp${completedOrder.subtotal.toLocaleString('id-ID')}
Ongkir: Rp${completedOrder.shippingCost.toLocaleString('id-ID')}
Total: Rp${completedOrder.totalAmount.toLocaleString('id-ID')}
Metode Pembayaran: ${completedOrder.paymentMethod === 'cash_school' ? 'Tunai di Sekolah' : completedOrder.paymentMethod.toUpperCase()}
Status Pembayaran: Menunggu Verifikasi Finance
Alamat Pengiriman: ${completedOrder.shippingAddress}

Mohon konfirmasi pesanan saya. Terima kasih!`;

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  };

  const stepsList = [
    { num: 1, label: 'Keranjang', icon: ShoppingBag },
    { num: 2, label: 'Data Pemesan', icon: User },
    { num: 3, label: 'Kustomisasi', icon: Sliders },
    { num: 4, label: 'Ongkos Kirim', icon: Truck },
    { num: 5, label: 'Pembayaran', icon: CreditCard },
    { num: 6, label: 'Selesai', icon: CheckCircle2 },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-28 text-brand-navy">
      {/* Top Header */}
      <header className="border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/">
            <OrvaxiaLogo size={36} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-brand-slate hover:text-brand-navy"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-8">
        {/* Step Indicator Progress Bar */}
        <div className="mb-8 rounded-2xl border border-brand-lavender/30 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isPast = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-2 shrink-0 ${
                    isCurrent
                      ? 'text-brand-slate font-bold'
                      : isPast
                      ? 'text-emerald-700 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-brand-slate text-white shadow-sm ring-2 ring-brand-slate/30'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : s.num}
                  </div>
                  <span className="text-xs hidden sm:inline">{s.label}</span>
                  {s.num < 6 && <span className="text-slate-300 ml-1">→</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content per Step */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            {/* ================= STEP 1: CART ================= */}
            {step === 1 && (
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">
                    Step 1 — Keranjang Belanja Pre-Order
                  </h3>
                  <span className="text-xs text-brand-slate font-medium">
                    {cart.length} Jenis Item
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="p-8 text-center">
                    <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Keranjang Anda masih kosong</p>
                    <p className="text-xs text-slate-500 mt-1">Pilih produk Rovella by Orvaxia terlebih dahulu.</p>
                    <Link
                      href="/#shop"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-slate px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-navy"
                    >
                      Buka Katalog Produk <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-brand-surface/40 p-4"
                      >
                        <div>
                          <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[10px] font-bold text-brand-slate border border-brand-lavender/30">
                            {item.variantName}
                          </span>
                          <h4 className="font-bold text-sm text-brand-navy mt-1">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-slate-600">
                            Ukuran: {item.sizeName}
                            {item.customCharm && ` · Charm: ${item.customCharm}`}
                          </p>
                          {item.customizationNotes && (
                            <p className="text-[11px] text-brand-slate italic mt-0.5">
                              Catatan: &quot;{item.customizationNotes}&quot;
                            </p>
                          )}
                          <p className="font-serif font-bold text-xs text-brand-navy mt-1">
                            Rp{item.unitPrice.toLocaleString('id-ID')} / pcs
                          </p>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-xs">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-serif font-bold text-sm text-brand-navy min-w-[70px] text-right">
                            Rp{item.subtotal.toLocaleString('id-ID')}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-rose-500 hover:text-rose-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={clearCart}
                        className="text-xs text-slate-500 hover:text-rose-600"
                      >
                        Kosongkan Keranjang
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-navy"
                      >
                        Lanjut ke Data Pemesan <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= STEP 2: CUSTOMER & DELIVERY ================= */}
            {step === 2 && (
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">
                    Step 2 — Data Pemesan & Pengantaran
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pastikan nomor WhatsApp aktif untuk konfirmasi pesanan dan update produksi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 08123456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nama Sekolah / Institusi
                    </label>
                    <input
                      type="text"
                      placeholder="SMKN 2 Buduran / Umum"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-800 block mb-1">
                      Kelas / Jurusan (Khusus Siswa/Guru)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: XII DKV 1 / XI RPL 2"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>
                </div>

                {/* Delivery Type Option */}
                <div className="pt-2 text-xs">
                  <label className="font-semibold text-slate-800 block mb-2">
                    Jenis Pengantaran
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryType('school');
                        setDistanceKm(0.2);
                      }}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        deliveryType === 'school'
                          ? 'border-brand-slate bg-brand-surface shadow-sm ring-1 ring-brand-slate font-semibold text-brand-navy'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <p className="font-bold text-xs">Pengantaran ke Sekolah</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Khusus SMKN 2 Buduran (Gratis Ongkir)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('home')}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        deliveryType === 'home'
                          ? 'border-brand-slate bg-brand-surface shadow-sm ring-1 ring-brand-slate font-semibold text-brand-navy'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <p className="font-bold text-xs">Kirim ke Rumah / Ekspedisi</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Ongkir dihitung berdasarkan jarak
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryType('pickup');
                        setDistanceKm(0);
                      }}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        deliveryType === 'pickup'
                          ? 'border-brand-slate bg-brand-surface shadow-sm ring-1 ring-brand-slate font-semibold text-brand-navy'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <p className="font-bold text-xs">Ambil Langsung di Booth</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Di SMKN 2 Buduran saat jam pameran
                      </p>
                    </button>
                  </div>
                </div>

                {deliveryType === 'home' && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-3">
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Alamat Lengkap Pengiriman Rumah
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kabupaten"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 focus:border-brand-slate focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Estimasi Jarak dari Titik Pusat SMKN 2 Buduran: {distanceKm} km
                      </label>
                      <input
                        type="range"
                        min={0.5}
                        max={15}
                        step={0.5}
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                        className="w-full accent-brand-slate"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>1 km (Rp0)</span>
                        <span>4 km (Rp3.000)</span>
                        <span>6 km (Rp4.000)</span>
                        <span>&gt;7 km (Rp5.000)</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy"
                  >
                    <ArrowLeft size={14} /> Kembali ke Keranjang
                  </button>
                  <button
                    onClick={() => {
                      if (!customerName || !customerPhone) {
                        toast.error('Nama dan Nomor WhatsApp wajib diisi');
                        return;
                      }
                      setStep(3);
                    }}
                    className="flex items-center gap-2 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-navy"
                  >
                    Lanjut ke Kustomisasi <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: CUSTOMIZATION ================= */}
            {step === 3 && (
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">
                    Step 3 — Kustomisasi Khusus Produk Rajutan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Produk rajutan ORVAXIA dapat disesuaikan dengan dimensi botol Anda dan preferensi warna.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Catatan Spesifik Rajutan / Ukuran Botol
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Botol termos Lock&Lock diameter 7.5cm, tinggi 23cm. Tali selempang ingin dibuat agak panjang."
                      value={customRequirementNotes}
                      onChange={(e) => setCustomRequirementNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  {/* Custom Image Upload */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Unggah Gambar Referensi Custom (Opsional - Maks 5MB)
                    </label>
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center hover:border-brand-slate transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        id="custom-file-input"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="custom-file-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <Upload size={24} className="text-brand-slate" />
                        <span className="font-semibold text-brand-slate">
                          {customFile ? customFile.name : 'Klik untuk mengunggah gambar referensi rajutan'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Format: PNG, JPG, WEBP (Maksimal 5MB)
                        </span>
                      </label>
                    </div>

                    {customFilePreview && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-2 bg-slate-50">
                        <div className="relative h-16 w-16 shrink-0">
                          <Image
                            src={customFilePreview}
                            alt="Preview"
                            fill
                            unoptimized
                            className="rounded-lg border object-cover"
                          />
                        </div>
                        <div className="text-[11px]">
                          <p className="font-semibold text-slate-800">{customFile?.name}</p>
                          <p className="text-slate-500">
                            {((customFile?.size || 0) / 1024).toFixed(1)} KB · Siap diproses tim Produksi
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy"
                  >
                    <ArrowLeft size={14} /> Kembali
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-navy"
                  >
                    Lanjut ke Rincian Ongkir <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: SHIPPING COST ================= */}
            {step === 4 && (
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">
                    Step 4 — Verifikasi Perhitungan Ongkos Kirim
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Titik acuan: SMKN 2 Buduran, Siwalanpanji, Sidoarjo.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-brand-surface/40 p-4 text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-brand-slate shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-brand-navy">Titik Acuan Pengiriman Resmi:</p>
                      <p className="text-slate-600">
                        {siteSettings.address}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Jenis Layanan:</span>
                      <p className="font-semibold text-slate-800">
                        {deliveryType === 'school'
                          ? 'Pengantaran Internal Sekolah'
                          : deliveryType === 'pickup'
                          ? 'Pengambilan Mandiri'
                          : 'Ekspedisi / Kurir Luar'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Jarak Terhitung:</span>
                      <p className="font-semibold text-slate-800">{distanceKm} km</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Aturan Tarif:</span>
                      <p className="font-semibold text-slate-800">
                        {distanceKm <= 2 ? '1-2 km: Rp0' : distanceKm <= 5 ? '3-5 km: Rp3.000' : distanceKm <= 7 ? '6-7 km: Rp4.000' : '>7 km: Rp5.000'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Total Ongkos Kirim:</span>
                      <p className="font-bold text-brand-slate text-sm">
                        {shippingCost === 0 ? 'GRATIS (Rp0)' : `Rp${shippingCost.toLocaleString('id-ID')}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy"
                  >
                    <ArrowLeft size={14} /> Kembali
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="flex items-center gap-2 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-navy"
                  >
                    Lanjut ke Metode Pembayaran <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: PAYMENT ================= */}
            {step === 5 && (
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">
                    Step 5 — Pilih Metode Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seluruh pembayaran diverifikasi oleh tim Finance ORVAXIA sebelum pesanan masuk antrean produksi.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Option 1: Cash at School */}
                  <div
                    onClick={() => setPaymentMethod('cash_school')}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === 'cash_school'
                        ? 'border-brand-slate bg-brand-surface ring-1 ring-brand-slate shadow-sm'
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
                          className="accent-brand-slate"
                        />
                        <div>
                          <p className="font-bold text-brand-navy">
                            Pembayaran Tunai di Sekolah (SMKN 2 Buduran)
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Serahkan uang tunai pas kepada perwakilan Finance atau Sales kelas saat jam istirahat.
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                        Internal SMKN 2
                      </span>
                    </div>
                  </div>

                  {/* Option 2: QRIS */}
                  <div
                    onClick={() => setPaymentMethod('qris')}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === 'qris'
                        ? 'border-brand-slate bg-brand-surface ring-1 ring-brand-slate shadow-sm'
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
                          className="accent-brand-slate"
                        />
                        <div>
                          <p className="font-bold text-brand-navy">
                            QRIS Resmi ORVAXIA COMPANY
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Mendukung GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, dan seluruh mobile banking.
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
                        Instan
                      </span>
                    </div>
                  </div>

                  {/* Option 3: Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-brand-slate bg-brand-surface ring-1 ring-brand-slate shadow-sm'
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
                          className="accent-brand-slate"
                        />
                        <div>
                          <p className="font-bold text-brand-navy">
                            Transfer Bank Resmi
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {siteSettings.paymentInfo.bankName}: {siteSettings.paymentInfo.accountNumber} a.n {siteSettings.paymentInfo.accountHolder}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                        BCA / Mandiri
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy"
                  >
                    <ArrowLeft size={14} /> Kembali
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleCompleteOrder}
                    className="flex items-center gap-2 rounded-full bg-brand-slate px-8 py-3 text-xs font-bold text-white shadow-lg hover:bg-brand-navy disabled:opacity-50"
                  >
                    {isSubmitting ? 'Memproses Pesanan...' : `Konfirmasi & Buat Pesanan (Rp${grandTotal.toLocaleString('id-ID')})`}
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 6: SUCCESS & WHATSAPP ================= */}
            {step === 6 && completedOrder && (
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 shadow-md text-center space-y-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <span className="badge-brand">Pesanan Tersimpan di Database</span>
                  <h3 className="font-serif text-2xl font-bold text-brand-navy mt-2">
                    Pre-Order Berhasil Didaftarkan!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                    Produk tas rajut Rovella <strong>Gratis (Rp0)</strong>, tagihan Anda hanya biaya ongkos kirim sebesar <strong>Rp{shippingCost.toLocaleString('id-ID')}</strong>.
                  </p>
                </div>

                {/* Reference Code Box */}
                <div className="mx-auto max-w-md rounded-2xl border-2 border-dashed border-brand-slate bg-brand-surface/60 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Kode Pesanan Unik Kamu:
                  </span>
                  <p className="font-mono text-2xl font-bold text-brand-navy tracking-wider mt-1">
                    {completedOrder.referenceCode}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold">
                    <Clock size={13} />
                    <span>Estimasi Pre-Order: 5–7 Hari Kerja</span>
                  </div>
                </div>

                {/* Real-time Order Progress Tracking Bar */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 text-left max-w-lg mx-auto space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-serif font-bold text-xs text-brand-navy flex items-center gap-1.5">
                      <Truck size={14} className="text-brand-slate" />
                      <span>Pelacakan Proses Barang:</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Status Saat Ini: Menunggu Konfirmasi
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center pt-2">
                    <div className="space-y-1">
                      <div className="h-7 w-7 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center mx-auto shadow-sm">
                        ✓
                      </div>
                      <span className="text-[9px] font-bold text-slate-800 block">Diterima</span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-7 w-7 rounded-full bg-brand-slate/20 text-brand-slate text-[11px] font-bold flex items-center justify-center mx-auto">
                        2
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 block">Dirajut</span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center mx-auto">
                        3
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 block">Dikemas</span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center mx-auto">
                        4
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 block">Diantar</span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center mx-auto">
                        5
                      </div>
                      <span className="text-[9px] font-medium text-slate-500 block">Selesai</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-200/60">
                    Proses rajut, pengemasan, dan pengantaran akan terus diperbarui oleh divisi Produksi & Sales.
                  </p>
                </div>

                {/* WhatsApp Gateway CTA */}
                <div className="pt-2 max-w-md mx-auto space-y-2.5">
                  <Link
                    href="/order-tracking"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-brand-slate px-8 py-3.5 text-xs font-bold text-brand-slate hover:bg-brand-surface"
                  >
                    <Truck size={16} /> Cek Status Pesanan Kapan Saja
                  </Link>
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-8 py-4 text-xs font-bold text-white shadow-md hover:bg-[#20ba5a] hover:shadow-lg transition-all"
                  >
                    <MessageCircle size={18} /> Konfirmasi Pesanan ke WhatsApp Admin
                  </a>
                  <p className="text-[11px] text-slate-500">
                    Kirim konfirmasi agar tim Orvaxia langsung memasukkan pesananmu ke jadwal rajut.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-center gap-4 text-xs">
                  <Link
                    href="/"
                    className="text-brand-slate font-semibold hover:underline"
                  >
                    Kembali ke Beranda
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-slate-500 hover:text-brand-navy"
                  >
                    Masuk ke Portal Internal
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="rounded-3xl border border-brand-lavender/30 bg-white p-5 shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-sm text-brand-navy border-b border-slate-100 pb-2">
                Ringkasan Pemesanan
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produk:</span>
                  <span className="font-semibold text-slate-900">
                    Rp{subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({deliveryType}):</span>
                  <span className="font-semibold text-slate-900">
                    {shippingCost === 0 ? 'Rp0 (Gratis)' : `Rp${shippingCost.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-serif text-base font-bold text-brand-navy">
                  <span>Total Tagihan:</span>
                  <span>Rp{grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-brand-slate">
                  <Clock size={12} /> Status PO: Sedang Dibuka
                </div>
                <p>Pesanan Anda diproses langsung oleh divisi Produksi, diverifikasi Finance, dan didistribusikan Sales.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MagicNavigation />
    </main>
  );
}
