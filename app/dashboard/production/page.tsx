'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCompanyStore } from '@/lib/store/company-store';
import { OrderStatus } from '@/lib/types';
import {
  Scissors,
  CheckCircle,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Plus,
  Minus,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionDashboard() {
  const {
    orders,
    updateOrderStatus,
    inventory,
    updateInventory,
    setInventoryStock,
    addInventoryItem,
    currentUser,
  } = useCompanyStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'inventory'>('queue');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New inventory modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCat, setNewMatCat] = useState<'Benang Rajut' | 'Aksesoris Gantungan' | 'Packaging & Label' | 'Lainnya'>('Benang Rajut');
  const [newMatStock, setNewMatStock] = useState(0);
  const [newMatUnit, setNewMatUnit] = useState('gulung (100g)');
  const [newMatMin, setNewMatMin] = useState(10);
  const [newMatCost, setNewMatCost] = useState(14000);

  // Quick edit stock inline state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);

  // Filter production-relevant orders
  const productionOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.orderStatus === filterStatus;
  });

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = 'in_production';
    if (currentStatus === 'pending_confirmation' || currentStatus === 'payment_verified') {
      nextStatus = 'in_production';
    } else if (currentStatus === 'in_production') {
      nextStatus = 'quality_check';
    } else if (currentStatus === 'quality_check') {
      nextStatus = 'packaging';
    } else if (currentStatus === 'packaging') {
      nextStatus = 'ready_to_ship';
    }

    updateOrderStatus(
      orderId,
      nextStatus,
      currentUser?.fullName || 'Divisi Produksi',
      `Tahap produksi diperbarui ke: ${nextStatus}`
    );
  };

  const handleSaveStock = (id: string) => {
    setInventoryStock(id, editingStockVal, 'Input Mandiri Crew Produksi');
    setEditingItemId(null);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName) {
      toast.error('Mohon isi nama material');
      return;
    }

    addInventoryItem({
      name: newMatName,
      category: newMatCat,
      stock: Number(newMatStock),
      unit: newMatUnit,
      minThreshold: Number(newMatMin),
      unitCost: Number(newMatCost),
    });

    setNewMatName('');
    setNewMatStock(0);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-lavender/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Manufaktur & Rajutan</span>
            <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">
              DIVISI PRODUKSI
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight mt-1">
            Production Management & Quality Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar antrean pengerjaan rajut Rovella, catatan kustomisasi botol, kontrol stok benang, dan inspeksi QC.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy'
            }`}
          >
            Antrean Produksi ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy'
            }`}
          >
            Stok Bahan Baku & Benang ({inventory.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: PRODUCTION QUEUE ================= */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'payment_verified', label: 'Siap Diproduksi' },
              { id: 'in_production', label: 'Sedang Dirajut' },
              { id: 'quality_check', label: 'Pemeriksaan QC' },
              { id: 'packaging', label: 'Pengemasan' },
              { id: 'ready_to_ship', label: 'Siap Diserahkan ke Sales' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  filterStatus === st.id
                    ? 'bg-brand-slate text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Orders Cards or Empty State */}
          {productionOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
              <div className="h-14 w-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Scissors size={28} />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-800">
                Belum Ada Antrean Pesanan Rajutan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Saat pembeli melakukan pre-order di etalase Rovella dan diverifikasi, pesanan rajutan akan otomatis masuk ke antrean kerja di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productionOrders.map((order) => {
                const item = order.items[0];

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-brand-lavender/30 bg-white p-5 shadow-xs space-y-4 hover:border-brand-lavender transition-all"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-brand-slate">
                            {order.referenceCode}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700 uppercase">
                            {order.deliveryType}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                          {order.customerName} ({order.schoolName} - {order.className})
                        </h4>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          order.orderStatus === 'in_production'
                            ? 'bg-blue-100 text-blue-800'
                            : order.orderStatus === 'quality_check'
                            ? 'bg-purple-100 text-purple-800'
                            : order.orderStatus === 'packaging'
                            ? 'bg-amber-100 text-amber-800'
                            : order.orderStatus === 'ready_to_ship'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Order Details & Customization Note */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold">Varian Warna:</span>
                        <span className="font-bold text-brand-slate">{item?.variantName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold">Ukuran Tumbler:</span>
                        <span>{item?.sizeName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold">Charm Tambahan:</span>
                        <span>{item?.customCharm || 'Tidak ada'}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                        {item?.customization?.bottleSize && (
                          <p className="text-slate-600">
                            <strong>Ukuran Botol:</strong> {item.customization.bottleSize}
                          </p>
                        )}
                        {item?.customization?.customNotes && (
                          <p className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 font-medium">
                            Catatan Pemesan: &quot;{item.customization.customNotes}&quot;
                          </p>
                        )}
                        {item?.customization?.customImageRefUrl && (
                          <a
                            href={item.customization.customImageRefUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-brand-slate hover:bg-slate-50"
                          >
                            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                              <Image
                                src={item.customization.customImageRefUrl}
                                alt={`Referensi custom ${item.productName}`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </span>
                            <span className="font-semibold">Lihat foto referensi pelanggan</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Advance Workflow Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">
                        Tercatat: {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </span>

                      {order.orderStatus !== 'ready_to_ship' && order.orderStatus !== 'shipped' && order.orderStatus !== 'completed' && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, order.orderStatus)}
                          className="flex items-center gap-1.5 rounded-full bg-brand-slate px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-navy shadow-sm transition-all"
                        >
                          {order.orderStatus === 'pending_confirmation' || order.orderStatus === 'payment_verified'
                            ? 'Mulai Perajutan'
                            : order.orderStatus === 'in_production'
                            ? 'Kirim ke Quality Check'
                            : order.orderStatus === 'quality_check'
                            ? 'QC Lolos, Masuk Pengemasan'
                            : 'Selesai Kemas (Siap Kirim)'}{' '}
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: INVENTORY ================= */}
      {activeTab === 'inventory' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display text-lg font-bold text-brand-navy">
                Inventaris Bahan Baku & Aksesoris Rajutan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stok awal telah di-reset ke 0. Crew produksi dapat mengubah angka stok langsung atau menambah jenis bahan baru.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-full bg-brand-slate px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy shadow-xs transition-all"
            >
              <Plus size={14} />
              <span>Tambah Material Baru</span>
            </button>
          </div>

          {/* Add Material Modal / Form */}
          {showAddModal && (
            <form
              onSubmit={handleCreateMaterial}
              className="rounded-2xl border-2 border-brand-slate bg-brand-surface/40 p-4 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-brand-navy">Tambah Data Material / Benang Baru</h4>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕ Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Material *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Benang Milk Cotton Kuning"
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={newMatCat}
                    onChange={(e) => setNewMatCat(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                  >
                    <option value="Benang Rajut">Benang Rajut</option>
                    <option value="Aksesoris Gantungan">Aksesoris Gantungan / Charm</option>
                    <option value="Packaging & Label">Packaging & Label</option>
                    <option value="Lainnya">Lainnya / Perlengkapan</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan Ukuran</label>
                  <input
                    type="text"
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batas Minimum Peringatan</label>
                  <input
                    type="number"
                    value={newMatMin}
                    onChange={(e) => setNewMatMin(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimasi Biaya Satuan (Rp)</label>
                  <input
                    type="number"
                    value={newMatCost}
                    onChange={(e) => setNewMatCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-1.5 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-slate px-5 py-1.5 font-bold text-white hover:bg-brand-navy shadow-sm"
                >
                  Simpan Material
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Nama Material</th>
                  <th className="pb-3 font-semibold">Kategori</th>
                  <th className="pb-3 font-semibold">Sisa Stok</th>
                  <th className="pb-3 font-semibold">Batas Minimum</th>
                  <th className="pb-3 font-semibold">Biaya Satuan</th>
                  <th className="pb-3 font-semibold text-right">Kelola & Edit Angka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const isEditing = editingItemId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 text-slate-600">{item.category}</td>
                      <td className="py-3 font-bold">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editingStockVal}
                              onChange={(e) => setEditingStockVal(Number(e.target.value))}
                              className="w-20 rounded-lg border border-brand-slate p-1 text-xs font-bold"
                            />
                            <span className="text-[10px] text-slate-500">{item.unit}</span>
                            <button
                              onClick={() => handleSaveStock(item.id)}
                              className="rounded bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                              title="Simpan"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="rounded bg-slate-200 p-1 text-slate-700 hover:bg-slate-300"
                              title="Batal"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={
                              item.stock <= item.minThreshold
                                ? 'text-rose-600 flex items-center gap-1'
                                : 'text-slate-900'
                            }
                          >
                            {item.stock} {item.unit}
                            {item.stock <= item.minThreshold && (
                              <span title="Stok Minimum!"><ShieldAlert size={12} /></span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500">{item.minThreshold} {item.unit}</td>
                      <td className="py-3 text-slate-700">Rp{item.unitCost.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-right space-x-1">
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditingStockVal(item.stock);
                              }}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-100 font-semibold"
                              title="Ubah Angka Stok"
                            >
                              Edit Angka
                            </button>
                            <button
                              onClick={() => updateInventory(item.id, item.stock - 1, 'Penggunaan Produksi')}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-100"
                              title="Gunakan 1"
                            >
                              <Minus size={12} />
                            </button>
                            <button
                              onClick={() => updateInventory(item.id, item.stock + 5, 'Pengadaan Stok Masuk')}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-100"
                              title="Tambah 5"
                            >
                              <Plus size={12} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
