'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, UserRound, Bell } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';

interface NavLinkItem {
  href: string;
  label: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/shop', label: 'Shop' },
  { href: '/team', label: 'Our Team' },
  { href: '/contact', label: 'Contact' },
];

export function TopNav() {
  const pathname = usePathname();
  const { currentUser, cart, notifications } = useCompanyStore();

  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  const accountHref = !currentUser
    ? '/login'
    : currentUser.role === 'customer'
      ? '/account'
      : `/dashboard/${currentUser.role}`;

  const accountLabel = !currentUser
    ? 'Masuk'
    : currentUser.role === 'customer'
      ? 'Akun'
      : 'Dashboard';

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-lavender/25 bg-[#FAF8F5]/90 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Brand Logo */}
        <Link
          href="/"
          aria-label="ORVAXIA Home"
          className="transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate rounded-lg"
        >
          <OrvaxiaLogo size={32} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-1 rounded-full border border-brand-lavender/30 bg-white/80 p-1 shadow-xs md:flex"
          aria-label="Navigasi desktop utama"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate ${
                  active
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'text-brand-slate hover:bg-brand-surface/70 hover:text-brand-navy active:scale-95'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right-Side Actions (Cart & Account) */}
        <div className="flex items-center gap-2">
          {/* Inbox Shortcut */}
          <Link
            href={currentUser ? '/inbox' : '/auth?tab=login&next=/inbox'}
            className="relative inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/35 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            aria-label="Pusat notifikasi dan inbox"
            title="Pusat Notifikasi dan Inbox"
          >
            <Bell size={14} className="text-brand-slate shrink-0" />
            <span className="hidden sm:inline">Inbox</span>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Cart Action */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/35 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            aria-label={`Keranjang belanja: ${totalCartCount} item`}
          >
            <ShoppingBag size={14} className="text-brand-slate shrink-0" />
            <span className="hidden sm:inline">Keranjang</span>
            {totalCartCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-slate px-1 text-[10px] font-bold text-white">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* Account / Login Action */}
          <Link
            href={accountHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-brand-slate active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            aria-label={currentUser ? `Menu ${accountLabel}` : 'Masuk ke akun'}
          >
            <UserRound size={13} className="shrink-0" />
            <span>{accountLabel}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
