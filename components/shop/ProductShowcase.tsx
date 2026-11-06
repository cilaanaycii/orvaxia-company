'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCompanyStore } from '@/lib/store/company-store';
import { ProductVariant } from '@/lib/types';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProductShowcase() {
  const router = useRouter();
  const { products, addToCart } = useCompanyStore();
  const rovella = products[0]; // Flagship product

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    rovella?.variants[0] || {
      id: 'var-default',
      name: 'Pastel Blossom',
      colorHex: '#F6B6A5',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
      description: 'Model rajutan motif bunga pastel pink manis dengan tali gantung serasi',
    }
  );

  // Ukuran botol custom (Tinggi & Lebar/Diameter) - GRATIS!
  const [customBottleDimensions, setCustomBottleDimensions] = useState('Tinggi 20 cm, Diameter 7.5 cm (Standard 500-600 ml)');
  const [selectedCharm, setSelectedCharm] = useState<string>(
    rovella?.customCharms[0] || 'Tanpa Charm Tambahan'
  );
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [failedImageSource, setFailedImageSource] = useState<string | null>(null);

  useEffect(() => {
    if (!rovella?.variants.length) return;
    setSelectedVariant((current) =>
      rovella.variants.find((variant) => variant.id === current.id) || rovella.variants[0]
    );
  }, [rovella?.variants]);

  if (!rovella) return null;

  const productPrice = rovella.basePrice + (rovella.sizes[0]?.priceAdjustment || 0);
  const imageSource = [selectedVariant?.image, ...rovella.images].find(
    (image) => image && image.includes('/storage/v1/object/public/orvaxia-images/'),
  );
  const imageFailed = imageSource !== undefined && failedImageSource === imageSource;
  const canPurchase = Number.isFinite(productPrice) && productPrice > 0;

  const handleAddToCart = () => {
    if (!canPurchase) {
      return;
    }
    addToCart({
      id: `cart-${Date.now()}`,
      productId: rovella.id,
      productName: rovella.name,
      variantName: selectedVariant.name,
      sizeName: customBottleDimensions || 'Custom Botol Pelanggan',
      customCharm: selectedCharm,
      unitPrice: productPrice,
      quantity,
      subtotal: productPrice * quantity,
      customizationNotes: `Ukuran Botol: ${customBottleDimensions}${customNotes ? ` | Catatan: ${customNotes}` : ''}`,
    });
  };

  const handleDirectCheckout = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="w-full rounded-2xl border border-brand-lavender/30 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex aspect-square w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-lavender/30 bg-brand-surface sm:rounded-3xl">
            {imageSource && !imageFailed ? (
              <Image
                src={imageSource}
                alt={selectedVariant.name}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="w-full h-full object-cover rounded-2xl transition-all duration-300"
                onError={() => setFailedImageSource(imageSource)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-[#EEEAF2] text-brand-slate" aria-label="Foto produk belum tersedia">
                <span className="font-serif text-7xl font-semibold">R</span>
                <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em]">Rovella by ORVAXIA</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-navy sm:bottom-4 sm:left-4">
              {selectedVariant?.name}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-5 lg:col-span-7">
          <div>
            <h3 className="mt-1 font-serif text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              {rovella.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Tas tumbler rajut yang bisa dilipat menjadi pouch kecil.
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-xl font-bold text-brand-navy">
                {canPurchase ? `Rp${productPrice.toLocaleString('id-ID')}` : 'Harga belum tersedia'}
              </span>
              <span className="text-xs text-slate-500">{canPurchase ? 'Harga produk' : 'Checkout tersedia setelah harga ditetapkan'}</span>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4 text-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Pilih desain
                </label>
                <span className="text-xs text-slate-500">{rovella.variants.length} pilihan</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {(rovella.variants || []).map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`shrink-0 flex items-center gap-2.5 rounded-2xl p-2 border transition-all text-left ${
                      selectedVariant?.id === variant.id
                        ? 'border-brand-slate bg-brand-surface/80 text-brand-navy ring-2 ring-brand-slate/40 shadow-xs font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {variant.image && !variant.image.includes('unsplash.com') ? (
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        width={40}
                        height={40}
                        unoptimized
                        sizes="40px"
                        className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <span
                        className="h-9 w-9 rounded-xl border border-black/10 shadow-inner flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: variant.colorHex }}
                      >
                        ✓
                      </span>
                    )}
                    <p className="pr-2 text-xs font-semibold leading-tight">{variant.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800">
                Ukuran botol
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Tinggi 21 cm, diameter 7.5 cm (atau sebutkan merk botol)"
                value={customBottleDimensions}
                onChange={(e) => setCustomBottleDimensions(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Rajutan disesuaikan dengan ukuran botolmu.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Charm
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                {(rovella.customCharms || []).map((charm) => (
                  <button
                    key={charm}
                    type="button"
                    onClick={() => setSelectedCharm(charm)}
                    className={`rounded-xl px-3 py-1.5 border transition-all text-left text-xs ${
                      selectedCharm === charm
                        ? 'border-brand-slate bg-brand-surface/80 text-brand-navy ring-2 ring-brand-slate/40 shadow-xs font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {charm}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Jumlah
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center text-slate-700"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-xs">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="h-8 w-8 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="sm:col-span-8">
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Catatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Request gantungan inisial huruf 'N'"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-brand-slate focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={handleDirectCheckout}
              disabled={!canPurchase}
              title={!canPurchase ? 'Harga produk belum ditetapkan' : undefined}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-slate disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShoppingBag size={17} />
              <span>Lanjutkan pemesanan</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!canPurchase}
              title={!canPurchase ? 'Harga produk belum ditetapkan' : undefined}
              className="min-h-10 w-full rounded-xl border border-brand-slate py-2.5 text-sm font-semibold text-brand-slate transition-colors hover:bg-brand-surface disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              <span>Tambah ke keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
