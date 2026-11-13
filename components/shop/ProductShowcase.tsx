'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCompanyStore } from '@/lib/store/company-store';
import { ProductVariant } from '@/lib/types';
import { ShoppingBag, ArrowRight, ImageIcon, Check } from 'lucide-react';
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
      image: '',
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
    <div className="w-full rounded-[2rem] border border-brand-lavender/30 bg-white p-5 shadow-xs sm:p-7 lg:p-8">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Kolom Visual Produk */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex aspect-square w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-brand-lavender/30 bg-[#FAF8F5]">
            {imageSource && !imageFailed ? (
              <Image
                src={imageSource}
                alt={selectedVariant.name}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="w-full h-full object-cover transition-all duration-300"
                onError={() => setFailedImageSource(imageSource)}
              />
            ) : (
              /* Fallback Area Gambar Kosong Bersih (Tanpa Monogram, Tanpa Gambar AI, Tanpa Dummy) */
              <div className="flex h-full w-full flex-col items-center justify-between p-6 text-center bg-[#FAF8F5]">
                <div className="w-full flex justify-end">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-brand-slate uppercase tracking-wider border border-brand-lavender/30">
                    Foto Resmi
                  </span>
                </div>

                <div className="space-y-2.5 my-auto">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-white text-brand-slate shadow-2xs">
                    <ImageIcon size={22} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-brand-navy">
                      Foto Model Segera Hadir
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedVariant?.name || 'ROVELLA'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="h-3.5 w-3.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#606C8D' }} />
                  <span className="h-3.5 w-3.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#A99AB3' }} />
                  <span className="h-3.5 w-3.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#FDF5AE' }} />
                  <span className="h-3.5 w-3.5 rounded-full border border-white shadow-2xs" style={{ backgroundColor: '#D0A9A0' }} />
                </div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-xs font-semibold text-brand-navy shadow-xs backdrop-blur-xs">
              {selectedVariant?.name}
            </div>
          </div>
        </div>

        {/* Kolom Informasi & Konfigurasi Produk */}
        <div className="flex flex-col justify-between space-y-5 lg:col-span-7">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-brand">Karya SMKN 2 Buduran</span>
              <span className="rounded-full border border-brand-peach/40 bg-brand-peach/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-navy">
                Fungsi 3-in-1
              </span>
            </div>

            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              {rovella.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Tas tumbler rajut buatan tangan dengan konsep inovatif untuk melengkapi keseharianmu.
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-brand-navy">
                {canPurchase ? `Rp${productPrice.toLocaleString('id-ID')}` : 'Harga belum tersedia'}
              </span>
              <span className="text-xs text-slate-500">
                {canPurchase ? 'Harga per item' : 'Checkout aktif setelah harga ditetapkan'}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4 text-sm">
            {/* Pilihan Desain / Model Varian */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Pilih Model Rajutan
                </label>
                <span className="text-xs text-slate-500">{rovella.variants.length} pilihan</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {(rovella.variants || []).map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`shrink-0 flex items-center gap-2 rounded-2xl p-2 border transition-all text-left ${
                      selectedVariant?.id === variant.id
                        ? 'border-brand-slate bg-brand-surface text-brand-navy ring-2 ring-brand-slate/40 shadow-xs font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {variant.image && variant.image.includes('/storage/v1/object/public/orvaxia-images/') ? (
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        width={36}
                        height={36}
                        unoptimized
                        sizes="36px"
                        className="h-9 w-9 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <span
                        className="h-8 w-8 rounded-xl border border-black/10 shadow-inner flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: variant.colorHex || '#606C8D' }}
                      >
                        {selectedVariant?.id === variant.id ? <Check size={12} /> : '•'}
                      </span>
                    )}
                    <span className="pr-2 text-xs font-semibold leading-tight">{variant.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Ukuran Botol (GRATIS) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Custom Ukuran Botol
                </label>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  GRATIS
                </span>
              </div>
              <input
                type="text"
                required
                placeholder="Contoh: Tinggi 21 cm, diameter 7.5 cm (atau merk botol)"
                value={customBottleDimensions}
                onChange={(e) => setCustomBottleDimensions(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[11px] leading-4 text-slate-500">
                Pembeli bebas menyesuaikan ukuran tas rajut dengan diameter & tinggi botol tanpa biaya tambahan.
              </p>
            </div>

            {/* Pilihan Charm */}
            {rovella.customCharms && rovella.customCharms.length > 0 && (
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Pilihan Gantungan / Charm
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                  {rovella.customCharms.map((charm) => (
                    <button
                      key={charm}
                      type="button"
                      onClick={() => setSelectedCharm(charm)}
                      className={`rounded-xl px-3 py-1.5 border transition-all text-left text-xs ${
                        selectedCharm === charm
                          ? 'border-brand-slate bg-brand-surface text-brand-navy ring-2 ring-brand-slate/40 shadow-xs font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {charm}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Jumlah & Catatan */}
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy">
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
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Request inisial atau catatan ukuran khusus"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-brand-slate focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
            <button
              onClick={handleDirectCheckout}
              disabled={!canPurchase}
              title={!canPurchase ? 'Harga produk belum ditetapkan' : undefined}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-3 text-xs font-bold uppercase tracking-wider text-white shadow-brand-sm transition-all duration-200 hover:bg-brand-slate active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShoppingBag size={16} />
              <span>Lanjutkan Pemesanan</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!canPurchase}
              title={!canPurchase ? 'Harga produk belum ditetapkan' : undefined}
              className="min-h-11 w-full rounded-full border border-brand-lavender/40 bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-brand-navy shadow-xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface active:scale-95 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              <span>Tambah ke Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
