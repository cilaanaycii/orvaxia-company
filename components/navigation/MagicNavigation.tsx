'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Building2, ShoppingBag, Users, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/company-store';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  isSection?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/#home', isSection: true },
  { id: 'profile', label: 'Profile', icon: Building2, href: '/#about', isSection: true },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, href: '/#shop', isSection: true },
  { id: 'team', label: 'Team', icon: Users, href: '/#team', isSection: true },
  { id: 'portal', label: 'Portal', icon: ShieldCheck, href: '/dashboard' },
];

export function MagicNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, currentUser } = useCompanyStore();
  const [activeId, setActiveId] = useState('home');

  // ScrollSpy to detect which section is currently in view when on the home page
  useEffect(() => {
    if (pathname !== '/') {
      if (pathname.startsWith('/dashboard')) setActiveId('portal');
      else if (pathname.startsWith('/shop') || pathname.startsWith('/checkout') || pathname.startsWith('/cart')) setActiveId('shop');
      else if (pathname.startsWith('/team')) setActiveId('team');
      else setActiveId('');
      return;
    }

    const sections = ['home', 'about', 'shop', 'team'];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 260; // offset for detection
      for (let i = sections.length - 1; i >= 0; i--) {
        const secId = sections[i];
        const el = document.getElementById(secId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            if (secId === 'about') setActiveId('profile');
            else setActiveId(secId);
            return;
          }
        }
      }
      setActiveId('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    e.preventDefault();

    if (item.id === 'portal') {
      setActiveId('portal');
      if (currentUser && currentUser.role !== 'customer') {
        router.push(`/dashboard/${currentUser.role}`);
      } else {
        router.push('/dashboard');
      }
      return;
    }

    if (pathname === '/' && item.isSection) {
      const targetId = item.id === 'profile' ? 'about' : item.id;
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 70;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        setActiveId(item.id);
      }
    } else {
      setActiveId(item.id);
      router.push(item.href);
    }
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
              {/* Raised Circle Indicator */}
              <span
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#606C8D] to-[#808CA8] shadow-[0_10px_20px_rgba(96,108,141,0.4)] ring-4 ring-white scale-100 opacity-100'
                    : 'scale-50 opacity-0 pointer-events-none'
                }`}
              />

              {/* Icon */}
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

              {/* Shop Badge */}
              {item.id === 'shop' && totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E57373] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                  {totalCartCount}
                </span>
              )}

              {/* Portal Role Indicator */}
              {item.id === 'portal' && currentUser && (
                <span className="absolute -top-1 -right-1 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 shadow-sm ring-2 ring-white" title={`Role: ${currentUser.role}`} />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
