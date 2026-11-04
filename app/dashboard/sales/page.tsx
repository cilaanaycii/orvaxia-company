'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { OrderStatus } from '@/lib/types';
import {
  Truck,
  Package,
  UserCheck,
  CheckCircle,
  MapPin,
  Clock,
  Phone,
  FileCheck,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SalesDashboard() {
  const {
    orders,
    teamMembers,
    assignDeliveryStaff,
    updateShipmentStatus,
    currentUser,
  } = useCompanyStore();

  const [selectedStaffMap, setSelectedStaffMap] = useState<Record<string, string>>({});
  const [resiMap, setResiMap] = useState<Record<string, string>>({});

  const salesMembers = teamMembers.filter((m) => m.division === 'Sales');

  const handleAssign = (orderId: string) => {
    const staffId = selectedStaffMap[orderId];
    if (!staffId) {
      toast.error('Pilih anggota kurir pengantaran terlebih dahulu');
      return;
    }
    const staff = teamMembers.find((m) => m.id === staffId);
    if (staff) {
      assignDeliveryStaff(orderId, staff.id, staff.name);
      updateShipmentStatus(orderId, 'ready_to_ship');
    }
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    const resi = resiMap[orderId];
    updateShipmentStatus(orderId, status, resi);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Distribusi & Logistik</span>
            <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-[10px] font-bold">
              DIVISI SALES
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Sales & Delivery Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola penugasan pengantaran pesanan di SMKN 2 Buduran, ekspedisi jarak jauh, input resi, dan konfirmasi penerimaan pelanggan.
          </p>
        </div>
      </div>

      {/* Orders Ready for Delivery */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-brand-navy">
          Daftar Pesanan & Status Pengiriman ({orders.length})
        </h3>

        <div className="space-y-4">
          {orders.map((order) => {
            const isReady = order.orderStatus === 'ready_to_ship';
            const isShipped = order.orderStatus === 'shipped';
            const isCompleted = order.orderStatus === 'completed';

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-brand-lavender transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-brand-slate">
                        {order.referenceCode}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700 uppercase">
                        {order.deliveryType === 'school' ? 'Internal SMKN 2' : order.deliveryType}
                      </span>
                      <span className="text-xs text-slate-400">
                        Ongkir: {order.shippingCost === 0 ? 'Gratis' : `Rp${order.shippingCost.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {order.customerName} ({order.customerPhone})
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                      <MapPin size={12} className="text-brand-slate shrink-0" />
                      {order.shippingAddress}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase self-start sm:self-auto ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isShipped
                        ? 'bg-blue-100 text-blue-800'
                        : isReady
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Assignment & Shipping Actions */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-xs">
                  {/* Delivery Staff Assignment */}
                  <div className="md:col-span-4">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Petugas Kurir / Sales Bertanggung Jawab:
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedStaffMap[order.id] || order.assignedStaffId || ''}
                        onChange={(e) =>
                          setSelectedStaffMap({ ...selectedStaffMap, [order.id]: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-brand-slate focus:outline-none"
                      >
                        <option value="">Pilih Anggota Sales...</option>
                        {salesMembers.map((sm) => (
                          <option key={sm.id} value={sm.id}>
                            {sm.name} ({sm.position})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(order.id)}
                        className="rounded-xl bg-brand-slate px-3 py-2 text-xs font-bold text-white hover:bg-brand-navy shrink-0"
                      >
                        Tugaskan
                      </button>
                    </div>
                    {order.assignedStaffName && (
                      <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                        ✓ Ditugaskan ke: {order.assignedStaffName}
                      </p>
                    )}
                  </div>

                  {/* Resi / Expedition Info */}
                  <div className="md:col-span-4">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nomor Resi / Bukti Antar:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: JNT-ORV-09812 / Antar Kelas Langsung"
                      value={resiMap[order.id] ?? order.trackingNumber ?? ''}
                      onChange={(e) =>
                        setResiMap({ ...resiMap, [order.id]: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="md:col-span-4 flex flex-wrap gap-2 justify-start md:justify-end">
                    {order.orderStatus !== 'shipped' && order.orderStatus !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                        className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                      >
                        <Truck size={13} /> Sedang Diantar / Dikirim
                      </button>
                    )}

                    {order.orderStatus !== 'completed' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                      >
                        <CheckCircle size={13} /> Konfirmasi Diterima
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
