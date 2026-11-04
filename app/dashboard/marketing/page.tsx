'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCompanyStore } from '@/lib/store/company-store';
import { Product, ProductVariant } from '@/lib/types';
import {
  Palette,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle,
  Image as ImageIcon,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingDashboard() {
  const { products, updateProduct } = useCompanyStore();
  const rovella = products[0];

  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantName, setVariantName] = useState('');
  const [variantImage, setVariantImage] = useState('');
  const [variantDesc, setVariantDesc] = useState('');

  const [newVarName, setNewVarName] = useState('');
  const [newVarImage, setNewVarImage] = useState('');
  const [newVarDesc, setNewVarDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleStartEditVariant = (v: ProductVariant) => {
    setEditingVariant(v);
    setVariantName(v.name);
    setVariantImage(v.image || '');
    setVariantDesc(v.description);
  };

  const handleSaveVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rovella || !editingVariant) return;

    const updatedVariants = rovella.variants.map((v) =>
      v.id === editingVariant.id
        ? {
            ...v,
            name: variantName,
            image: variantImage,
            description: variantDesc,
          }
        : v
    );

    updateProduct(rovella.id, { variants: updatedVariants });
    setEditingVariant(null);
    toast.success(`Model varian "${variantName}" berhasil diperbarui!`);
  };

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rovella || !newVarName) return;

    const newV: ProductVariant = {
      id: `var-${Date.now()}`,
      name: newVarName,
      colorHex: '#606C8D',
      image: newVarImage || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
      description: newVarDesc || 'Model rajutan tas tumbler custom',
    };

    updateProduct(rovella.id, { variants: [...rovella.variants, newV] });
    setNewVarName('');
    setNewVarImage('');
    setNewVarDesc('');
    setShowAddModal(false);
    toast.success(`Model varian "${newVarName}" berhasil ditambahkan ke katalog!`);
  };

  const handleDeleteVariant = (variantId: string) => {
    if (!rovella) return;
    if (rovella.variants.length <= 1) {
      toast.error('Minimal harus ada 1 varian model rajutan aktif');
      return;
    }

    const updatedVariants = rovella.variants.filter((v) => v.id !== variantId);
    updateProduct(rovella.id, { variants: updatedVariants });
    toast.success('Model varian berhasil dihapus');
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
            Kelola Gambar & Model Varian Produk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Divisi marketing memiliki wewenang mengunggah dan mengatur foto model rajutan Rovella yang ditampilkan kepada pemesan.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-slate transition-all"
        >
          <Plus size={15} /> Tambah Model Baru
        </button>
      </div>

      {/* Modal Edit Variant */}
      {editingVariant && (
        <form
          onSubmit={handleSaveVariant}
          className="rounded-3xl border border-brand-lavender bg-white p-6 shadow-md space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-base font-bold text-brand-navy flex items-center gap-2">
              <ImageIcon size={16} className="text-brand-slate" />
              <span>Edit Model: {editingVariant.name}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditingVariant(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕ Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Nama Model / Desain *</label>
              <input
                type="text"
                required
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">URL Foto Model Rajutan *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={variantImage}
                onChange={(e) => setVariantImage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">Deskripsi Model Rajutan</label>
              <textarea
                rows={2}
                value={variantDesc}
                onChange={(e) => setVariantDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingVariant(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-brand-navy px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-slate"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}

      {/* Modal Add Variant */}
      {showAddModal && (
        <form
          onSubmit={handleAddVariant}
          className="rounded-3xl border border-brand-slate bg-brand-surface/40 p-6 shadow-md space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-serif text-base font-bold text-brand-navy flex items-center gap-2">
              <Plus size={16} className="text-brand-slate" />
              <span>Tambah Model Desain Rajutan Baru</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕ Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Nama Model Baru *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Strawberry Swirl"
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">URL Foto Model Rajutan *</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={newVarImage}
                onChange={(e) => setNewVarImage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">Deskripsi Singkat</label>
              <textarea
                rows={2}
                placeholder="Jelaskan karakteristik rajutan model ini..."
                value={newVarDesc}
                onChange={(e) => setNewVarDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-brand-navy px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-slate"
            >
              Tambahkan ke Etalase
            </button>
          </div>
        </form>
      )}

      {/* Grid Model Varian Gambar */}
      {rovella && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Daftar Model Varian Aktif ({rovella.variants.length})
            </h3>
            <span className="text-xs text-slate-500">
              Setiap foto yang diubah di sini langsung tampil di etalase pembeli
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {rovella.variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    {variant.image ? (
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: variant.colorHex }}
                      >
                        {variant.name}
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 text-white backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold">
                      Model Resmi
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="font-serif font-bold text-sm text-brand-navy">
                      {variant.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {variant.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <button
                    onClick={() => handleStartEditVariant(variant)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-slate hover:text-brand-navy pt-2"
                  >
                    <Edit3 size={13} /> Edit Gambar
                  </button>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 pt-2"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
