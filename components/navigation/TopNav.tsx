'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
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
  const { currentUser, cart } = useCompanyStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const accountHref = !currentUser
    ? '/login'
    : currentUser.role === 'customer'
      ? '/account'
      : `/dashboard/${currentUser.role}`;

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={34} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'relative px-3 py-2 text-sm font-semibold transition-colors',
                  isActive(href)
                    ? 'text-brand-navy'
                    : 'text-brand-slate hover:text-brand-navy',
                ].join(' ')}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-brand-navy" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="hidden items-center gap-1.5 rounded-full border border-brand-lavender/40 bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-navy transition hover:border-brand-slate sm:inline-flex"
              aria-label="Keranjang belanja"
            >
              <ShoppingBag size={15} />
              {cart.length > 0 && (
                <span className="font-bold text-brand-navy">{cart.length}</span>
              )}
            </Link>
            <Link
              href={accountHref}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-slate transition hover:border-brand-slate hover:text-brand-navy"
            >
              {currentUser ? 'Akun' : 'Login'}
            </Link>
            {/* Mobile hamburger */}
            <button
              type="button"
              className="ml-1 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-brand-slate transition hover:border-brand-slate md:hidden"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <nav
            className="border-t border-brand-lavender/20 bg-white px-4 pb-4 pt-2 md:hidden"
            aria-label="Navigasi mobile"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                  isActive(href)
                    ? 'bg-brand-surface text-brand-navy'
                    : 'text-brand-slate hover:bg-brand-surface/60 hover:text-brand-navy',
                ].join(' ')}
              >
                {label}
                {isActive(href) && (
                  <span className="h-2 w-2 rounded-full bg-brand-navy" />
                )}
              </Link>
            ))}
            <div className="mt-3 border-t border-brand-lavender/20 pt-3">
              <Link
                href={accountHref}
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-slate"
              >
                {currentUser ? 'Dashboard Akun' : 'Login'}
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
