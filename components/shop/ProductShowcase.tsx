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

  // Ukuran botol custom (Tinggi & Lebar/Diameter)
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
              /* Fallback Area Gambar Kosong Bersih */
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
                <div className="space-y-2 max-w-xs">
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

            <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-xs font-medium text-brand-navy shadow-xs backdrop-blur-xs">
              {selectedVariant?.name}
            </div>
          </div>
        </div>

        {/* Kolom Informasi & Konfigurasi Produk */}
        <div className="flex flex-col justify-between space-y-5 lg:col-span-7">
          <div>
            <p className="text-xs font-semibold text-brand-slate">
              Produk Pilihan
            </p>

            <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              {rovella.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 font-normal">
              Tas tumbler rajut buatan tangan dengan konsep inovatif untuk melengkapi keseharianmu.
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-brand-navy">
                {canPurchase ? `Rp${productPrice.toLocaleString('id-ID')}` : 'Harga belum tersedia'}
              </span>
              <span className="text-xs text-slate-500">
                {canPurchase ? 'Harga per item' : 'Pemesanan aktif setelah harga ditetapkan'}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-4 text-sm">
            {/* Pilihan Desain / Model Varian */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-brand-navy">
                  Pilih Model Rajutan
                </label>
                <span className="text-xs text-slate-400">{rovella.variants.length} pilihan</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {(rovella.variants || []).map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`shrink-0 flex items-center gap-2 rounded-2xl p-2 border transition-all text-left ${
                      selectedVariant?.id === variant.id
                        ? 'border-brand-slate bg-brand-surface text-brand-navy ring-1 ring-brand-slate shadow-xs font-semibold'
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
                    <span className="pr-2 text-xs font-medium leading-tight">{variant.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Ukuran Botol */}
            <div>
              <div className="flex items-center justify-between mb-1">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[11px] leading-4 text-slate-500 font-normal">
                Ukuran tas rajut dapat disesuaikan dengan dimensi botol minum Anda.
              </p>
            </div>

            {/* Pilihan Charm */}
            {rovella.customCharms && rovella.customCharms.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1.5">
                  Aksesoris Tambahan
                </label>
                <select
                  value={selectedCharm}
                  onChange={(e) => setSelectedCharm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
                >
                  {rovella.customCharms.map((charm) => (
                    <option key={charm} value={charm}>
                      {charm}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Catatan Khusus */}
            <div>
              <label className="block text-xs font-semibold text-brand-navy mb-1">
                Catatan Pesanan (opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Warna tali ingin dibuat lebih panjang"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
              <button
                type="button"
                disabled={!canPurchase}
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-brand-lavender/40 bg-white py-3 text-xs font-semibold text-brand-navy shadow-xs transition-all duration-150 hover:border-brand-slate hover:bg-brand-surface active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <ShoppingBag size={14} />
                <span>Tambah ke Keranjang</span>
              </button>

              <button
                type="button"
                disabled={!canPurchase}
                onClick={handleDirectCheckout}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy py-3 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-brand-slate active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <span>Beli Sekarang</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
