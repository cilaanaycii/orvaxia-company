'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { UserRole, UserProfile } from '@/lib/types';
import {
  ShieldCheck,
  RotateCcw,
  Users,
  Edit2,
  Trash2,
  Check,
  X,
  Mail,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { TeamProfileManager } from '@/components/team/TeamProfileManager';

export default function OwnerDashboard() {
  const {
    users,
    approveStaff,
    confirmCrewAccount,
    resendApprovalEmail,
    changeUserRole,
    rejectStaff,
    deleteUser,
    siteSettings,
    updateSiteSettings,
    poPeriod,
    updatePOPeriod,
    orders,
    transactions,
    inventory,
    resetAllDataToZero,
    currentUser,
    syncWithCloud,
  } = useCompanyStore();

  const [activeTab, setActiveTab] = useState<'approvals' | 'all_crew' | 'settings' | 'po' | 'team'>('approvals');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const synced = await syncWithCloud();
    setIsSyncing(false);
    if (synced) toast.success('Data berhasil diperbarui.');
  };

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

  // State for pending users assignment
  const [pendingRoleMap, setPendingRoleMap] = useState<Record<string, UserRole>>({});
  const [pendingDivisionMap, setPendingDivisionMap] = useState<Record<string, string>>({});
  const [pendingPositionMap, setPendingPositionMap] = useState<Record<string, string>>({});

  // State for editing active user role modal / inline
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('production');
  const [editDivision, setEditDivision] = useState('Produksi');
  const [editPosition, setEditPosition] = useState('Staff');

  const pendingUsers = users.filter((u) => u.status === 'pending_approval');
  const activeUsers = users.filter((u) => u.status === 'active');

  // Division summary counts
  const countProduksi = users.filter((u) => u.division === 'Produksi' && u.status === 'active').length;
  const countSales = users.filter((u) => u.division === 'Sales' && u.status === 'active').length;
  const countFinance = users.filter((u) => u.division === 'Finance' && u.status === 'active').length;
  const countHRD = users.filter((u) => u.division === 'HRD' && u.status === 'active').length;
  const countMarketing = users.filter((u) => u.division === 'Marketing' && u.status === 'active').length;
  const countPR = users.filter((u) => u.division === 'Public Relations' && u.status === 'active').length;
  const countCEO = users.filter((u) => u.role === 'ceo' && u.status === 'active').length;

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

  const handleApproveWithCustom = (user: UserProfile) => {
    const role = pendingRoleMap[user.id] || (user.division === 'Sales' ? 'sales' : 'production');
    const division = pendingDivisionMap[user.id] || user.division || 'Produksi';
    const position = pendingPositionMap[user.id] || user.position || `Staff ${division}`;

    approveStaff(user.id, role, division, position);
  };

  const startEditUser = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditRole(user.role);
    setEditDivision(user.division || 'Produksi');
    setEditPosition(user.position || 'Staff');
  };

  const saveEditUser = () => {
    if (!editingUserId) return;
    changeUserRole(editingUserId, editRole, editDivision, editPosition);
    setEditingUserId(null);
  };

  const handleResetConfirm = () => {
    if (confirm('Apakah Anda yakin ingin me-reset semua data operasional (pesanan, buku kas, inventaris, ulasan, tugas) menjadi 0? Tindakan ini akan mengosongkan semua data agar crew dapat mengisi secara mandiri.')) {
      resetAllDataToZero();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-lavender/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-medium text-brand-slate border border-brand-lavender/30">
              Owner
            </span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <span>{isSyncing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
            </button>
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-navy tracking-tight mt-1 sm:text-3xl">
            Panel Owner
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'approvals'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy'
            }`}
          >
            Persetujuan Anggota ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('all_crew')}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'all_crew'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy'
            }`}
          >
            Kelola Anggota ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy'
            }`}
          >
            Pengaturan
          </button>
          <button
            onClick={() => setActiveTab('po')}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'po'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy'
            }`}
          >
            Pre-Order
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'team'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy'
            }`}
          >
            Direktori Tim
          </button>
        </div>
      </div>

      {/* Division Summary Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block">Produksi</span>
          <span className="font-display text-lg font-bold text-brand-navy">{countProduksi}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block">Sales</span>
          <span className="font-display text-lg font-bold text-brand-navy">{countSales}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block">Finance</span>
          <span className="font-display text-lg font-bold text-brand-navy">{countFinance}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block">Marketing</span>
          <span className="font-display text-lg font-bold text-brand-navy">{countMarketing}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block">HRD</span>
          <span className="font-display text-lg font-bold text-brand-navy">{countHRD}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block">PR</span>
          <span className="font-display text-lg font-bold text-brand-navy">{countPR}</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-xs text-slate-500 block">CEO</span>
          <span className="font-display text-lg font-bold text-brand-navy">{countCEO}</span>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-center shadow-xs">
          <span className="text-xs text-amber-800 block">Menunggu</span>
          <span className="font-display text-lg font-bold text-amber-900">{pendingUsers.length}</span>
        </div>
      </div>

      {/* ================= TAB 1: PENDING CREW APPROVALS & DIRECTION ================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-600" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Persetujuan Anggota ({pendingUsers.length})
              </h2>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="text-xs text-slate-500 bg-white p-5 rounded-2xl border border-slate-200 text-center">
                Tidak ada pendaftaran anggota yang menunggu persetujuan.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => {
                  const selectedRole = pendingRoleMap[user.id] || (user.division === 'Sales' ? 'sales' : 'production');
                  const selectedDiv = pendingDivisionMap[user.id] || user.division || 'Produksi';
                  const selectedPos = pendingPositionMap[user.id] || user.position || `Staff ${selectedDiv}`;

                  return (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-amber-300 bg-white p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900">{user.fullName}</span>
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-800">
                              Menunggu
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Email: {user.email} · WhatsApp: {user.phone}
                          </p>
                          <p className="text-xs text-brand-slate">
                            Minat Divisi: {user.division || 'Belum Ditentukan'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => rejectStaff(user.id)}
                            className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>

                      {/* Direction Controls */}
                      <div className="rounded-2xl bg-brand-surface/50 border border-brand-lavender/30 p-4 space-y-3">
                        <span className="text-xs font-medium text-brand-navy block">
                          Tetapkan Peran:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="font-medium text-slate-700 block mb-1">
                              Hak Akses Role
                            </label>
                            <select
                              value={selectedRole}
                              onChange={(e) => {
                                const newRole = e.target.value as UserRole;
                                setPendingRoleMap((prev) => ({ ...prev, [user.id]: newRole }));
                                if (newRole === 'production') {
                                  setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Produksi' }));
                                  setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff Perajut' }));
                                } else if (newRole === 'sales') {
                                  setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Sales' }));
                                  setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff Distribusi / Kurir' }));
                                } else if (newRole === 'finance') {
                                  setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Finance' }));
                                  setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff Keuangan' }));
                                } else if (newRole === 'marketing') {
                                  setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Marketing' }));
                                  setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff Pemasaran' }));
                                } else if (newRole === 'hrd') {
                                  setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'HRD' }));
                                  setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff HRD' }));
                                } else if (newRole === 'pr') {
                                  setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Public Relations' }));
                                  setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff PR & Medsos' }));
                                } else if (newRole === 'ceo') {
                                  setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Executive' }));
                                  setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Chief Executive Officer' }));
                                }
                              }}
                              className="w-full rounded-xl border border-slate-200 p-2 bg-white font-normal focus:border-brand-slate focus:outline-none"
                            >
                              <option value="production">Divisi Produksi</option>
                              <option value="sales">Divisi Sales & Distribusi</option>
                              <option value="finance">Divisi Finance</option>
                              <option value="marketing">Divisi Marketing</option>
                              <option value="hrd">Divisi HRD</option>
                              <option value="pr">Divisi Public Relations</option>
                              <option value="ceo">CEO Executive</option>
                              <option value="member">Anggota Umum</option>
                              <option value="owner">Owner</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-medium text-slate-700 block mb-1">
                              Nama Divisi
                            </label>
                            <input
                              type="text"
                              value={selectedDiv}
                              onChange={(e) =>
                                setPendingDivisionMap((prev) => ({ ...prev, [user.id]: e.target.value }))
                              }
                              className="w-full rounded-xl border border-slate-200 p-2 bg-white focus:border-brand-slate focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="font-medium text-slate-700 block mb-1">
                              Jabatan
                            </label>
                            <input
                              type="text"
                              value={selectedPos}
                              onChange={(e) =>
                                setPendingPositionMap((prev) => ({ ...prev, [user.id]: e.target.value }))
                              }
                              className="w-full rounded-xl border border-slate-200 p-2 bg-white focus:border-brand-slate focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Presets & Confirm */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-lavender/30">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-slate-400 mr-1">Preset:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingRoleMap((prev) => ({ ...prev, [user.id]: 'production' }));
                                setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Produksi' }));
                                setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff Perajut' }));
                              }}
                              className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                            >
                              Produksi
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingRoleMap((prev) => ({ ...prev, [user.id]: 'sales' }));
                                setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Sales' }));
                                setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Kurir SMKN 2' }));
                              }}
                              className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                            >
                              Sales
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingRoleMap((prev) => ({ ...prev, [user.id]: 'finance' }));
                                setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Finance' }));
                                setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff Keuangan' }));
                              }}
                              className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                            >
                              Finance
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingRoleMap((prev) => ({ ...prev, [user.id]: 'marketing' }));
                                setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'Marketing' }));
                                setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff Marketing' }));
                              }}
                              className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                            >
                              Marketing
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingRoleMap((prev) => ({ ...prev, [user.id]: 'hrd' }));
                                setPendingDivisionMap((prev) => ({ ...prev, [user.id]: 'HRD' }));
                                setPendingPositionMap((prev) => ({ ...prev, [user.id]: 'Staff HRD' }));
                              }}
                              className="rounded-lg bg-white border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                            >
                              HRD
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApproveWithCustom(user)}
                            className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-medium text-white hover:bg-brand-slate shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            <span>Setujui & Tetapkan</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ALL CREW MANAGEMENT ================= */}
      {activeTab === 'all_crew' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-brand-navy">
                  Daftar Anggota Tim
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengelolaan divisi dan jabatan anggota.
                </p>
              </div>
            </div>

            {/* Inline Editor if active */}
            {editingUserId && (
              <div className="rounded-2xl border border-brand-slate bg-brand-surface/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-brand-navy">
                    Ubah Penugasan: {users.find((u) => u.id === editingUserId)?.fullName}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Role Dashboard</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                    >
                      <option value="production">Divisi Produksi</option>
                      <option value="sales">Divisi Sales & Distribusi</option>
                      <option value="finance">Divisi Finance</option>
                      <option value="marketing">Divisi Marketing</option>
                      <option value="hrd">Divisi HRD</option>
                      <option value="pr">Divisi Public Relations</option>
                      <option value="ceo">CEO Executive</option>
                      <option value="member">Anggota Umum</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Divisi</label>
                    <input
                      type="text"
                      value={editDivision}
                      onChange={(e) => setEditDivision(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Posisi / Jabatan</label>
                    <input
                      type="text"
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={saveEditUser}
                    className="rounded-xl bg-brand-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-slate shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs">
                    <th className="pb-3 font-medium">Nama Anggota</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Divisi</th>
                    <th className="pb-3 font-medium">Jabatan</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((usr) => {
                    const isUserOwner = usr.role === 'owner';

                    return (
                      <tr key={usr.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-semibold text-slate-900">
                          {usr.fullName}
                          {isUserOwner && (
                            <span className="ml-1.5 rounded-full bg-brand-surface px-1.5 py-0.5 text-[10px] text-brand-slate border border-brand-lavender/30">
                              Owner
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-600 font-mono text-[11px]">{usr.email}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs text-brand-slate border border-brand-lavender/30">
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{usr.division || '-'}</td>
                        <td className="py-3 text-slate-600">{usr.position || '-'}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              usr.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {usr.status}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          {!isUserOwner ? (
                            <>
                              {usr.status === 'active' && (
                                <>
                                  <button
                                    onClick={() => confirmCrewAccount(usr.id)}
                                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                                    title="Konfirmasi akun"
                                  >
                                    <ShieldCheck size={11} />
                                    <span>Konfirmasi</span>
                                  </button>
                                  <button
                                    onClick={() => resendApprovalEmail(usr.id)}
                                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                                    title="Kirim email persetujuan"
                                  >
                                    <Mail size={11} />
                                    <span>Kirim Email</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => startEditUser(usr)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                              >
                                <Edit2 size={11} />
                                <span>Ubah Peran</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus akun ${usr.fullName} (${usr.email})?`)) {
                                    deleteUser(usr.id);
                                  }
                                }}
                                className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hapus Akun"
                              >
                                <Trash2 size={11} />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Owner
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PLATFORM SETTINGS & RESET ================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Reset Operational Data Card */}
          <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={18} className="text-rose-600" />
                  <h3 className="font-display text-base font-bold text-rose-950">
                    Reset Data Operasional ke 0
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Gunakan tombol ini untuk mengosongkan semua data pesanan pelanggan, buku kas keuangan, riwayat ulasan HRD, tugas, dan stok bahan agar siap diedit secara mandiri oleh masing-masing divisi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetConfirm}
                className="shrink-0 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-5 py-2.5 shadow-sm transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Reset ke 0</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-xs text-slate-400 block">Total Pesanan:</span>
                <span className="font-semibold text-sm text-slate-800">{orders.length} pesanan</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-xs text-slate-400 block">Total Transaksi Kas:</span>
                <span className="font-semibold text-sm text-slate-800">{transactions.length} catatan</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-xs text-slate-400 block">Total Stok Bahan:</span>
                <span className="font-semibold text-sm text-slate-800">
                  {inventory.reduce((a, b) => a + b.stock, 0)} unit
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-xs text-slate-400 block">Pesanan PO Masuk:</span>
                <span className="font-semibold text-sm text-slate-800">{poPeriod.orderedCount} pcs</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-brand-navy border-b border-slate-100 pb-3">
                Informasi Kontak
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-medium text-slate-800 block mb-1">
                    Nomor WhatsApp Perusahaan
                  </label>
                  <input
                    type="text"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Digunakan untuk menerima konfirmasi checkout dari pelanggan.
                  </p>
                </div>

                <div>
                  <label className="font-medium text-slate-800 block mb-1">
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
                  <label className="font-medium text-slate-800 block mb-1">
                    Alamat Operasional
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

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-brand-navy border-b border-slate-100 pb-3">
                Rekening Pembayaran & Pengiriman
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-medium text-slate-800 block mb-1">
                    Nomor Rekening Bank
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-800 block mb-1">
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
                  <label className="font-medium text-slate-800 block mb-1">
                    Tarif Pengiriman 6–7 km
                  </label>
                  <input
                    type="number"
                    value={shippingRange6To7}
                    onChange={(e) => setShippingRange6To7(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-brand-navy px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-brand-slate"
                >
                  <Save size={14} /> Simpan Pengaturan
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 4: PO CONTROL ================= */}
      {activeTab === 'po' && (
        <form onSubmit={handleSavePO} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-brand-navy">
                Manajemen Periode Pre-Order (PO)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur kuota PO, pengumuman, dan status periode.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
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
              <label className="font-medium text-slate-800 block mb-1">
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
              <label className="font-medium text-slate-800 block mb-1">
                Batas Kuota Pesanan (Pcs)
              </label>
              <input
                type="number"
                value={poQuota}
                onChange={(e) => setPoQuota(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Saat ini terisi: {poPeriod.orderedCount} pesanan.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="font-medium text-slate-800 block mb-1">
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
              className="flex items-center gap-2 rounded-full bg-brand-navy px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-brand-slate"
            >
              <Save size={14} /> Simpan Perubahan
            </button>
            <button
              type="button"
              onClick={() => {
                const nextStatus = poPeriod.status === 'open' ? 'closed' : 'open';
                updatePOPeriod({ status: nextStatus });
              }}
              className="rounded-full border border-slate-300 px-5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              {poPeriod.status === 'open' ? 'Tutup PO' : 'Buka Periode PO'}
            </button>
          </div>
        </form>
      )}
      {activeTab === 'team' && <TeamProfileManager />}
    </div>
  );
}
