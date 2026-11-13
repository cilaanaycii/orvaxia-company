'use client';

import React from 'react';
import { TeamRoster } from '@/components/team/TeamRoster';
import { TopNav } from '@/components/navigation/TopNav';
import { Footer } from '@/components/navigation/Footer';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy pb-24 md:pb-0">
      {/* 1. Header Navigasi Shell */}
      <TopNav />

      {/* 2. Konten Roster Anggota */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 space-y-8">
        <div className="mx-auto max-w-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-brand-slate">
            Anggota Perusahaan
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Tim Orvaxia
          </h1>
          <p className="text-xs leading-6 text-slate-600 sm:text-sm font-normal">
            Mengenal para personil di balik perancangan, produksi, promosi, dan pelayanan produk Rovella.
          </p>
        </div>

        <TeamRoster />
      </div>

      {/* 3. Footer Shell & Mobile Dock */}
      <Footer />
      <MagicNavigation />
    </main>
  );
}
