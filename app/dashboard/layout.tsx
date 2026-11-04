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
                {currentUser?.fullName.slice(0, 2).toUpperCase() || 'OV'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-brand-navy truncate">
                  {currentUser?.fullName || 'Pengguna Orvaxia'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[9px] font-bold uppercase">
                    {currentUser?.role || 'Guest'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {currentUser?.division || 'Internal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Switcher Pill */}
            <div className="relative mt-3">
              <button
                type="button"
                onClick={() => setRoleMenuOpen((o) => !o)}
                className="w-full flex items-center justify-between rounded-xl bg-white border border-slate-200 py-1.5 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-brand-slate" /> Ganti Peran Divisi
                </span>
                <ChevronDown size={13} />
              </button>

              {roleMenuOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl max-h-72 overflow-y-auto">
                  <div className="p-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Role Uji Operasional:
                  </div>
                  {DASHBOARD_ROUTES.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        currentUser?.role === item.role
                          ? 'bg-brand-slate text-white font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      {currentUser?.role === item.role && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links for Internal Dashboards */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 block mb-1">
              Menu Divisi & Manajemen
            </span>
            {DASHBOARD_ROUTES.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.path;

              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-slate text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate">{route.label}</span>
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
              router.push('/');
            }}
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
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
