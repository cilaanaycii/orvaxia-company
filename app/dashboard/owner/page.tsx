'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { UserRole } from '@/lib/types';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Settings,
  Clock,
  Truck,
  CheckCircle,
  FileText,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerDashboard() {
  const {
    users,
    approveStaff,
    rejectStaff,
    siteSettings,
    updateSiteSettings,
    poPeriod,
    updatePOPeriod,
    orders,
  } = useCompanyStore();

  const [activeTab, setActiveTab] = useState<'approvals' | 'settings' | 'po' | 'audit'>('approvals');

  // Form states for settings
  const [waNumber, setWaNumber] = useState(siteSettings.whatsappNumber);
  const [email, setEmail] = useState(siteSettings.email);
  const [bankAccount, setBankAccount] = useState(siteSettings.paymentInfo.accountNumber);
  const [bankHolder, setBankHolder] = useState(siteSettings.paymentInfo.accountHolder);
  const [shippingRange6To7, setShippingRange6To7] = useState(siteSettings.shippingRules.range6To7Km);

  // PO form states
  const [poQuota, setPoQuota] = useState(poPeriod.quota);
  const [poTitle, setPoTitle] = useState(poPeriod.title);
  const [poAnnouncement, setPoAnnouncement] = useState(poPeriod.announcement);

  const pendingUsers = users.filter((u) => u.status === 'pending_approval');
  const activeUsers = users.filter((u) => u.status === 'active');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      whatsappNumber: waNumber,
      email,
      paymentInfo: {
        ...siteSettings.paymentInfo,
        accountNumber: bankAccount,
        accountHolder: bankHolder,
      },
      shippingRules: {
        ...siteSettings.shippingRules,
        range6To7Km: Number(shippingRange6To7),
      },
    });
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    updatePOPeriod({
      quota: Number(poQuota),
      title: poTitle,
      announcement: poAnnouncement,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Otoritas Tertinggi</span>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
              SUPER ADMIN
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Owner & Super Admin Control Panel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola izin akun anggota perusahaan, persetujuan pendaftaran, konfigurasi PO, dan pengaturan global platform.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'approvals'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Persetujuan Akun ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Pengaturan Platform
          </button>
          <button
            onClick={() => setActiveTab('po')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'po'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Kontrol Pre-Order
          </button>
        </div>
      </div>

      {/* ================= TAB 1: MEMBER APPROVALS & ROLES ================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Pending Approval Section */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Pendaftaran Anggota Menunggu Verifikasi ({pendingUsers.length})
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Sesuai aturan keamanan perusahaan, akun anggota yang baru mendaftar tidak otomatis mendapat hak akses dashboard operasional sebelum disetujui dan ditentukan rolenya oleh Owner.
            </p>

            {pendingUsers.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
                Tidak ada akun anggota yang menunggu persetujuan saat ini.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{user.fullName}</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Email: {user.email} · Telp: {user.phone}
                      </p>
                      <p className="text-xs text-brand-slate font-medium">
                        Pengajuan Divisi: {user.division || 'Umum'} · Posisi: {user.position || 'Staff'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveStaff(user.id, 'production', 'Produksi', 'Staff Produksi')}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
                        title="Setujui sebagai Divisi Produksi"
                      >
                        Setujui: Produksi
                      </button>
                      <button
                        onClick={() => approveStaff(user.id, 'sales', 'Sales', 'Staff Sales')}
                        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                        title="Setujui sebagai Divisi Sales"
                      >
                        Setujui: Sales
                      </button>
                      <button
                        onClick={() => approveStaff(user.id, 'member', user.division || 'Umum', user.position || 'Staff')}
                        className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-black shadow-sm"
                        title="Setujui sebagai Anggota Umum"
                      >
                        Setujui: Umum
                      </button>
                      <button
                        onClick={() => rejectStaff(user.id)}
                        className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Members Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-brand-navy mb-4">
              Daftar Akun Terdaftar & Hak Akses Role
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Nama Anggota</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role Terpasang</th>
                    <th className="pb-3 font-semibold">Divisi</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Tindakan Otoritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/80">
                      <td className="py-3 font-bold text-slate-900">{usr.fullName}</td>
                      <td className="py-3 text-slate-600">{usr.email}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold text-brand-slate uppercase border border-brand-lavender/30">
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{usr.division || '-'}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            usr.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {usr.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        {usr.role !== 'owner' && (
                          <button
                            onClick={() => {
                              toast.info(`Role ${usr.fullName} dapat diubah melalui database atau switch.`);
                            }}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Kelola Role
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PLATFORM SETTINGS ================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-brand-navy border-b border-slate-100 pb-3">
              Informasi Kontak & Komunikasi Resmi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Nomor WhatsApp Gateway Perusahaan
                </label>
                <input
                  type="text"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Digunakan untuk menerima konfirmasi checkout otomatis dari pelanggan.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-800 block mb-1">
                  Alamat Resmi & Titik Acuan Pengiriman
                </label>
                <input
                  type="text"
                  value={siteSettings.address}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-brand-navy border-b border-slate-100 pb-3">
              Rekening Penerimaan & Aturan Ongkir Dinamis
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Nomor Rekening Bank Resmi
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Atas Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Tarif Ongkir Jarak 6–7 km (Dapat Diatur Admin)
                </label>
                <input
                  type="number"
                  value={shippingRange6To7}
                  onChange={(e) => setShippingRange6To7(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Sesuai ketentuan prompt: Jarak 1-2 km: Rp0, 3-5 km: Rp3.000, &gt;7 km: Rp5.000.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-navy"
              >
                <Save size={14} /> Simpan Seluruh Pengaturan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 3: PO CONTROL ================= */}
      {activeTab === 'po' && (
        <form onSubmit={handleSavePO} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">
                Manajemen Periode Pre-Order (PO)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur pembukaan kuota, pengumuman, dan status PO yang tampil di halaman publik.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                poPeriod.status === 'open'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              Status: {poPeriod.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Judul Periode Pre-Order
              </label>
              <input
                type="text"
                value={poTitle}
                onChange={(e) => setPoTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Batas Kuota Pesanan (Pcs)
              </label>
              <input
                type="number"
                value={poQuota}
                onChange={(e) => setPoQuota(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-800 block mb-1">
                Pengumuman Tambahan PO
              </label>
              <textarea
                rows={2}
                value={poAnnouncement}
                onChange={(e) => setPoAnnouncement(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-navy"
            >
              <Save size={14} /> Simpan Perubahan PO
            </button>
            <button
              type="button"
              onClick={() => {
                const nextStatus = poPeriod.status === 'open' ? 'closed' : 'open';
                updatePOPeriod({ status: nextStatus });
              }}
              className="rounded-full border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {poPeriod.status === 'open' ? 'Tutup PO Secara Manual' : 'Buka Kembali Periode PO'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
