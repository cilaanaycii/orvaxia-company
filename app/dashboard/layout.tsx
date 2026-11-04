'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { UserRole } from '@/lib/types';
import {
  ShieldAlert,
  BarChart3,
  Scissors,
  Truck,
  Palette,
  Users2,
  Wallet,
  Megaphone,
  CheckSquare,
  LogOut,
  UserCheck,
  ChevronDown,
  Layers,
  ArrowLeft,
  Settings,
  Clock,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

interface NavRoute {
  label: string;
  role: UserRole;
  path: string;
  icon: LucideIcon;
}

const DASHBOARD_ROUTES: NavRoute[] = [
  { label: 'Owner / Super Admin', role: 'owner', path: '/dashboard/owner', icon: ShieldAlert },
  { label: 'CEO Executive', role: 'ceo', path: '/dashboard/ceo', icon: BarChart3 },
  { label: 'Divisi Produksi', role: 'production', path: '/dashboard/production', icon: Scissors },
  { label: 'Divisi Sales & Distribusi', role: 'sales', path: '/dashboard/sales', icon: Truck },
  { label: 'Divisi Marketing', role: 'marketing', path: '/dashboard/marketing', icon: Palette },
  { label: 'Divisi HRD (31 Anggota)', role: 'hrd', path: '/dashboard/hrd', icon: Users2 },
  { label: 'Divisi Finance', role: 'finance', path: '/dashboard/finance', icon: Wallet },
  { label: 'Public Relations (PR)', role: 'pr', path: '/dashboard/pr', icon: Megaphone },
  { label: 'Dashboard Anggota', role: 'member', path: '/dashboard/member', icon: CheckSquare },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, loginAs, logout } = useCompanyStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // 1. Not Authenticated State
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-brand-lavender/40 p-8 shadow-sm space-y-4">
          <div className="flex justify-center">
            <OrvaxiaLogo size={48} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-brand-navy mt-4">
            Akses Portal Internal
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Halaman ini dikhususkan untuk <strong>Owner (Pemegang Kendali)</strong> dan <strong>Crew Anggota</strong> ORVAXIA COMPANY. Silakan masuk terlebih dahulu dengan email Anda.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/auth"
              className="w-full rounded-full bg-brand-slate py-3 text-xs font-bold text-white hover:bg-brand-navy transition-all shadow-sm"
            >
              Masuk Akun Owner / Crew
            </Link>
            <Link
              href="/"
              className="w-full rounded-full border border-slate-200 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Pending Approval State (Awaiting Owner Direction)
  if (currentUser.status === 'pending_approval') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200 p-8 shadow-sm space-y-4">
          <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Clock size={32} />
          </div>
          <div className="inline-block rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[11px] font-bold uppercase">
            Status: Menunggu Arahan Owner
          </div>
          <h2 className="font-serif text-2xl font-bold text-brand-navy">
            Halo, {currentUser.fullName}!
          </h2>
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-4 text-xs text-slate-700 text-left space-y-1.5">
            <p><strong>Email Pribadi:</strong> {currentUser.email}</p>
            <p><strong>Nomor WhatsApp:</strong> {currentUser.phone}</p>
            <p><strong>Minat Awal:</strong> {currentUser.division || 'Umum'}</p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Akun Anda telah berhasil terdaftar di sistem. Pemegang kendali website (<strong>Owner: rnefviie@gmail.com</strong>) saat ini sedang menetapkan divisi dan tugas operasional untuk Anda.
          </p>
          <p className="text-[11px] text-slate-500 italic">
            Silakan informasikan kepada Owner agar akun Anda segera disetujui. Setelah Owner menetapkan peran Anda, klik tombol di bawah untuk membuka dashboard.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-full bg-brand-slate py-3 text-xs font-bold text-white hover:bg-brand-navy transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Periksa Status Akun / Muat Ulang</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/auth');
              }}
              className="w-full rounded-full border border-slate-200 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Authenticated State
  const isOwner = currentUser.role === 'owner';

  const handleRoleSelect = (role: UserRole) => {
    loginAs(role);
    setRoleMenuOpen(false);
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-brand-navy flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4 shadow-xs">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <Link href="/">
              <OrvaxiaLogo size={32} />
            </Link>
            <Link
              href="/"
              className="text-[11px] font-semibold text-slate-400 hover:text-brand-slate"
              title="Kembali ke Website Utama"
            >
              <ArrowLeft size={16} />
            </Link>
          </div>

          {/* Current User Card */}
          <div className="mb-6 rounded-2xl bg-brand-surface/70 border border-brand-lavender/30 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-slate text-white font-bold text-xs shadow-inner">
                {currentUser.fullName.slice(0, 2).toUpperCase() || 'OV'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-brand-navy truncate">
                  {currentUser.fullName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`rounded-full px-2 py-0.2 text-[9px] font-bold uppercase ${
                      isOwner ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOwner ? '👑 Owner' : currentUser.role}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {currentUser.division || 'Internal'}
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-400 truncate mt-0.5" title={currentUser.email}>
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Owner Role Switcher Dropdown (Super Admin only) */}
            {isOwner && (
              <div className="relative mt-3">
                <button
                  type="button"
                  onClick={() => setRoleMenuOpen((o) => !o)}
                  className="w-full flex items-center justify-between rounded-xl bg-white border border-slate-200 py-1.5 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} className="text-brand-slate" /> Pratinjau Role Divisi
                  </span>
                  <ChevronDown size={13} />
                </button>

                {roleMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl max-h-72 overflow-y-auto">
                    <div className="p-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Uji Tampilan Sebagai Role:
                    </div>
                    {DASHBOARD_ROUTES.map((item) => (
                      <button
                        key={item.role}
                        onClick={() => handleRoleSelect(item.role)}
                        className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                          pathname === item.path
                            ? 'bg-brand-slate text-white font-bold'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {pathname === item.path && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links for Internal Dashboards */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 block mb-1">
              {isOwner ? 'Semua Divisi & Kontrol' : 'Menu Navigasi'}
            </span>
            {DASHBOARD_ROUTES.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.path;
              const isUserAssignedRole = currentUser.role === route.role;

              // Non-owner crew: show all or highlight user's assigned role
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-slate text-white shadow-sm'
                      : isUserAssignedRole
                      ? 'bg-brand-surface text-brand-slate font-bold border border-brand-lavender/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon size={16} />
                    <span className="truncate">{route.label}</span>
                  </div>
                  {isUserAssignedRole && !isActive && (
                    <span className="text-[9px] bg-brand-slate text-white px-1.5 py-0.2 rounded-md font-bold uppercase">
                      Tugas Anda
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft size={14} /> Ke Toko & Profil
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/auth');
            }}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={14} /> Keluar Akun
          </button>
        </div>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
