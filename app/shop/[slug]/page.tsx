'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Clock,
  Ruler,
  Layers,
  Gift,
  ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';
import { Footer } from '@/components/navigation/Footer';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { useCompanyStore } from '@/lib/store/company-store';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { products, addToCart, poPeriod } = useCompanyStore();
  const product = products.find((item) => item.slug === params.slug && item.status === 'published');
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [customBottleDimensions, setCustomBottleDimensions] = useState('Tinggi 20 cm, Diameter 7.5 cm (Standard 500-600 ml)');

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <div className="max-w-md w-full rounded-[2rem] border border-brand-lavender/30 bg-white p-8 text-center shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-slate">
            <Sparkles size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold">Produk Tidak Ditemukan</h1>
          <p className="text-xs text-slate-600">
            Produk yang Anda cari tidak tersedia atau belum dipublikasikan di katalog.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-slate transition-all"
          >
            <ArrowLeft size={14} /> Kembali ke Katalog
          </Link>
        </div>
      </main>
    );
  }

  const isBonusCharm = product.slug === 'rovella-pocket-charm' || product.id === 'prod-rovella-charm-only';
  const selectedSize = product.sizes[selectedSizeIndex] || product.sizes[0];
  const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const price = product.basePrice + (selectedSize?.priceAdjustment || 0);
  const canPurchase = Number.isFinite(price) && price > 0;
  const isPoActive = poPeriod.status === 'open' || poPeriod.status === 'closing_soon';

  const images = [...product.images, ...product.variants.map((variant) => variant.image || '')]
    .filter(
      (image) =>
        image &&
        image.includes('/storage/v1/object/public/orvaxia-images/') &&
        !failedImages.includes(image),
    );

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy pb-24 md:pb-0">
      {/* 1. Navigasi Shell Desktop & Mobile */}
      <TopNav />

      {/* 2. Konten Detail Produk */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 space-y-8">
        {/* Breadcrumb navigasi */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/shop" className="hover:text-brand-navy transition-colors flex items-center gap-1 font-semibold">
            <ArrowLeft size={13} /> Katalog Shop
          </Link>
          <span>/</span>
          <span className="font-bold text-brand-navy truncate">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Kolom Galeri Visual Produk */}
          <div className="lg:col-span-6 space-y-4">
            {images.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {images.slice(0, 4).map((image, idx) => (
                  <div
                    key={`${image}-${idx}`}
                    className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-brand-lavender/30 bg-[#F4F2F7] shadow-xs"
                  >
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      unoptimized
                      className="object-cover"
                      onError={() => setFailedImages((current) => [...current, image])}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback Area Gambar Kosong Bersih (Tanpa Monogram, Tanpa Gambar AI/Dummy) */
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] border border-brand-lavender/35 bg-[#FAF8F5] shadow-xs flex flex-col items-center justify-between p-8 text-center">
                <div className="w-full flex justify-between items-center">
                  <span className="badge-brand">{product.category}</span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-brand-slate uppercase tracking-wider border border-brand-lavender/30">
                    Foto Resmi
                  </span>
                </div>

                <div className="space-y-3 my-auto max-w-xs">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-brand-lavender/30 bg-white text-brand-slate shadow-xs">
                    <ImageIcon size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-brand-navy">
                      Foto Produk Segera Hadir
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Dokumentasi resmi produk {product.name} sedang dipersiapkan oleh tim produksi SMKN 2 Buduran.
                    </p>
                  </div>
                </div>

                {/* Swatch Palet Brand */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="h-4 w-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#606C8D' }} title="Bru Slate" />
                  <span className="h-4 w-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#A99AB3' }} title="Lavender" />
                  <span className="h-4 w-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#FDF5AE' }} title="Pastel Yellow" />
                  <span className="h-4 w-4 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#D0A9A0' }} title="Dusty Peach" />
                </div>
              </div>
            )}
          </div>

          {/* Kolom Informasi & Konfigurasi Pemesanan */}
          <div className="lg:col-span-6 rounded-[2.25rem] border border-brand-lavender/30 bg-white p-6 sm:p-9 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge-brand">Karya SMKN 2 Buduran</span>
                {product.isPO && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    isPoActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isPoActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {isPoActive ? 'Pre-Order Dibuka' : 'Pre-Order Ditutup'}
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-display text-3xl font-extrabold text-brand-navy sm:text-4xl leading-tight">
                {product.name}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.description}
              </p>
            </div>

            {/* Blok Tiga Klaim Resmi (Khusus Produk ROVELLA) */}
            {!isBonusCharm && (
              <div className="rounded-2xl border border-brand-lavender/30 bg-brand-surface/50 p-4 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block">
                  Tiga Nilai Utama ROVELLA
                </span>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-xs text-brand-navy">
                    <Ruler size={14} className="text-brand-slate shrink-0" />
                    <span>Custom ukuran botol <strong>GRATIS</strong> (bebas sesuaikan diameter & tinggi)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-navy">
                    <Layers size={14} className="text-brand-slate shrink-0" />
                    <span>Inovasi desain <strong>fungsi 3-in-1</strong> sesuai konsep resmi ROVELLA</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-navy">
                    <Gift size={14} className="text-brand-slate shrink-0" />
                    <span>Bonus gantungan kunci mini <strong>GRATIS</strong> di setiap pesanan</span>
                  </div>
                </div>
              </div>
            )}

            {/* Blok Harga & Status PO */}
            <div className="border-y border-slate-100 py-4">
              {isBonusCharm ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/40 bg-brand-surface px-3 py-1 text-xs font-bold text-brand-navy">
                    <Gift size={13} className="text-brand-slate" />
                    Bonus Eksklusif Pre-Order (Gratis)
                  </span>
                  <p className="text-xs text-slate-600 pt-1">
                    Keychain pouch rajut lipat ini disertakan gratis sebagai bonus spesial untuk setiap pemesan tas tumbler ROVELLA.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <span className="font-display text-3xl font-extrabold text-brand-navy">
                      {canPurchase ? `Rp${price.toLocaleString('id-ID')}` : 'Harga belum ditetapkan'}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5">/ pcs</span>
                  </div>
                  {product.isPO && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock size={13} className="text-brand-slate" />
                      <span>Estimasi {poPeriod.productionEstimateDays} hari kerja</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pilihan Model Varian */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Pilihan Model Varian
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                        selectedVariantIndex === idx
                          ? 'border-brand-slate bg-brand-surface text-brand-navy ring-2 ring-brand-slate/40 shadow-xs font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pilihan Ukuran & Input Custom Ukuran Botol */}
            {!isBonusCharm && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                    Ukuran & Botol Minum
                  </label>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    Custom Gratis
                  </span>
                </div>

                {product.sizes.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, idx) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`rounded-2xl border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          selectedSizeIndex === idx
                            ? 'border-brand-slate bg-brand-surface text-brand-navy ring-2 ring-brand-slate/40 shadow-xs font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {size.name} · {size.capacity}
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tinggi 21 cm, diameter 7.5 cm (atau merk botol)"
                    value={customBottleDimensions}
                    onChange={(e) => setCustomBottleDimensions(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Bebas sesuaikan dimensi rajutan dengan botol harianmu tanpa biaya tambahan.
                  </p>
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="pt-2">
              {isBonusCharm ? (
                <Link
                  href="/shop"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-brand-sm transition-all duration-200 hover:bg-brand-slate active:scale-95 text-center"
                >
                  <span>Pesan Tas Tumbler ROVELLA untuk Mendapatkan Bonus Ini</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={!canPurchase}
                  onClick={() =>
                    addToCart({
                      id: `${product.id}-${Date.now()}`,
                      productId: product.id,
                      productName: product.name,
                      variantName: selectedVariant?.name || 'Default',
                      sizeName: customBottleDimensions || selectedSize?.name || 'Standard',
                      quantity: 1,
                      unitPrice: price,
                      subtotal: price,
                      customizationNotes: `Ukuran Botol: ${customBottleDimensions}`,
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-brand-sm transition-all duration-200 hover:bg-brand-slate active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 text-center"
                >
                  <ShoppingBag size={16} />
                  <span>{canPurchase ? 'Tambah ke Keranjang' : 'Belum Dapat Dipesan'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Shell & Mobile Dock */}
      <Footer />
      <MagicNavigation />
    </main>
  );
}
