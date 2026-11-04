'use client';

import React from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Truck,
  Users,
  Award,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';

export default function CEODashboard() {
  const { orders, transactions, teamMembers, performanceReviews, poPeriod } = useCompanyStore();

  // Metrics calculation
  const totalOrders = orders.length;
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified').length;
  const inProductionOrders = orders.filter((o) => o.orderStatus === 'in_production').length;
  const readyOrShippedOrders = orders.filter((o) => ['ready_to_ship', 'shipped'].includes(o.orderStatus)).length;

  const totalRevenue = transactions
    .filter((t) => t.type === 'income' && t.status === 'verified')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'verified')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalRevenue - totalExpense;

  const avgHrdScore =
    performanceReviews.length > 0
      ? (
          performanceReviews.reduce((acc, r) => acc + r.averageScore, 0) /
          performanceReviews.length
        ).toFixed(1)
      : '92.5';

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Ringkasan Eksekutif</span>
            <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">
              CHIEF EXECUTIVE OFFICER
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Executive Leadership & Company Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengawasan terpusat terhadap kinerja 6 divisi, arus keuangan, pipeline produksi Rovella, dan evaluasi 31 anggota.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <Printer size={14} /> Cetak Laporan Eksekutif
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Omset Terverifikasi</span>
            <DollarSign size={18} className="text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-brand-navy mt-2">
            Rp{totalRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <TrendingUp size={11} /> Berdasarkan transaksi nyata terverifikasi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Estimasi Laba Bersih</span>
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-brand-navy mt-2">
            Rp{netProfit.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Pengeluaran: Rp{totalExpense.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Pre-Order Masuk</span>
            <ShoppingBag size={18} className="text-brand-slate" />
          </div>
          <p className="font-serif text-2xl font-bold text-brand-navy mt-2">
            {totalOrders} Pesanan
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {verifiedOrders} terbayar · Kuota PO: {poPeriod.orderedCount}/{poPeriod.quota}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Skor Evaluasi HRD Rata-Rata</span>
            <Award size={18} className="text-purple-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-brand-navy mt-2">
            {avgHrdScore} / 100
          </p>
          <p className="text-[10px] text-purple-600 mt-1 font-semibold">
            {teamMembers.length} Anggota Resmi Terdata
          </p>
        </div>
      </div>

      {/* Operational Pipeline Tracker */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-brand-navy mb-4">
          Status Alur Operasional Pesanan Lintas Divisi
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <span className="text-[10px] uppercase font-bold text-amber-700">1. Verifikasi Pembayaran</span>
            <p className="font-serif text-xl font-bold text-amber-900 mt-1">
              {orders.filter((o) => o.paymentStatus === 'pending').length} Order
            </p>
            <span className="text-[10px] text-amber-600">Ditangani Divisi Finance</span>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
            <span className="text-[10px] uppercase font-bold text-blue-700">2. Proses Produksi & QC</span>
            <p className="font-serif text-xl font-bold text-blue-900 mt-1">
              {inProductionOrders} Order
            </p>
            <span className="text-[10px] text-blue-600">Ditangani Divisi Produksi</span>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
            <span className="text-[10px] uppercase font-bold text-purple-700">3. Siap / Sedang Dikirim</span>
            <p className="font-serif text-xl font-bold text-purple-900 mt-1">
              {readyOrShippedOrders} Order
            </p>
            <span className="text-[10px] text-purple-600">Ditangani Divisi Sales</span>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <span className="text-[10px] uppercase font-bold text-emerald-700">4. Pesanan Selesai Diterima</span>
            <p className="font-serif text-xl font-bold text-emerald-900 mt-1">
              {orders.filter((o) => o.orderStatus === 'completed').length} Order
            </p>
            <span className="text-[10px] text-emerald-600">Selesai & Terkonfirmasi</span>
          </div>
        </div>
      </div>

      {/* Division Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Overview */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-navy">Aktivitas Pesanan Terbaru</h4>
            <span className="text-xs text-brand-slate font-medium">Single Source of Truth</span>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-slate">
                      {ord.referenceCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {ord.customerName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {ord.schoolName} ({ord.className}) · {ord.items[0]?.productName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-xs text-brand-navy block">
                    Rp{ord.totalAmount.toLocaleString('id-ID')}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HRD & Team Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-navy">Evaluasi Kinerja 31 Anggota</h4>
            <span className="text-xs text-emerald-700 font-semibold">100% Aktif</span>
          </div>

          <div className="space-y-3">
            {performanceReviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{rev.memberName}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({rev.memberDivision})</span>
                  </div>
                  <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
                    Skor: {rev.averageScore} / 100
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic">
                  "{rev.notes}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
