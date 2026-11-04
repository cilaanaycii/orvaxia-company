'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { Product, ProductVariant, ProductSize } from '@/lib/types';
import { ShoppingBag, Sparkles, Check, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProductShowcase() {
  const router = useRouter();
  const { products, addToCart, poPeriod } = useCompanyStore();
  const rovella = products[0]; // Flagship product

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    rovella?.variants[0]
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    rovella?.sizes[0]
  );
  const [selectedCharm, setSelectedCharm] = useState<string>(
    rovella?.customCharms[0] || 'Tanpa Charm Tambahan (Rp0)'
  );
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!rovella) return null;

  // Calculate dynamic unit price
  let charmCost = 0;
  if (selectedCharm.includes('+Rp3.000')) charmCost = 3000;
  else if (selectedCharm.includes('+Rp2.500')) charmCost = 2500;

  const unitPrice = rovella.basePrice + (selectedSize?.priceAdjustment || 0) + charmCost;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      id: `cart-${Date.now()}`,
      productId: rovella.id,
      productName: rovella.name,
      variantName: selectedVariant.name,
      sizeName: selectedSize.name,
      customCharm: selectedCharm,
      unitPrice,
      quantity,
      subtotal: totalPrice,
      customizationNotes: customNotes,
    });
  };

  const handleDirectCheckout = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="w-full rounded-3xl border border-brand-lavender/30 bg-white/95 p-6 md:p-10 shadow-sm backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Showcase (Artisanal Handcrafted 3-in-1 Visual) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-square max-w-md rounded-3xl overflow-hidden border border-brand-lavender/40 shadow-inner flex flex-col items-center justify-center p-6 bg-gradient-to-br from-brand-surface via-white to-brand-cream/80">
            {/* Color preview background orb based on selected variant */}
            <div
              className="absolute h-56 w-56 rounded-full blur-2xl opacity-40 transition-colors duration-500"
              style={{ backgroundColor: selectedVariant?.colorHex || '#A99AB3' }}
            />

            {/* Handcrafted Graphic Representation of Rovella 3-in-1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div
                className="w-36 h-48 rounded-[2rem] border-4 border-white shadow-xl flex flex-col items-center justify-between p-4 transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: selectedVariant?.colorHex || '#A99AB3',
                  boxShadow: `0 16px 32px -8px ${selectedVariant?.colorHex}88`,
                }}
              >
                {/* Woven Knit Texture simulation */}
                <div className="w-full h-full border border-white/40 rounded-2xl p-2 flex flex-col justify-between text-white/90">
                  <div className="flex justify-between items-center text-[10px] font-semibold tracking-widest uppercase">
                    <span>ORVAXIA</span>
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-serif font-bold text-white drop-shadow">
                      Rovella
                    </span>
                    <span className="text-[9px] text-white/80 font-medium">3-in-1 Knit</span>
                  </div>
                  <div className="text-[8px] bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5 text-center">
                    {selectedSize?.name.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Foldable Keychain Indicator */}
              <div className="mt-4 flex items-center gap-2 rounded-full bg-white/90 border border-brand-lavender/40 px-3 py-1 text-xs shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-brand-navy text-[11px]">
                  Dapat Dilipat Menjadi Gantungan Kunci
                </span>
              </div>
            </div>

            {/* PO Badge */}
            <div className="absolute top-4 left-4 rounded-full bg-brand-slate text-white px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow">
              PO Batch 01
            </div>

            <div className="absolute bottom-4 right-4 text-[10px] text-brand-slate bg-white/80 px-2.5 py-1 rounded-full border border-slate-200">
              Varian: {selectedVariant?.name}
            </div>
          </div>
        </div>

        {/* Product Details & Interactive Customizer */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-brand">Produk Unggulan Resmi</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={12} /> 100% Rajutan Tangan
              </span>
            </div>

            <h3 className="font-serif text-3xl font-bold text-brand-navy tracking-tight mt-2">
              {rovella.name}
            </h3>
            <p className="text-xs font-medium text-brand-slate mt-0.5">
              {rovella.tagline}
            </p>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              {rovella.description}
            </p>

            {/* Price Display */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-extrabold text-brand-navy">
                Rp{unitPrice.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-500">/ pcs (Pre-Order)</span>
            </div>
          </div>

          {/* Interactive Customization Options */}
          <div className="space-y-4 border-t border-slate-100 pt-4 text-xs">
            {/* 1. Variant Color Selector */}
            <div>
              <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
                Pilih Warna Favoritmu
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {rovella.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 border transition-all ${
                      selectedVariant.id === variant.id
                        ? 'border-brand-navy bg-white shadow-sm ring-2 ring-brand-navy font-bold text-brand-navy'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/15 shadow-inner"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                    <span>{variant.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Bottle Size Selector */}
            <div>
              <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
                Ukuran Botol
              </label>
              <div className="grid grid-cols-3 gap-2">
                {rovella.sizes.map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => setSelectedSize(sz)}
                    className={`rounded-xl p-2.5 text-left border transition-all ${
                      selectedSize.id === sz.id
                        ? 'border-brand-navy bg-white shadow-sm ring-2 ring-brand-navy font-bold text-brand-navy'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-xs">{sz.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{sz.capacity}</p>
                    {sz.priceAdjustment > 0 && (
                      <p className="text-[10px] font-semibold text-brand-slate mt-1">
                        +Rp{sz.priceAdjustment.toLocaleString('id-ID')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Custom Charm Option */}
            <div>
              <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
                Tambahan Charm (Opsional)
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                {rovella.customCharms.map((charm) => (
                  <button
                    key={charm}
                    onClick={() => setSelectedCharm(charm)}
                    className={`rounded-xl px-3 py-2 border transition-all text-left text-xs ${
                      selectedCharm === charm
                        ? 'border-brand-navy bg-white shadow-sm ring-2 ring-brand-navy font-bold text-brand-navy'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {charm}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Custom Note */}
            <div className="grid grid-cols-12 gap-3 pt-2">
              <div className="col-span-4">
                <label className="font-semibold text-slate-800 text-[10px] uppercase block mb-1">
                  Jumlah
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center text-slate-700"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="h-8 w-8 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 flex items-center justify-center text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="col-span-8">
                <label className="font-semibold text-slate-800 text-[10px] uppercase block mb-1">
                  Catatan Custom
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Request inisial 'A', untuk botol tumbler tinggi 22 cm"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-brand-slate focus:outline-none focus:ring-1 focus:ring-brand-slate"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleDirectCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-navy py-4 text-sm font-bold text-white shadow-lg hover:bg-brand-slate active:scale-[0.99] transition-all"
            >
              <ShoppingBag size={18} />
              <span>Pesan Pre-Order Sekarang (Rp{totalPrice.toLocaleString('id-ID')})</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-brand-slate py-3 text-xs font-bold text-brand-slate hover:bg-brand-surface active:scale-[0.99] transition-all"
            >
              <span>+ Masukkan ke Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
