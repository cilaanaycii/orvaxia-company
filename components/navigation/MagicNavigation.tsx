'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Building2, ShoppingBag, Users, Phone, type LucideIcon } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/company-store';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'about', label: 'About Company', icon: Building2, href: '/about' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, href: '/shop' },
  { id: 'team', label: 'Our Team', icon: Users, href: '/team' },
  { id: 'contact', label: 'Contact Company', icon: Phone, href: '/contact' },
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
    <aside aria-label="Navigasi Utama" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <nav aria-label="Floating Dock" className="relative flex items-center justify-around gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_16px_36px_rgba(26,34,56,0.18)] ring-1 ring-black/5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={(e) => handleNavClick(item, e)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 group ${
                isActive ? '-translate-y-3.5 text-white' : 'text-brand-slate hover:text-brand-navy hover:bg-black/5'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <span
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#606C8D] to-[#808CA8] shadow-[0_10px_20px_rgba(96,108,141,0.4)] ring-4 ring-white scale-100 opacity-100'
                    : 'scale-50 opacity-0 pointer-events-none'
                }`}
              />

              <span className="relative z-10 flex flex-col items-center">
                <Icon size={20} className="transition-transform duration-200 group-hover:scale-110" />
                <span
                  className={`text-[9px] font-medium tracking-tight mt-0.5 transition-opacity duration-200 ${
                    isActive ? 'opacity-100 text-white font-semibold' : 'opacity-80 text-brand-slate'
                  }`}
                >
                  {item.label}
                </span>
              </span>

              {item.id === 'shop' && totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E57373] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
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
