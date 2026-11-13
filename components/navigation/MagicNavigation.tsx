'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, ShoppingBag, Users, Phone, type LucideIcon } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/company-store';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'about', label: 'About', icon: Compass, href: '/about' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, href: '/shop' },
  { id: 'team', label: 'Team', icon: Users, href: '/team' },
  { id: 'contact', label: 'Contact', icon: Phone, href: '/contact' },
];

export function MagicNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCompanyStore();
  const [activeId, setActiveId] = useState('home');

  useEffect(() => {
    if (pathname === '/') setActiveId('home');
    else if (pathname.startsWith('/about')) setActiveId('about');
    else if (pathname.startsWith('/shop') || pathname.startsWith('/checkout')) setActiveId('shop');
    else if (pathname.startsWith('/team')) setActiveId('team');
    else if (pathname.startsWith('/contact')) setActiveId('contact');
    else setActiveId('');
  }, [pathname]);

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveId(item.id);
    router.push(item.href);
  };

  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <aside
      aria-label="Navigasi Utama Mobile"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto md:hidden w-[min(22rem,calc(100vw-1.5rem))]"
    >
      <nav
        aria-label="Floating Mobile Dock"
        className="flex items-center justify-between px-2 py-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-brand-lavender/35 shadow-dock ring-1 ring-black/5"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={(e) => handleNavClick(item, e)}
              className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-full transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate ${
                isActive
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-brand-slate hover:text-brand-navy active:scale-95'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon size={17} className="transition-transform duration-150" />
              <span
                className={`text-[9px] font-semibold tracking-tight mt-0.5 leading-none ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>

              {item.id === 'shop' && totalCartCount > 0 && (
                <span className="absolute -top-1 -right-0.5 z-20 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs ring-2 ring-white">
                  {totalCartCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
