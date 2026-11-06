'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { useCompanyStore } from '@/lib/store/company-store';

export default function ShopPage() {
  const { products, addToCart, cart } = useCompanyStore();

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
            {products.length} item aktif
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-brand-lavender/30 bg-white shadow-sm">
              <div className="relative h-64 overflow-hidden bg-brand-surface">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-brand-slate">R</div>
                )}
                {product.isPO && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    PO
                  </span>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-brand-navy">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{product.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-brand-navy">Rp0</span>
                  <span className="text-xs text-slate-500">Harga produk PO</span>
                </div>

                <ul className="space-y-2 text-sm text-slate-600">
                  {product.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-slate" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() =>
                    addToCart({
                      id: `${product.id}-${Date.now()}`,
                      productId: product.id,
                      productName: product.name,
                      variantName: product.variants[0]?.name ?? 'Default',
                      sizeName: product.sizes[0]?.name ?? 'Standard',
                      quantity: 1,
                      unitPrice: 0,
                      subtotal: 0,
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-slate"
                >
                  <ShoppingBag size={16} /> Tambah ke Keranjang
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <MagicNavigation />
    </main>
  );
}
