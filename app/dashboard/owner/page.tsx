'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { UserRole, UserProfile } from '@/lib/types';
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
  RotateCcw,
  Sparkles,
  Users,
  Edit2,
  Trash2,
  Check,
  X,
  KeyRound,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerDashboard() {
  const {
    users,
    approveStaff,
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

  const [activeTab, setActiveTab] = useState<'approvals' | 'all_crew' | 'settings' | 'po'>('approvals');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setTimeout(() => setIsSyncing(false), 600);
    toast.success('Data cloud berhasil disegarkan!');
  };

  // Form states for settings
  const [waNumber, setWaNumber] = useState(siteSettings.whatsappNumber);
  const [email, setEmail] = useState(siteSettings.email);
  const [invitationCode, setInvitationCode] = useState(siteSettings.crewInvitationCode || 'ORVAXIA2026');
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
      crewInvitationCode: invitationCode.trim().toUpperCase(),
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Pemegang Kendali Website</span>
            <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold">
              👑 SUPER ADMIN / OWNER
            </span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-all shadow-2xs"
              title="Periksa pendaftaran crew baru yang masuk dari HP"
            >
              <span className={`h-2 w-2 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : 'animate-pulse'}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Segarkan Data Cloud'}</span>
            </button>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Owner & Website Controller Panel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Akun Masuk: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-brand-slate">rnefviie@gmail.com</code> · Anda berhak penuh mengarahkan posisi/role setiap crew dan mengatur seluruh sistem.
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
            Arahan Crew Baru ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('all_crew')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'all_crew'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Kelola Seluruh Crew ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Pengaturan & Reset Data
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

      {/* Secret Crew Invitation Code Banner for Owner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50 border border-amber-300 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <KeyRound size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xs text-amber-950">Kode Khusus Pendaftaran Crew Saat Ini:</span>
              <code className="font-mono font-bold text-sm text-amber-900 bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs tracking-wider">
                {siteSettings.crewInvitationCode || 'ORVAXIA2026'}
              </code>
            </div>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              Bagikan kode ini hanya kepada 31 anggota & kru resmi agar orang biasa tidak dapat sembarangan mendaftar menjadi crew.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(siteSettings.crewInvitationCode || 'ORVAXIA2026');
            toast.success(`Kode khusus "${siteSettings.crewInvitationCode || 'ORVAXIA2026'}" berhasil disalin!`);
          }}
          className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 shadow-sm transition-all flex items-center gap-1.5 shrink-0"
        >
          <Copy size={13} />
          <span>Salin Kode Undangan</span>
        </button>
      </div>

      {/* Division Summary Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Produksi</span>
          <span className="font-serif text-lg font-bold text-brand-navy">{countProduksi}</span>
          <span className="text-[9px] text-slate-400 block">Crew</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sales</span>
          <span className="font-serif text-lg font-bold text-brand-navy">{countSales}</span>
          <span className="text-[9px] text-slate-400 block">Crew</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Finance</span>
          <span className="font-serif text-lg font-bold text-brand-navy">{countFinance}</span>
          <span className="text-[9px] text-slate-400 block">Crew</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Marketing</span>
          <span className="font-serif text-lg font-bold text-brand-navy">{countMarketing}</span>
          <span className="text-[9px] text-slate-400 block">Crew</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">HRD</span>
          <span className="font-serif text-lg font-bold text-brand-navy">{countHRD}</span>
          <span className="text-[9px] text-slate-400 block">Crew</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">PR / Humas</span>
          <span className="font-serif text-lg font-bold text-brand-navy">{countPR}</span>
          <span className="text-[9px] text-slate-400 block">Crew</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">CEO Exec</span>
          <span className="font-serif text-lg font-bold text-brand-navy">{countCEO}</span>
          <span className="text-[9px] text-slate-400 block">Pimpinan</span>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending</span>
          <span className="font-serif text-lg font-bold text-amber-800">{pendingUsers.length}</span>
          <span className="text-[9px] text-amber-600 block">Menunggu Arahan</span>
        </div>
      </div>

      {/* ================= TAB 1: PENDING CREW APPROVALS & DIRECTION ================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Pendaftaran Crew yang Menunggu Arahan Anda ({pendingUsers.length})
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Setiap anggota crew mendaftar menggunakan email pribadi mereka masing-masing. Sesuai aturan perusahaan, <strong>yang mengarahkan dan menetapkan dia menjadi apa adalah Owner</strong>. Silakan pilih peran dan divisinya di bawah ini lalu tekan <strong>Setujui & Tetapkan</strong>.
            </p>

            {pendingUsers.length === 0 ? (
              <div className="text-xs text-slate-500 italic bg-white p-5 rounded-2xl border border-slate-200 text-center">
                ✨ Tidak ada crew yang menunggu persetujuan. Semua crew telah diarahkan ke divisinya masing-masing.
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
                      className="rounded-3xl border border-amber-300 bg-white p-5 shadow-sm space-y-4 hover:border-brand-lavender transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-slate-900">{user.fullName}</span>
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                              Menunggu Arahan Owner
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Email Pribadi: <strong className="text-slate-800">{user.email}</strong> · WhatsApp: {user.phone}
                          </p>
                          <p className="text-xs text-brand-slate font-medium">
                            Minat Divisi Awal: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{user.division || 'Belum Ditentukan'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => rejectStaff(user.id)}
                            className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      </div>

                      {/* Direction Controls (Owner Assigns Role) */}
                      <div className="rounded-2xl bg-brand-surface/50 border border-brand-lavender/30 p-4 space-y-3">
                        <span className="font-bold text-xs text-brand-navy block">
                          Arahkan Anggota Ini Menjadi:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
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
                              className="w-full rounded-xl border border-slate-200 p-2 bg-white font-medium focus:border-brand-slate focus:outline-none"
                            >
                              <option value="production">✂️ Divisi Produksi (Rajutan)</option>
                              <option value="sales">🚚 Divisi Sales & Distribusi</option>
                              <option value="finance">💰 Divisi Finance (Keuangan)</option>
                              <option value="marketing">🎨 Divisi Marketing</option>
                              <option value="hrd">👥 Divisi HRD</option>
                              <option value="pr">📢 Divisi Public Relations (PR)</option>
                              <option value="ceo">💼 CEO Executive</option>
                              <option value="member">📝 Anggota Umum</option>
                              <option value="owner">👑 Super Admin / Owner</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">
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
                            <label className="font-semibold text-slate-700 block mb-1">
                              Jabatan / Posisi
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

                        {/* Quick Presets & Confirm */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-lavender/30">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="text-slate-400 font-semibold mr-1">Preset Cepat:</span>
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
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            <span>Tetapkan & Aktifkan Crew</span>
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

      {/* ================= TAB 2: ALL CREW MANAGEMENT (CHANGE ROLES) ================= */}
      {activeTab === 'all_crew' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-navy">
                  Daftar Seluruh Anggota Tim & Otoritas Penugasan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sebagai Owner, Anda dapat memindahkan divisi atau mengubah jabatan anggota kapan saja.
                </p>
              </div>
            </div>

            {/* Inline Editor if active */}
            {editingUserId && (
              <div className="rounded-2xl border-2 border-brand-slate bg-brand-surface/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-brand-navy">
                    Ubah Penugasan Crew: {users.find((u) => u.id === editingUserId)?.fullName}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕ Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Role Dashboard</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                    >
                      <option value="production">✂️ Divisi Produksi</option>
                      <option value="sales">🚚 Divisi Sales & Distribusi</option>
                      <option value="finance">💰 Divisi Finance</option>
                      <option value="marketing">🎨 Divisi Marketing</option>
                      <option value="hrd">👥 Divisi HRD</option>
                      <option value="pr">📢 Divisi Public Relations</option>
                      <option value="ceo">💼 CEO Executive</option>
                      <option value="member">📝 Anggota Umum</option>
                      <option value="owner">👑 Super Admin / Owner</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Divisi</label>
                    <input
                      type="text"
                      value={editDivision}
                      onChange={(e) => setEditDivision(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Posisi / Jabatan</label>
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
                    className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={saveEditUser}
                    className="rounded-xl bg-brand-slate px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-navy shadow-sm"
                  >
                    Simpan Arahan Baru
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Nama Crew</th>
                    <th className="pb-3 font-semibold">Email Pribadi</th>
                    <th className="pb-3 font-semibold">Role Terpasang</th>
                    <th className="pb-3 font-semibold">Divisi</th>
                    <th className="pb-3 font-semibold">Jabatan</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Opsi Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((usr) => {
                    const isUserOwner = usr.email.toLowerCase() === 'rnefviie@gmail.com';

                    return (
                      <tr key={usr.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-bold text-slate-900">
                          {usr.fullName}
                          {isUserOwner && (
                            <span className="ml-1.5 rounded-full bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 font-bold">
                              👑 Owner
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-600 font-mono text-[11px]">{usr.email}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold text-brand-slate uppercase border border-brand-lavender/30">
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{usr.division || '-'}</td>
                        <td className="py-3 text-slate-600">{usr.position || '-'}</td>
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
                          {!isUserOwner ? (
                            <>
                              <button
                                onClick={() => startEditUser(usr)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                              >
                                <Edit2 size={11} />
                                <span>Arahkan Role</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus akun ${usr.fullName} (${usr.email})?`)) {
                                    deleteUser(usr.id);
                                  }
                                }}
                                className="rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hapus Akun"
                              >
                                <Trash2 size={11} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-medium">
                              Pemegang Kendali
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
          {/* Reset All Operational Data to 0 Card */}
          <div className="rounded-3xl border-2 border-rose-200 bg-rose-50/40 p-6 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={18} className="text-rose-600" />
                  <h3 className="font-serif text-lg font-bold text-rose-950">
                    Reset Semua Data Operasional ke 0
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Gunakan tombol ini untuk mengosongkan semua data pesanan pelanggan, buku kas keuangan, riwayat ulasan HRD, tugas, dan stok bahan agar <strong>semuanya bernilai 0</strong> dan siap diedit secara mandiri oleh masing-masing crew divisi.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetConfirm}
                className="shrink-0 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Buat Semua Jadi 0</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-400 block">Total Pesanan:</span>
                <span className="font-bold text-sm text-slate-800">{orders.length} pesanan</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-400 block">Total Transaksi Kas:</span>
                <span className="font-bold text-sm text-slate-800">{transactions.length} catatan</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-400 block">Total Stok Bahan:</span>
                <span className="font-bold text-sm text-slate-800">
                  {inventory.reduce((a, b) => a + b.stock, 0)} unit
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                <span className="text-[10px] text-slate-400 block">Pesanan PO Masuk:</span>
                <span className="font-bold text-sm text-slate-800">{poPeriod.orderedCount} pcs</span>
              </div>
            </div>
          </div>

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
                    Kode Khusus Undangan Pendaftaran Crew
                  </label>
                  <input
                    type="text"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-amber-300 bg-amber-50/50 p-2.5 font-mono font-bold tracking-wider text-amber-950 uppercase focus:border-brand-slate focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Wajib dimasukkan oleh calon anggota di formulir pendaftaran crew agar pengunjung biasa tidak dapat sembarangan mendaftar menjadi crew.
                  </p>
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
                    Jarak 1-2 km: Rp0 (Gratis SMKN 2), 3-5 km: Rp3.000, &gt;7 km: Rp5.000.
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
        </div>
      )}

      {/* ================= TAB 4: PO CONTROL ================= */}
      {activeTab === 'po' && (
        <form onSubmit={handleSavePO} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">
                Manajemen Periode Pre-Order (PO)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur kuota PO, pengumuman, dan status yang tampil di banner countdown publik.
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
              <p className="text-[10px] text-slate-400 mt-1">
                Saat ini terisi: {poPeriod.orderedCount} pesanan.
              </p>
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
