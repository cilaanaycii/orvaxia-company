'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Sparkles, ArrowRight, ImageIcon, CheckCircle2, Gift, Layers, Ruler } from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';
import { Footer } from '@/components/navigation/Footer';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { POStatusBanner } from '@/components/shop/POStatusBanner';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePublicContent } from '@/lib/content/use-public-content';

export default function ShopPage() {
  const { products, addToCart, poPeriod } = useCompanyStore();
  const { bySlug } = usePublicContent('shop');
  const publishedProducts = products.filter((product) => product.status === 'published');

  const isPoActive = poPeriod.status === 'open' || poPeriod.status === 'closing_soon';

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy pb-24 md:pb-0">
      {/* 1. Header Navigasi Shell */}
      <TopNav />

      {/* 2. Banner & Katalog Section */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 space-y-8">
        {/* Status Periode Pre-Order Terkini */}
        <POStatusBanner />

        {/* Header Judul Katalog */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-lavender/25 pb-6">
          <div className="space-y-2">
            <span className="badge-brand">
              <Sparkles size={12} className="text-brand-slate" />
              Katalog Resmi ORVAXIA
            </span>
            <h1 className="font-display text-3xl font-extrabold text-brand-navy sm:text-4xl">
              Koleksi Produk & Aksesoris
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              {bySlug['shop-introduction']?.body ||
                'Pilihan tas tumbler rajut buatan tangan khas SMKN 2 Buduran yang dirancang fleksibel, estetik, dan fungsional.'}
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full border border-brand-lavender/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-slate shadow-xs">
            {publishedProducts.length} produk aktif
          </span>
        </div>

        {/* Grid Kartu Produk */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {publishedProducts.map((product) => {
            const isBonusCharm = product.slug === 'rovella-pocket-charm' || product.id === 'prod-rovella-charm-only';
            const price = product.basePrice + (product.sizes[0]?.priceAdjustment || 0);
            const canPurchase = Number.isFinite(price) && price > 0;
            const imageUrl = [...product.images, ...product.variants.map((variant) => variant.image || '')]
              .find((image) => image && image.includes('/storage/v1/object/public/orvaxia-images/'));

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-[2rem] border border-brand-lavender/30 bg-white shadow-xs card-interactive flex flex-col justify-between"
              >
                {/* Visual Header Kartu */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4F2F7]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    /* Fallback Area Gambar Kosong Bersih (Tanpa Monogram, Tanpa AI/Dummy) */
                    <div className="flex h-full w-full flex-col items-center justify-between p-6 text-center bg-[#FAF8F5]">
                      <div className="w-full flex justify-end">
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-brand-slate uppercase tracking-wider border border-brand-lavender/30">
                          Foto Resmi
                        </span>
                      </div>

                      <div className="space-y-2 my-auto">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-white text-brand-slate shadow-2xs">
                          <ImageIcon size={22} strokeWidth={1.75} />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-bold text-brand-navy">
                            Foto Produk Segera Hadir
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Dalam persiapan tim produksi
                          </p>
                        </div>
                      </div>

                      {/* Swatch Palet Brand */}
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="h-3 w-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#606C8D' }} />
                        <span className="h-3 w-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#A99AB3' }} />
                        <span className="h-3 w-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#FDF5AE' }} />
                        <span className="h-3 w-3 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#D0A9A0' }} />
                      </div>
                    </div>
                  )}

                  {/* Badge Status PO */}
                  {product.isPO && (
                    <span className="absolute left-3.5 top-3.5 rounded-full border border-white/60 bg-brand-navy/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
                      {isPoActive ? 'Pre-Order Aktif' : 'PO Ditutup'}
                    </span>
                  )}
                </div>

                {/* Konten Kartu */}
                <div className="space-y-4 p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">
                        {product.category}
                      </span>
                      {product.isPO && (
                        <span className="text-[11px] font-semibold text-slate-500">
                          Estimasi {poPeriod.productionEstimateDays} hari
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-xl font-bold text-brand-navy sm:text-2xl">
                      {product.name}
                    </h2>

                    <p className="text-xs leading-5 text-slate-600 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Tiga Klaim Resmi untuk Produk Utama Rovella */}
                    {!isBonusCharm && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Ruler size={13} className="text-brand-slate shrink-0" />
                          <span>Custom ukuran botol <strong>GRATIS</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Layers size={13} className="text-brand-slate shrink-0" />
                          <span>Konsep inovasi <strong>fungsi 3-in-1</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Gift size={13} className="text-brand-slate shrink-0" />
                          <span>Bonus gantungan kunci mini <strong>GRATIS</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Harga / Tag Bonus */}
                    <div className="pt-2">
                      {isBonusCharm ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/40 bg-brand-surface px-3 py-1 text-xs font-bold text-brand-navy">
                          <Gift size={13} className="text-brand-slate" />
                          Bonus Eksklusif PO (Gratis)
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-2xl font-extrabold text-brand-navy">
                            {canPurchase ? `Rp${price.toLocaleString('id-ID')}` : 'Harga belum ditetapkan'}
                          </span>
                          <span className="text-xs text-slate-500">/ pcs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-lavender/40 bg-white py-2.5 text-xs font-bold text-brand-navy shadow-2xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface active:scale-95 text-center"
                    >
                      <span>Lihat Detail {isBonusCharm ? 'Bonus' : 'Produk'}</span>
                      <ArrowRight size={13} />
                    </Link>

                    {isBonusCharm ? (
                      <Link
                        href="/"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-2.5 text-xs font-bold text-white shadow-brand-sm transition-all duration-200 hover:bg-brand-slate active:scale-95 text-center"
                      >
                        <span>Bonus Bundling Pemesanan PO</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={!canPurchase}
                        title={!canPurchase ? 'Harga produk belum ditetapkan' : undefined}
                        onClick={() =>
                          addToCart({
                            id: `${product.id}-${Date.now()}`,
                            productId: product.id,
                            productName: product.name,
                            variantName: product.variants[0]?.name ?? 'Default',
                            sizeName: product.sizes[0]?.name ?? 'Standard',
                            quantity: 1,
                            unitPrice: price,
                            subtotal: price,
                          })
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-brand-sm transition-all duration-200 hover:bg-brand-slate active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <ShoppingBag size={14} />
                        <span>{canPurchase ? 'Tambah ke Keranjang' : 'Belum Dapat Dipesan'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* 3. Footer Shell & Mobile Dock */}
      <Footer />
      <MagicNavigation />
    </main>
  );
}
