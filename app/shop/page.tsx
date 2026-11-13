'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, ImageIcon } from 'lucide-react';
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
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-brand-slate">
              Katalog Produk
            </p>
            <h1 className="font-display text-3xl font-bold text-brand-navy sm:text-4xl">
              Koleksi Produk dan Aksesoris
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 font-normal">
              {bySlug['shop-introduction']?.body ||
                'Pilihan tas tumbler rajut buatan tangan yang dirancang fleksibel, estetik, dan fungsional.'}
            </p>
          </div>
          <span className="self-start sm:self-auto rounded-full border border-brand-lavender/30 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-2xs">
            {publishedProducts.length} produk
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
                className="overflow-hidden rounded-[2rem] border border-brand-lavender/30 bg-white shadow-xs flex flex-col justify-between"
              >
                {/* Visual Header Kartu */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4F2F7]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                      unoptimized
                    />
                  ) : (
                    /* Fallback Area Gambar Kosong Bersih */
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
                      <div className="space-y-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-white text-brand-slate shadow-2xs">
                          <ImageIcon size={22} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h4 className="font-display text-sm font-semibold text-brand-navy">
                            Foto Produk Segera Hadir
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Dalam persiapan tim produksi
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Konten Kartu */}
                <div className="space-y-4 p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-brand-slate">
                        {product.category}
                      </span>
                      {product.isPO && poPeriod.productionEstimateDays > 0 && (
                        <span className="text-xs text-slate-500">
                          Estimasi {poPeriod.productionEstimateDays} hari kerja
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-xl font-bold text-brand-navy">
                      {product.name}
                    </h2>

                    <p className="text-xs leading-5 text-slate-600 line-clamp-2 font-normal">
                      {product.description}
                    </p>

                    {/* Harga / Tag Bonus */}
                    <div className="pt-2">
                      {isBonusCharm ? (
                        <span className="inline-block rounded-full border border-brand-lavender/35 bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-navy">
                          Bonus Pelengkap Pre-Order
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-2xl font-bold text-brand-navy">
                            {canPurchase ? `Rp${price.toLocaleString('id-ID')}` : 'Harga belum ditetapkan'}
                          </span>
                          <span className="text-xs text-slate-500">/ buah</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-brand-lavender/40 bg-white py-2.5 text-xs font-semibold text-brand-navy shadow-2xs transition-all duration-150 hover:border-brand-slate hover:bg-brand-surface active:scale-95 text-center"
                    >
                      <span>Lihat Detail {isBonusCharm ? 'Bonus' : 'Produk'}</span>
                      <ArrowRight size={13} />
                    </Link>

                    {!isBonusCharm && (
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
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-brand-slate active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
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
