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
  ChevronDown,
  Layers,
  ArrowLeft,
  Clock,
  RefreshCw,
  Bell,
  UserRound,
  MoreVertical,
  X,
  type LucideIcon,
} from 'lucide-react';

interface NavRoute {
  label: string;
  role: UserRole;
  path: string;
  icon: LucideIcon;
}

const DASHBOARD_ROUTES: NavRoute[] = [
  { label: 'Owner', role: 'owner', path: '/dashboard/owner', icon: ShieldAlert },
  { label: 'CEO Executive', role: 'ceo', path: '/dashboard/ceo', icon: BarChart3 },
  { label: 'Divisi Produksi', role: 'production', path: '/dashboard/production', icon: Scissors },
  { label: 'Divisi Sales & Distribusi', role: 'sales', path: '/dashboard/sales', icon: Truck },
  { label: 'Divisi Marketing', role: 'marketing', path: '/dashboard/marketing', icon: Palette },
  { label: 'Divisi HRD', role: 'hrd', path: '/dashboard/hrd', icon: Users2 },
  { label: 'Divisi Finance', role: 'finance', path: '/dashboard/finance', icon: Wallet },
  { label: 'Public Relations', role: 'pr', path: '/dashboard/pr', icon: Megaphone },
  { label: 'Dashboard Anggota', role: 'member', path: '/dashboard/member', icon: CheckSquare },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    isAuthReady,
    logout,
    notifications,
  } = useCompanyStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 0. Loading Authentication State
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-brand-navy">
        <div className="max-w-md w-full bg-white rounded-3xl border border-brand-lavender/35 p-8 shadow-xs space-y-4">
          <div className="flex justify-center">
            <OrvaxiaLogo size={48} />
          </div>
          <div className="flex justify-center pt-2">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-slate border-t-transparent" />
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Memulihkan sesi akun Orvaxia...
          </p>
        </div>
      </div>
    );
  }

  // 1. Not Authenticated State
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-brand-navy">
        <div className="max-w-md w-full bg-white rounded-3xl border border-brand-lavender/35 p-8 shadow-xs space-y-4">
          <div className="flex justify-center">
            <OrvaxiaLogo size={48} />
          </div>
          <h2 className="font-display text-2xl font-bold text-brand-navy mt-4">
            Akses Portal Internal
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Halaman ini dikhususkan untuk <strong>Owner</strong> dan <strong>anggota tim</strong> Orvaxia. Silakan masuk terlebih dahulu dengan email Anda.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/auth?tab=login"
              className="w-full rounded-full bg-brand-navy py-3 text-xs font-semibold text-white hover:bg-brand-slate active:scale-95 transition-all shadow-xs"
            >
              Masuk Akun Tim
            </Link>
            <Link
              href="/"
              className="w-full rounded-full border border-brand-lavender/40 py-3 text-xs font-medium text-slate-600 hover:bg-brand-surface hover:text-brand-navy active:scale-95 transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'customer') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-brand-navy">
        <div className="max-w-md rounded-3xl border border-brand-lavender/35 bg-white p-8 shadow-xs">
          <h2 className="font-display text-2xl font-bold text-brand-navy">Portal Tim</h2>
          <p className="mt-2 text-sm text-slate-600">Akun pelanggan tidak memiliki akses ke dashboard internal.</p>
          <Link
            href="/account"
            className="mt-5 inline-flex rounded-full bg-brand-navy px-5 py-3 text-xs font-semibold text-white hover:bg-brand-slate active:scale-95 transition-all"
          >
            Kembali ke Area Akun Pelanggan
          </Link>
        </div>
      </div>
    );
  }

  // 2. Pending Approval State
  if (currentUser.status === 'pending_approval') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-brand-navy">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200/80 p-8 shadow-xs space-y-4">
          <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
            <Clock size={32} />
          </div>
          <div className="inline-block rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-medium">
            Status: Menunggu Persetujuan
          </div>
          <h2 className="font-display text-2xl font-bold text-brand-navy">
            Halo, {currentUser.fullName}
          </h2>
          <div className="rounded-2xl bg-[#FAF8F5] border border-amber-200/60 p-4 text-xs text-slate-700 text-left space-y-1.5">
            <p><span className="text-slate-400">Email:</span> {currentUser.email}</p>
            <p><span className="text-slate-400">WhatsApp:</span> {currentUser.phone}</p>
            <p><span className="text-slate-400">Minat Awal:</span> {currentUser.division || 'Umum'}</p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Akun Anda telah terdaftar. Tim pimpinan sedang menetapkan divisi dan tugas operasional untuk Anda.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-full bg-brand-navy py-3 text-xs font-semibold text-white hover:bg-brand-slate active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Periksa Status Akun</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/auth?tab=login');
              }}
              className="w-full rounded-full border border-slate-200 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
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
  const isExecutive = isOwner || currentUser.role === 'ceo';
  const isContentManagementRoute = pathname.startsWith('/dashboard/pr/content');

  if (
    isContentManagementRoute &&
    !isExecutive &&
    (currentUser.role !== 'pr' || currentUser.status !== 'active')
  ) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-center text-brand-navy">
        <div className="max-w-md rounded-3xl border border-brand-lavender/35 bg-white p-8 shadow-xs">
          <h2 className="font-display text-2xl font-bold text-brand-navy">Akses CMS Dibatasi</h2>
          <p className="mt-2 text-sm text-slate-600">
            Hanya Public Relations (PR) aktif, CEO, dan Owner yang dapat mengelola konten publik.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-full bg-brand-navy px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-slate active:scale-95 transition-all"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const visibleRoutes = isExecutive
    ? DASHBOARD_ROUTES
    : DASHBOARD_ROUTES.filter((route) => route.role === currentUser.role);

  const requestedRoute = DASHBOARD_ROUTES.find((route) => route.path === pathname);
  if (!isExecutive && requestedRoute && requestedRoute.role !== currentUser.role) {
    const assignedRoute = DASHBOARD_ROUTES.find((route) => route.role === currentUser.role);
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center text-brand-navy">
        <div className="max-w-md rounded-3xl border border-brand-lavender/35 bg-white p-8 shadow-xs">
          <h2 className="font-display text-2xl font-bold text-brand-navy">Akses Dashboard Dibatasi</h2>
          <p className="mt-2 text-sm text-slate-600">
            Anggota tim hanya dapat membuka dashboard sesuai tugas divisi masing-masing. Akses lintas divisi hanya untuk CEO dan Owner.
          </p>
          {assignedRoute && (
            <Link
              href={assignedRoute.path}
              className="mt-5 inline-flex rounded-full bg-brand-navy px-5 py-3 text-xs font-semibold text-white hover:bg-brand-slate active:scale-95 transition-all"
            >
              Buka Dashboard Tugas Saya
            </Link>
          )}
        </div>
      </div>
    );
  }

  const handleRoleSelect = (role: UserRole) => {
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    router.push(`/dashboard/${role}`);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-brand-navy flex flex-col md:flex-row antialiased">
      {/* ================= MOBILE HEADER ================= */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-lavender/30 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Kembali ke Beranda" className="transition-transform active:scale-95">
            <OrvaxiaLogo size={30} />
          </Link>
          <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-medium text-brand-slate border border-brand-lavender/30">
            {isOwner ? 'Owner' : currentUser.role}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/inbox"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-brand-surface active:scale-95 transition-colors"
            aria-label={`Buka Inbox (${unreadNotificationCount} baru)`}
            title="Inbox Notifikasi"
          >
            <Bell size={18} className="text-brand-slate" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {unreadNotificationCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu navigasi dashboard"
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-navy hover:bg-brand-surface active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* ================= MOBILE SIDE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <aside
            id="dashboard-mobile-drawer"
            aria-label="Menu navigasi mobile dashboard"
            className="fixed inset-y-0 right-0 z-50 flex h-full w-72 sm:w-80 max-w-[85vw] flex-col justify-between overflow-x-hidden bg-white p-5 shadow-2xl transition-transform duration-200 ease-out"
          >
            <div className="flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <OrvaxiaLogo size={26} />
                  <span className="font-display text-sm font-semibold text-brand-navy">
                    Panel Orvaxia
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Tutup menu navigasi"
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-navy active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="my-4 rounded-2xl border border-brand-lavender/30 bg-brand-surface/70 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white shadow-inner">
                    <UserRound size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-brand-navy">
                      {currentUser.fullName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium border border-brand-lavender/40 bg-white text-brand-slate">
                        {isOwner ? 'Owner' : currentUser.role}
                      </span>
                      <span className="truncate text-[10px] text-slate-500">
                        {currentUser.division || 'Internal'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <span className="block px-2 py-1 text-xs text-slate-400 font-medium">
                  Menu Utama
                </span>

                <Link
                  href="/inbox"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    pathname === '/inbox'
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'text-slate-700 hover:bg-brand-surface hover:text-brand-navy active:scale-[0.98]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bell size={16} className={pathname === '/inbox' ? 'text-white' : 'text-brand-slate'} />
                    <span>Inbox & Notifikasi</span>
                  </span>
                  {unreadNotificationCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadNotificationCount} baru
                    </span>
                  )}
                </Link>

                <div className="my-2 border-t border-slate-100" />

                <span className="block px-2 py-1 text-xs text-slate-400 font-medium">
                  {isExecutive ? 'Akses Divisi' : 'Divisi Anda'}
                </span>

                {visibleRoutes.map((route) => {
                  const Icon = route.icon;
                  const isActive = pathname === route.path;

                  return (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-navy text-white shadow-xs'
                          : 'text-slate-700 hover:bg-brand-surface hover:text-brand-navy active:scale-[0.98]'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-white' : 'text-brand-slate shrink-0'} />
                      <span className="truncate">{route.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Role Switcher for Executive */}
              {isExecutive && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-xl border border-brand-lavender/30 bg-brand-surface/60 px-3 py-2 text-xs font-medium text-brand-slate hover:bg-brand-surface transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Layers size={13} />
                      <span>Uji Tampilan Role</span>
                    </span>
                    <ChevronDown size={13} className={roleMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>

                  {roleMenuOpen && (
                    <div className="mt-1.5 space-y-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                      {DASHBOARD_ROUTES.map((item) => (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => handleRoleSelect(item.role)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs ${
                            pathname === item.path
                              ? 'bg-brand-navy font-medium text-white'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {pathname === item.path && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Bottom */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-brand-surface hover:text-brand-navy transition-colors"
              >
                <ArrowLeft size={14} className="text-brand-slate" />
                <span>Ke Beranda Website</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  router.push('/auth?tab=login');
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={14} />
                <span>Keluar Akun</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex relative w-64 shrink-0 flex-col justify-between border-r border-brand-lavender/30 bg-white p-4 shadow-xs min-h-screen">
        <div className="space-y-4">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <Link href="/" aria-label="Orvaxia Home" className="transition-transform active:scale-95">
              <OrvaxiaLogo size={32} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-brand-lavender/30 bg-[#FAF8F5] px-2.5 py-1 text-xs font-medium text-brand-slate hover:border-brand-slate hover:bg-white hover:text-brand-navy transition-all"
              title="Kembali ke Website Utama"
            >
              <ArrowLeft size={12} />
              <span>Web</span>
            </Link>
          </div>

          {/* Account Profile Card */}
          <div className="rounded-2xl border border-brand-lavender/30 bg-brand-surface/70 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white shadow-inner">
                <UserRound size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-brand-navy">
                  {currentUser.fullName}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium border border-brand-lavender/40 bg-white text-brand-slate">
                    {isOwner ? 'Owner' : currentUser.role}
                  </span>
                  <span className="truncate text-[10px] text-slate-500">
                    {currentUser.division || 'Internal'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-slate-400" title={currentUser.email}>
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          {/* Executive Role Switcher */}
          {isExecutive && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-brand-lavender/30 bg-brand-surface/60 px-3 py-2 text-xs font-medium text-brand-slate hover:bg-brand-surface transition-colors active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <Layers size={13} />
                  <span>Uji Tampilan Role</span>
                </span>
                <ChevronDown size={13} className={roleMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {roleMenuOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <div className="px-2 py-1 text-xs text-slate-400 font-medium">
                    Pilih Role Divisi:
                  </div>
                  {DASHBOARD_ROUTES.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleRoleSelect(item.role)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                        pathname === item.path
                          ? 'bg-brand-navy font-medium text-white'
                          : 'text-slate-700 hover:bg-brand-surface'
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

          {/* Desktop Navigation Links */}
          <nav className="space-y-1">
            <span className="block px-2 text-xs text-slate-400 font-medium">
              Menu Utama
            </span>

            <Link
              href="/inbox"
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                pathname === '/inbox'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-slate-600 hover:bg-brand-surface hover:text-brand-navy active:scale-[0.98]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Bell size={15} className={pathname === '/inbox' ? 'text-white' : 'text-brand-slate'} />
                <span>Inbox</span>
              </span>
              {unreadNotificationCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadNotificationCount} baru
                </span>
              )}
            </Link>

            <div className="my-2 border-t border-slate-100" />

            <span className="block px-2 text-xs text-slate-400 font-medium">
              {isExecutive ? 'Semua Divisi & Kontrol' : 'Menu Divisi'}
            </span>

            {visibleRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.path;
              const isUserAssignedRole = currentUser.role === route.role;

              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-xs'
                      : isUserAssignedRole
                      ? 'border border-brand-lavender/30 bg-brand-surface text-brand-slate font-medium'
                      : 'text-slate-600 hover:bg-brand-surface hover:text-brand-navy active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon size={15} className={isActive ? 'text-white' : 'text-brand-slate shrink-0'} />
                    <span className="truncate">{route.label}</span>
                  </div>
                  {isUserAssignedRole && !isActive && (
                    <span className="rounded-md bg-brand-navy px-1.5 py-0.5 text-[10px] text-white">
                      Tugas Anda
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Footer Actions */}
        <div className="border-t border-slate-100 pt-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-brand-surface hover:text-brand-navy transition-colors"
          >
            <ArrowLeft size={14} className="text-brand-slate" />
            <span>Ke Toko & Profil</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/auth?tab=login');
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors active:scale-[0.98]"
          >
            <LogOut size={14} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN DASHBOARD WORKSPACE ================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
