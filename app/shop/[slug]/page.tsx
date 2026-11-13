'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  Clock,
  ImageIcon,
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
          <h1 className="font-display text-2xl font-bold">Produk Tidak Ditemukan</h1>
          <p className="text-xs text-slate-600">
            Produk yang Anda cari tidak tersedia atau belum dipublikasikan di katalog.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-slate transition-all"
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
            <ArrowLeft size={13} /> Katalog
          </Link>
          <span>/</span>
          <span className="font-semibold text-brand-navy truncate">{product.name}</span>
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
                      onError={() => setFailedImages((prev) => [...prev, image])}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback Area Gambar Kosong Bersih */
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] border border-brand-lavender/30 bg-[#FAF8F5] p-8 text-center flex flex-col items-center justify-center">
                <div className="space-y-2 max-w-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-white text-brand-slate shadow-2xs">
                    <ImageIcon size={26} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-brand-navy">
                      Foto Produk Segera Hadir
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Dokumentasi resmi produk {product.name} sedang dipersiapkan oleh tim produksi.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kolom Informasi & Konfigurasi Pemesanan */}
          <div className="lg:col-span-6 rounded-[2.25rem] border border-brand-lavender/30 bg-white p-6 sm:p-9 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-slate">
                  {product.category}
                </span>
                {product.isPO && (
                  <span className="text-xs text-slate-500">
                    • {isPoActive ? 'Pre-Order Aktif' : 'Pre-Order Ditutup'}
                  </span>
                )}
              </div>

              <h1 className="mt-2 font-display text-3xl font-bold text-brand-navy sm:text-4xl leading-tight">
                {product.name}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600 font-normal">
                {product.description}
              </p>
            </div>

            {/* Blok Harga & Status PO */}
            <div className="border-y border-slate-100 py-4">
              {isBonusCharm ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center rounded-full border border-brand-lavender/40 bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-navy">
                    Bonus Pelengkap Pre-Order
                  </span>
                  <p className="text-xs text-slate-600 pt-1 font-normal">
                    Keychain pouch rajut lipat ini disertakan sebagai pelengkap untuk setiap pemesan tas tumbler Rovella.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <span className="font-display text-3xl font-bold text-brand-navy">
                      {canPurchase ? `Rp${price.toLocaleString('id-ID')}` : 'Harga belum ditetapkan'}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5">/ buah</span>
                  </div>
                  {product.isPO && poPeriod.productionEstimateDays > 0 && (
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
                <label className="block text-xs font-semibold text-brand-navy">
                  Pilihan Model Varian
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`rounded-2xl border px-3.5 py-2 text-xs font-medium transition-all ${
                        selectedVariantIndex === idx
                          ? 'border-brand-slate bg-brand-surface text-brand-navy ring-1 ring-brand-slate shadow-xs font-semibold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Ukuran Botol Custom */}
            {!isBonusCharm && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-brand-navy">
                    Ukuran Botol Custom
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Tanpa biaya tambahan
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tinggi 21 cm, diameter 7.5 cm (atau merk botol)"
                  value={customBottleDimensions}
                  onChange={(e) => setCustomBottleDimensions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 font-normal">
                  Ukuran tas rajut disesuaikan dengan tinggi dan diameter botol yang Anda gunakan.
                </p>
              </div>
            )}

            {/* Tombol Pemesanan */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!canPurchase}
                onClick={() =>
                  addToCart({
                    id: `${product.id}-${Date.now()}`,
                    productId: product.id,
                    productName: product.name,
                    variantName: selectedVariant?.name ?? 'Default',
                    sizeName: customBottleDimensions || selectedSize?.name || 'Standard',
                    quantity: 1,
                    unitPrice: price,
                    subtotal: price,
                    customizationNotes: `Ukuran Botol: ${customBottleDimensions}`,
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy py-3.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-brand-slate active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingBag size={15} />
                <span>{canPurchase ? 'Tambah ke Keranjang Belanja' : 'Belum Dapat Dipesan'}</span>
              </button>
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
