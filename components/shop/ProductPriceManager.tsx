'use client';

import { useEffect, useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { toast } from 'sonner';

export function ProductPriceManager() {
  const { products, updateProduct, currentUser } = useCompanyStore();
  const [selectedId, setSelectedId] = useState(products[0]?.id || '');
  const selectedProduct = products.find((product) => product.id === selectedId);
  const [priceInput, setPriceInput] = useState(selectedProduct?.basePrice ? String(selectedProduct.basePrice) : '');

  useEffect(() => {
    setPriceInput(selectedProduct?.basePrice ? String(selectedProduct.basePrice) : '');
  }, [selectedId, selectedProduct?.basePrice]);

  if (!['owner', 'ceo', 'marketing'].includes(currentUser?.role || '')) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(priceInput);
    if (!selectedProduct || !Number.isSafeInteger(price) || price <= 0) {
      toast.error('Masukkan harga jual dalam rupiah yang lebih besar dari Rp0.');
      return;
    }
    await updateProduct(selectedProduct.id, { basePrice: price });
  };

  return (
    <section className="rounded-3xl border border-brand-lavender/30 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="font-serif text-xl font-bold text-brand-navy">Harga Produk</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Harga disimpan pada tabel katalog Supabase. Produk tanpa harga tidak dapat dipesan.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-xs font-semibold text-slate-700">
          Produk
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Harga jual (Rp)
          <input
            type="number"
            min="1"
            step="1"
            required
            value={priceInput}
            onChange={(event) => setPriceInput(event.target.value)}
            placeholder="Belum ditetapkan"
            className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal"
          />
        </label>
        <button type="submit" className="rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-slate">
          Simpan Harga
        </button>
      </form>
    </section>
  );
}
