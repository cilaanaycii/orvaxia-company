'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { ProductVariant } from '@/lib/types';
import { ShoppingBag, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
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

  if (!rovella) return null;

  // Semua gratis! Yang berbayar hanya ongkir saat pengiriman.
  const unitPrice = 0;
  const totalPrice = 0;

  const handleAddToCart = () => {
    addToCart({
      id: `cart-${Date.now()}`,
      productId: rovella.id,
      productName: rovella.name,
      variantName: selectedVariant.name,
      sizeName: customBottleDimensions || 'Custom Botol Pelanggan',
      customCharm: selectedCharm,
      unitPrice: 0,
      quantity,
      subtotal: 0,
      customizationNotes: `Ukuran Botol: ${customBottleDimensions}${customNotes ? ` | Catatan: ${customNotes}` : ''}`,
    });
  };

  const handleDirectCheckout = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="w-full rounded-3xl border border-brand-lavender/30 bg-white/95 p-6 md:p-10 shadow-sm backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Showcase: Gambar Model Rajutan yang Dipilih */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-square max-w-md rounded-3xl overflow-hidden border border-brand-lavender/40 shadow-sm flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-surface via-white to-brand-cream/80">
            {/* Foto Varian Gambar Nyata dari Marketing */}
            {selectedVariant?.image ? (
              <img
                src={selectedVariant.image}
                alt={selectedVariant.name}
                className="w-full h-full object-cover rounded-2xl transition-all duration-300"
              />
            ) : (
              <div
                className="w-36 h-48 rounded-[2rem] border-4 border-white shadow-xl flex flex-col items-center justify-between p-4"
                style={{
                  backgroundColor: selectedVariant?.colorHex || '#A99AB3',
                  boxShadow: `0 16px 32px -8px ${selectedVariant?.colorHex}88`,
                }}
              >
                <div className="w-full h-full border border-white/40 rounded-2xl p-2 flex flex-col justify-between text-white/90">
                  <span className="text-[10px] font-semibold tracking-widest uppercase">ORVAXIA</span>
                  <div className="text-center">
                    <span className="text-xs font-serif font-bold text-white drop-shadow">Rovella</span>
                    <span className="text-[9px] text-white/80 font-medium block">3-in-1 Knit</span>
                  </div>
                  <span className="text-[8px] bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5 text-center">
                    Handmade
                  </span>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 rounded-full bg-brand-navy text-white px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow">
              Pre-Order 5–7 Hari
            </div>

            <div className="absolute bottom-4 right-4 text-[10px] font-bold text-brand-navy bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Model: {selectedVariant?.name}
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-slate-500">
            Estimasi pengerjaan rajut: <strong>5–7 hari kerja</strong>
          </p>
        </div>

        {/* Product Details & Form */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            <span className="badge-brand">Produk Unggulan Resmi</span>

            <h3 className="font-serif text-3xl font-bold text-brand-navy tracking-tight mt-2">
              {rovella.name}
            </h3>
            <p className="text-xs font-medium text-brand-slate mt-0.5">
              {rovella.tagline}
            </p>

            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {rovella.description}
            </p>

            {/* Price Display Clean */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
                Gratis
              </span>
              <span className="text-xs text-slate-500">
                (Hanya bayar ongkir)
              </span>
            </div>
          </div>

          {/* Interactive Customization Options */}
          <div className="space-y-4 border-t border-slate-100 pt-3 text-xs">
            {/* 1. Pilih Gambar / Model Varian (Kelolaan Divisi Marketing) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Pilih Model / Desain Rajutan
                </label>
                <span className="text-[10px] text-slate-400">
                  {rovella.variants.length} pilihan model
                </span>
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
                    {variant.image ? (
                      <img
                        src={variant.image}
                        alt={variant.name}
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
                    <div className="pr-2">
                      <p className="text-xs font-semibold leading-tight">{variant.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1 max-w-[120px]">
                        {variant.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Ukuran Botol Custom (Tinggi & Lebar) - BUKAN BERBAYAR */}
            <div>
              <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-1">
                Ukuran Botol Kamu (Tinggi & Diameter/Lebar)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Tinggi 21 cm, diameter 7.5 cm (atau sebutkan merk botol)"
                value={customBottleDimensions}
                onChange={(e) => setCustomBottleDimensions(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs text-brand-navy focus:border-brand-slate focus:bg-white focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                💡 Tim rajut kami akan menyesuaikan rajutan persis dengan dimensi botol minum kamu tanpa biaya tambahan.
              </p>
            </div>

            {/* 3. Aksesoris Charm (Gratis) */}
            <div>
              <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-1.5">
                Tambahan Aksesoris Charm (Gratis)
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

            {/* Quantity & Catatan Tambahan */}
            <div className="grid grid-cols-12 gap-3 pt-1">
              <div className="col-span-4">
                <label className="font-semibold text-slate-800 text-[10px] uppercase block mb-1">
                  Jumlah (pcs)
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

              <div className="col-span-8">
                <label className="font-semibold text-slate-800 text-[10px] uppercase block mb-1">
                  Catatan Khusus (Warna tali / request inisial)
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
            <button
              onClick={handleDirectCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-navy py-4 text-sm font-bold text-white shadow-lg hover:bg-brand-slate active:scale-[0.99] transition-all"
            >
              <ShoppingBag size={18} />
              <span>Pesan Pre-Order Sekarang (Gratis, Hanya Ongkir)</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-brand-slate py-2.5 text-xs font-bold text-brand-slate hover:bg-brand-surface active:scale-[0.99] transition-all"
            >
              <span>+ Masukkan ke Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
