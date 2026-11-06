'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { useCompanyStore } from '@/lib/store/company-store';

export default function ShopPage() {
  const { products, addToCart, cart, poPeriod } = useCompanyStore();
  const publishedProducts = products.filter((product) => product.status === 'published');

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={34} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/checkout" className="inline-flex items-center gap-2 rounded-full border border-brand-lavender/40 bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-navy transition hover:border-brand-slate">
              <ShoppingBag size={15} /> Keranjang ({cart.length})
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate transition hover:text-brand-navy">
              <ArrowLeft size={14} /> Beranda
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <span className="badge-brand">Shop</span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-brand-navy sm:text-4xl">Browse Koleksi Produk</h1>
          </div>
          <span className="rounded-full border border-brand-lavender/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand-slate">
            {publishedProducts.length} item aktif
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {publishedProducts.map((product) => {
            const isBonusCharm = product.slug === 'rovella-pocket-charm' || product.id === 'prod-rovella-charm-only';
            const price = product.basePrice + (product.sizes[0]?.priceAdjustment || 0);
            const canPurchase = Number.isFinite(price) && price > 0;
            const imageUrl = [...product.images, ...product.variants.map((variant) => variant.image || '')]
              .find((image) => image && image.includes('/storage/v1/object/public/orvaxia-images/'));
            return (
            <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-brand-lavender/30 bg-white shadow-sm">
              <div className="relative h-64 overflow-hidden bg-brand-surface">
                {imageUrl ? (
                  <Image src={imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center bg-[#EEEAF2] text-brand-slate">
                    <span className="font-serif text-6xl font-semibold">{product.name.slice(0, 1)}</span>
                    <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em]">Foto produk belum tersedia</span>
                  </div>
                )}
                {product.isPO && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    {poPeriod.status === 'open' || poPeriod.status === 'closing_soon' ? 'PO Open' : 'PO Closed'}
                  </span>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-navy">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
                </div>

                {isBonusCharm ? (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-bold text-brand-navy border border-brand-lavender/40">
                      Bonus Pre-Order (Gratis)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-brand-navy">
                      {canPurchase ? `Rp${price.toLocaleString('id-ID')}` : 'Harga belum tersedia'}
                    </span>
                    {product.isPO && <span className="text-xs text-slate-500">Pre-order</span>}
                  </div>
                )}

                {product.isPO && !isBonusCharm && (
                  <p className="text-xs text-slate-500">
                    Estimasi {poPeriod.productionEstimateDays} hari kerja
                    {poPeriod.quota > 0 ? ` · Sisa kuota ${Math.max(0, poPeriod.quota - poPeriod.orderedCount)}` : ''}
                  </p>
                )}

                <ul className="space-y-2 text-sm text-slate-600">
                  {product.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-slate" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid gap-2">
                  <Link href={`/shop/${product.slug}`} className="inline-flex w-full items-center justify-center rounded-xl border border-brand-slate px-4 py-3 text-sm font-semibold text-brand-slate transition hover:bg-brand-surface">
                    Detail {isBonusCharm ? 'Bonus' : 'Produk'}
                  </Link>
                  {isBonusCharm ? (
                    <Link
                      href="/"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-slate"
                    >
                      Bonus Bundling Pemesanan PO
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-slate disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <ShoppingBag size={16} /> {canPurchase ? 'Tambah ke Keranjang' : 'Belum dapat dipesan'}
                    </button>
                  )}
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>

      <MagicNavigation />
    </main>
  );
}
