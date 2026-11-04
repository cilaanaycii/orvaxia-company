'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionDashboard() {
  const {
    orders,
    updateOrderStatus,
    inventory,
    updateInventory,
    currentUser,
  } = useCompanyStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'qc'>('queue');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Manufaktur & Rajutan</span>
            <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">
              DIVISI PRODUKSI
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Production Management & Quality Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar antrean pengerjaan rajut Rovella, catatan kustomisasi ukuran botol, kontrol stok benang, dan inspeksi QC.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Antrean Produksi ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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

          {/* Orders Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productionOrders.map((order) => {
              const item = order.items[0];

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-brand-lavender transition-all"
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

                  {/* Product Specification & Customization Notes */}
                  <div className="rounded-2xl bg-brand-surface/40 p-3.5 text-xs space-y-2 border border-brand-lavender/20">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-navy">
                        {item?.productName} ({item?.variantName})
                      </span>
                      <span className="font-bold text-slate-700">Jumlah: {item?.quantity} pcs</span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p>
                        <span className="font-semibold text-slate-800">Spesifikasi Botol:</span>{' '}
                        {item?.sizeName}
                      </p>
                      {item?.customCharm && (
                        <p>
                          <span className="font-semibold text-slate-800">Aksesoris Charm:</span>{' '}
                          {item.customCharm}
                        </p>
                      )}
                      {item?.customization?.customNotes && (
                        <p className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 font-medium">
                          Catatan Pemesan: "{item.customization.customNotes}"
                        </p>
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
        </div>
      )}

      {/* ================= TAB 2: INVENTORY ================= */}
      {activeTab === 'inventory' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">
                Inventaris Bahan Baku & Aksesoris Rajutan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan ketersediaan benang Milk Cotton dan kemasan memenuhi target pre-order.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Nama Material</th>
                  <th className="pb-3 font-semibold">Kategori</th>
                  <th className="pb-3 font-semibold">Sisa Stok</th>
                  <th className="pb-3 font-semibold">Batas Minimum</th>
                  <th className="pb-3 font-semibold">Biaya Satuan</th>
                  <th className="pb-3 font-semibold text-right">Kelola Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 text-slate-600">{item.category}</td>
                    <td className="py-3 font-bold">
                      <span
                        className={
                          item.stock <= item.minThreshold
                            ? 'text-rose-600 flex items-center gap-1'
                            : 'text-slate-900'
                        }
                      >
                        {item.stock} {item.unit}
                        {item.stock <= item.minThreshold && (
                          <span title="Stok Hampir Habis!"><ShieldAlert size={12} /></span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{item.minThreshold} {item.unit}</td>
                    <td className="py-3 text-slate-700">Rp{item.unitCost.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-right space-x-1">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
