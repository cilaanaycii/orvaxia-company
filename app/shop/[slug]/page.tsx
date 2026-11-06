'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';
import { useCompanyStore } from '@/lib/store/company-store';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const { products, addToCart, poPeriod } = useCompanyStore();
  const product = products.find((item) => item.slug === params.slug && item.status === 'published');
  const [failedImages, setFailedImages] = useState<string[]>([]);

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="font-serif text-2xl font-bold">Produk tidak ditemukan</h1>
          <Link href="/shop" className="mt-4 inline-flex text-sm font-semibold text-brand-slate underline">Kembali ke Shop</Link>
        </div>
      </main>
    );
  }

  const price = product.basePrice + (product.sizes[0]?.priceAdjustment || 0);
  const canPurchase = Number.isFinite(price) && price > 0;
  const images = [...product.images, ...product.variants.map((variant) => variant.image || '')]
    .filter(
      (image) =>
        image &&
        image.includes('/storage/v1/object/public/orvaxia-images/') &&
        !failedImages.includes(image),
    );

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <TopNav />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-10">
        <section>
          {images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {images.slice(0, 4).map((image) => (
                <div key={image} className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-brand-surface">
                  <Image src={image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 45vw" unoptimized className="object-cover" onError={() => setFailedImages((current) => [...current, image])} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-[#EEEAF2] font-serif text-8xl font-semibold text-brand-slate">
              {product.name.slice(0, 1)}
            </div>
          )}
        </section>

        <section className="self-start rounded-3xl border border-brand-lavender/30 bg-white p-6 sm:p-8">
          <span className="badge-brand">{product.category}</span>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">{product.description}</p>
          <div className="mt-6 border-y border-slate-100 py-5">
            {product.slug === 'rovella-pocket-charm' || product.id === 'prod-rovella-charm-only' ? (
              <div>
                <span className="rounded-full bg-brand-surface px-3.5 py-1.5 text-sm font-bold text-brand-navy border border-brand-lavender/40">
                  Bonus Eksklusif Pre-Order (Gratis)
                </span>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Keychain pouch rajut lipat ini disertakan gratis sebagai bonus spesial untuk setiap pemesanan tas tumbler Rovella.
                </p>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{canPurchase ? `Rp${price.toLocaleString('id-ID')}` : 'Harga belum tersedia'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {product.isPO
                    ? `${poPeriod.status === 'open' || poPeriod.status === 'closing_soon' ? 'Pre-order dibuka' : 'Pre-order tidak aktif'} · Estimasi ${poPeriod.productionEstimateDays} hari kerja.`
                    : 'Produk tersedia'}
                </p>
              </>
            )}
          </div>
          {product.features.length > 0 && (
            <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
              {product.features.map((feature) => <li key={feature} className="flex gap-2"><span className="text-brand-slate">•</span>{feature}</li>)}
            </ul>
          )}
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-slate">Varian</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <span key={variant.id} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600">{variant.name}</span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-slate">Ukuran</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span key={size.id} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600">{size.name} · {size.capacity}</span>
                ))}
              </div>
            </div>
          </div>
          {product.slug === 'rovella-pocket-charm' || product.id === 'prod-rovella-charm-only' ? (
            <Link
              href="/"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white hover:bg-brand-slate transition-colors"
            >
              Pesan Rovella untuk Mendapatkan Bonus Ini
            </Link>
          ) : (
            <button
              type="button"
              disabled={!canPurchase}
              onClick={() => addToCart({
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                productName: product.name,
                variantName: product.variants[0]?.name || 'Default',
                sizeName: product.sizes[0]?.name || 'Standard',
                unitPrice: price,
                quantity: 1,
                subtotal: price,
              })}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white hover:bg-brand-slate disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShoppingBag size={16} /> {canPurchase ? 'Tambah ke Keranjang' : 'Checkout belum tersedia'}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
