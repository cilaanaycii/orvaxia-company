'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  Wallet,
  CheckCircle,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Printer,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FinanceDashboard() {
  const {
    orders,
    verifyPayment,
    transactions,
    addTransaction,
    siteSettings,
    currentUser,
  } = useCompanyStore();

  const [activeTab, setActiveTab] = useState<'verification' | 'ledger' | 'add_trx'>('verification');

  // New Transaction Form State
  const [trxType, setTrxType] = useState<'income' | 'expense'>('expense');
  const [trxCategory, setTrxCategory] = useState<'Bahan Baku' | 'Operasional' | 'Packaging' | 'Ongkir' | 'Lainnya'>('Bahan Baku');
  const [trxAmount, setTrxAmount] = useState<number>(50000);
  const [trxMethod, setTrxMethod] = useState('Transfer Bank Mandiri');
  const [trxDesc, setTrxDesc] = useState('');

  const pendingPayments = orders.filter((o) => o.paymentStatus === 'pending');
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified');

  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'verified')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'verified')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleVerify = (orderId: string) => {
    verifyPayment(orderId, currentUser?.fullName || 'Director of Finance');
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxDesc) {
      toast.error('Mohon isi keterangan transaksi');
      return;
    }

    addTransaction({
      date: new Date().toISOString().slice(0, 10),
      type: trxType,
      category: trxCategory,
      amount: Number(trxAmount),
      paymentMethod: trxMethod,
      status: 'verified',
      description: trxDesc,
      recordedBy: currentUser?.fullName || 'Azka Adzkiya (Director of Finance)',
    });

    setTrxDesc('');
    toast.success('Pencatatan kas keluar/masuk berhasil disimpan');
    setActiveTab('ledger');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Manajemen Arus Kas & Verifikasi</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
              DIVISI FINANCE
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Financial Ledger & Payment Reconciliation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi pembayaran pesanan tunai sekolah & QRIS, pencatatan biaya benang & packaging, dan laporan laba bersih.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('verification')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'verification'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Verifikasi Pembayaran ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Buku Kas Transaksi ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('add_trx')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'add_trx'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            + Catat Pengeluaran/Pemasukan
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pemasukan Terverifikasi</span>
            <ArrowDownRight size={18} className="text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-600 mt-2">
            Rp{totalIncome.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Dari {verifiedOrders.length} pesanan terkonfirmasi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Pengeluaran (Bahan & Ops)</span>
            <ArrowUpRight size={18} className="text-rose-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-rose-600 mt-2">
            Rp{totalExpense.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Belanja benang, aksesoris & cetak kemasan
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Saldo Bersih Kas Perusahaan</span>
            <DollarSign size={18} className="text-brand-slate" />
          </div>
          <p className="font-serif text-2xl font-bold text-brand-navy mt-2">
            Rp{netBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-brand-slate mt-1 font-semibold">
            Status: Seimbang & Terverifikasi
          </p>
        </div>
      </div>

      {/* ================= TAB 1: PAYMENT VERIFICATION ================= */}
      {activeTab === 'verification' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">
                Antrean Verifikasi Pembayaran Masuk ({pendingPayments.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan uang tunai atau mutasi transfer telah diterima sebelum memverifikasi.
              </p>
            </div>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-2xl">
              <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Semua pembayaran telah terverifikasi lunas!</p>
              <p className="text-xs text-slate-400 mt-0.5">Tidak ada antrean pending saat ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-brand-slate">
                        {order.referenceCode}
                      </span>
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                        Menunggu Verifikasi
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {order.customerName} ({order.schoolName} - {order.className})
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Metode: <span className="font-bold">{order.paymentMethod === 'cash_school' ? 'Tunai di Sekolah' : order.paymentMethod.toUpperCase()}</span> · Jumlah: <span className="font-bold text-slate-900">Rp{order.totalAmount.toLocaleString('id-ID')}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleVerify(order.id)}
                    className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all shrink-0"
                  >
                    <CheckCircle size={14} /> Verifikasi Lunas
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: TRANSACTIONS LEDGER ================= */}
      {activeTab === 'ledger' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Buku Kas & Riwayat Transaksi Finansial
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Printer size={13} /> Cetak Laporan Keuangan
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-2xl">
              <p className="text-sm font-semibold text-slate-700">Buku kas saat ini bersih (Rp0)</p>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan tab "+ Catat Pengeluaran/Pemasukan" untuk mencatat belanja benang, aksesoris, atau pengeluaran operasional secara mandiri.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Kode Transaksi</th>
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold">Keterangan</th>
                    <th className="pb-3 font-semibold">Metode</th>
                    <th className="pb-3 font-semibold text-right">Nominal</th>
                    <th className="pb-3 font-semibold text-right">Pencatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-900">{t.referenceCode}</td>
                      <td className="py-3 text-slate-500">{t.date}</td>
                      <td className="py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-700 max-w-xs truncate">{t.description}</td>
                      <td className="py-3 text-slate-500">{t.paymentMethod}</td>
                      <td className={`py-3 text-right font-bold ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}Rp{t.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-right text-slate-400 text-[11px]">{t.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ADD TRANSACTION ================= */}
      {activeTab === 'add_trx' && (
        <form
          onSubmit={handleAddTransaction}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 text-xs max-w-2xl"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Pencatatan Arus Keuangan Baru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catat setiap pembelian bahan baku rajutan, aksesoris, kemasan, maupun pemasukan lain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Jenis Transaksi</label>
              <select
                value={trxType}
                onChange={(e) => setTrxType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              >
                <option value="expense">Pengeluaran (Expense)</option>
                <option value="income">Pemasukan (Income)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Kategori</label>
              <select
                value={trxCategory}
                onChange={(e) => setTrxCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              >
                <option value="Bahan Baku">Bahan Baku (Benang Milk Cotton)</option>
                <option value="Packaging">Packaging & Label</option>
                <option value="Operasional">Operasional Tim</option>
                <option value="Ongkir">Biaya Ekspedisi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Nominal (Rp)</label>
              <input
                type="number"
                required
                value={trxAmount}
                onChange={(e) => setTrxAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Metode Pembayaran</label>
              <input
                type="text"
                value={trxMethod}
                onChange={(e) => setTrxMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">Keterangan Transaksi *</label>
              <textarea
                rows={2}
                required
                placeholder="Contoh: Pembelian 15 gulung benang warna Bru Slate untuk order batch 1"
                value={trxDesc}
                onChange={(e) => setTrxDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-full bg-brand-slate px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-navy"
            >
              Simpan Transaksi Kas
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
