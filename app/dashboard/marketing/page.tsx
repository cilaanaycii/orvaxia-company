'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { Product } from '@/lib/types';
import {
  Palette,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingDashboard() {
  const { products, updateProduct, addProduct, deleteProduct } = useCompanyStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(35000);
  const [formCategory, setFormCategory] = useState('Tas Tumbler');

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormTagline(prod.tagline);
    setFormDescription(prod.description);
    setFormPrice(prod.basePrice);
    setFormCategory(prod.category);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: formName,
      tagline: formTagline,
      description: formDescription,
      basePrice: Number(formPrice),
      category: formCategory,
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Pemasaran & Display</span>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
              DIVISI MARKETING
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Product Catalog & Creative Campaigns
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tampilan etalase produk rajutan, varian warna, harga dasar, dan deskripsi yang tampil di katalog publik.
          </p>
        </div>
      </div>

      {/* Editing Form Modal */}
      {editingProduct && (
        <form
          onSubmit={handleSaveEdit}
          className="rounded-3xl border border-brand-lavender bg-white p-6 shadow-md space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-base font-bold text-brand-navy">
              Edit Data Produk: {editingProduct.name}
            </h3>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕ Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Nama Produk</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Harga Dasar (Rp)</label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">Slogan / Tagline Produk</label>
              <input
                type="text"
                value={formTagline}
                onChange={(e) => setFormTagline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">Deskripsi Lengkap</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-brand-slate px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-navy"
            >
              Simpan Perubahan Produk
            </button>
          </div>
        </form>
      )}

      {/* Catalog Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-brand-lavender transition-all"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold text-brand-slate border border-brand-lavender/30">
                  {product.category}
                </span>
                <h4 className="font-serif text-lg font-bold text-brand-navy mt-1">
                  {product.name}
                </h4>
                <p className="text-xs text-brand-slate font-medium">{product.tagline}</p>
              </div>

              <div className="text-right">
                <span className="font-serif font-bold text-base text-brand-navy block">
                  Rp{product.basePrice.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {product.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Variants Preview */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Varian Warna Resmi ({product.variants.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    {v.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                {product.sizes.length} Pilihan Ukuran · {product.customCharms.length} Opsi Charm
              </span>
              <button
                onClick={() => handleStartEdit(product)}
                className="flex items-center gap-1.5 rounded-full border border-brand-slate px-4 py-1.5 text-xs font-bold text-brand-slate hover:bg-brand-surface"
              >
                <Edit3 size={12} /> Edit Produk
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
