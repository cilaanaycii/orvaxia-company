'use client';

import React from 'react';
import { Sparkles, Users2 } from 'lucide-react';
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 space-y-10">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <span className="badge-brand">
            <Users2 size={13} className="text-brand-slate" />
            Kru & Anggota Tim
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-navy sm:text-5xl">
            Sinergi 31 Anggota ORVAXIA
          </h1>
          <p className="text-xs leading-6 text-slate-600 sm:text-sm">
            Mengenal para siswa-siswi SMKN 2 Buduran di balik setiap proses perancangan, produksi, promosi, dan pelayanan produk ROVELLA.
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
