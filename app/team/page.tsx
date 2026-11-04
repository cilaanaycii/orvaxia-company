'use client';

import React from 'react';
import Link from 'next/link';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { OrgStructureTree } from '@/components/team/OrgStructureTree';
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

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 py-10 space-y-16">
        <div className="text-center max-w-xl mx-auto">
          <span className="badge-brand">Tim Profesional ORVAXIA</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy mt-2">
            31 Anggota Resmi Perusahaan
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Struktur organisasi lengkap dan peran aktif setiap anggota dalam menghadirkan produk dan layanan terbaik.
          </p>
        </div>

        <OrgStructureTree />

        <div className="border-t border-slate-200 pt-10">
          <TeamRoster />
        </div>
      </div>

      <MagicNavigation />
    </main>
  );
}
