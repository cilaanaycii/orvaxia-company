'use client';

import React from 'react';
import Link from 'next/link';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { TeamRoster } from '@/components/team/TeamRoster';
import { ArrowLeft } from 'lucide-react';

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <header className="border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <Link href="/">
            <OrvaxiaLogo size={36} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-slate hover:text-brand-navy transition-colors"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-brand">Our Team</span>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
            OUR PEOPLE, OUR STRENGTH.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Meet the people behind ORVAXIA COMPANY.
          </p>
        </div>
        <TeamRoster />
      </div>

      <MagicNavigation />
    </main>
  );
}
