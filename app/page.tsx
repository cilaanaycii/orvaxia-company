'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ImageIcon,
  Megaphone,
} from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';
import { Footer } from '@/components/navigation/Footer';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePublicContent } from '@/lib/content/use-public-content';

export default function HomePage() {
  const { products } = useCompanyStore();
  const { bySlug } = usePublicContent('home');
  const { content: prAnnouncements } = usePublicContent('announcement');

  const introduction = bySlug['home-introduction'];
  const rovella = products.find((p) => p.slug === 'rovella-3in1-tumbler-bag') || products[0];

  // Hanya tampilkan foto resmi dari Supabase Storage (tanpa foto AI generik atau placeholder palsu)
  const productHeroImage = rovella
    ? [...rovella.images, ...rovella.variants.map((v) => v.image || '')].find(
        (img) => img && img.includes('/storage/v1/object/public/orvaxia-images/')
      )
    : undefined;

  // Pengumuman resmi PR dari CMS: hanya tampil jika PR telah menerbitkan pengumuman aktif
  const activePrAnnouncement = prAnnouncements.find(
    (item) => item.status === 'published' && Boolean(item.title && item.body)
  );

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy selection:bg-brand-lavender/30 pb-24 md:pb-0">
      {/* 1. Pengumuman Resmi PR (Hanya dari CMS PR, tanpa teks statis) */}
      {activePrAnnouncement && (
        <aside
          aria-label="Pengumuman Resmi"
          className="bg-brand-surface border-b border-brand-lavender/25 px-4 py-2.5 text-center text-xs text-brand-navy"
        >
          <div className="mx-auto max-w-5xl flex items-center justify-center gap-2">
            <Megaphone size={14} className="text-brand-slate shrink-0" />
            <span className="font-semibold">{activePrAnnouncement.title}:</span>
            <span className="text-slate-600 line-clamp-1">{activePrAnnouncement.body}</span>
          </div>
        </aside>
      )}

      {/* 2. Header Navigasi Shell */}
      <TopNav />

      {/* 3. Hero Section — Bersih, Elegan, dan Proporsional */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-brand-lavender/20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Kolom Teks Hero */}
            <div className="space-y-6 lg:col-span-7">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-wide text-brand-slate">
                  Rovella by Orvaxia
                </p>

                <h1 className="font-display text-4xl font-bold leading-[1.15] text-brand-navy sm:text-5xl lg:text-6xl">
                  {introduction?.title || (
                    <>
                      Tas Tumbler Rajut <br className="hidden sm:inline" />
                      <span className="text-brand-slate">yang Fleksibel Menemani</span> Harimu.
                    </>
                  )}
                </h1>

                <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 font-normal">
                  {introduction?.body ||
                    'Orvaxia menghadirkan Rovella: tas tumbler rajut buatan tangan dengan konsep inovatif untuk melengkapi keseharianmu.'}
                </p>
              </div>

              {/* Kelompok CTA */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-7 py-3.5 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-brand-slate active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>{bySlug['home-shop-cta']?.title || 'Pesan Rovella Sekarang'}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-lavender/40 bg-white px-6 py-3.5 text-sm font-semibold text-brand-navy shadow-xs transition-all duration-150 hover:border-brand-slate hover:bg-brand-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>{bySlug['home-about-cta']?.title || 'Kenali Orvaxia'}</span>
                </Link>
              </div>
            </div>

            {/* Showcase Visual Hero — Bersih Tanpa Label / Badge Dekoratif */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-brand-lavender/30 bg-[#F4F2F7] shadow-xs">
                  {productHeroImage ? (
                    <Image
                      src={productHeroImage}
                      alt="Rovella by Orvaxia"
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover"
                    />
                  ) : (
                    /* Fallback Area Gambar Kosong Bersih & Minimalis */
                    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]">
                      <div className="space-y-3 max-w-xs">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-white text-brand-slate shadow-2xs">
                          <ImageIcon size={22} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-display text-sm font-semibold text-brand-navy">
                            Foto Produk Segera Hadir
                          </h3>
                          <p className="text-xs leading-relaxed text-slate-500">
                            Dokumentasi produk Rovella sedang disiapkan oleh tim.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Filosofi & Makna Orvaxia (Orbis + Axiom) */}
      <section className="py-16 sm:py-24 bg-white border-b border-brand-lavender/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="space-y-5 lg:col-span-5">
              <p className="text-xs font-semibold text-brand-slate">
                Filosofi Perusahaan
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Berangkat dari Prinsip, Tumbuh Melalui Kebersamaan.
              </h2>
              <p className="text-sm leading-7 text-slate-600 font-normal">
                Nama <strong>Orvaxia</strong> merupakan perpaduan dari <strong>Orbis</strong> (lingkaran persatuan dan peluang baru) serta <strong>Axiom</strong> (prinsip kebenaran dan integritas kerja).
              </p>
              <p className="text-sm leading-7 text-slate-600 font-normal">
                Setiap karya diproduksi dengan ketelitian dan komitmen untuk menghadirkan produk yang fungsional, estetik, dan berkualitas.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-navy underline-offset-4 hover:underline"
                >
                  Pelajari Visi & Struktur Lengkap Perusahaan <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Kolom Visual Makna Warna Identitas Orvaxia */}
            <div className="lg:col-span-7">
              <div className="rounded-[2rem] border border-brand-lavender/30 bg-[#FAF8F5] p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-display text-base font-semibold text-brand-navy">
                    Makna Warna Identitas Orvaxia
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Palet warna resmi yang mencerminkan harmoni, kehangatan, dan ketenangan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-1.5">
                    <div className="h-6 w-full rounded-md" style={{ backgroundColor: '#606C8D' }} />
                    <p className="text-xs font-semibold text-brand-navy pt-1">Slate</p>
                    <p className="text-[11px] leading-5 text-slate-600">Ketenangan emosional, kejernihan berpikir, dan stabilitas.</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-1.5">
                    <div className="h-6 w-full rounded-md" style={{ backgroundColor: '#A99AB3' }} />
                    <p className="text-xs font-semibold text-brand-navy pt-1">Lavender</p>
                    <p className="text-[11px] leading-5 text-slate-600">Relaksasi, intuisi, dan keseimbangan.</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-1.5">
                    <div className="h-6 w-full rounded-md" style={{ backgroundColor: '#FDF5AE' }} />
                    <p className="text-xs font-semibold text-brand-navy pt-1">Pastel Yellow</p>
                    <p className="text-[11px] leading-5 text-slate-600">Semangat kreatif, optimisme, dan keterbukaan.</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-1.5">
                    <div className="h-6 w-full rounded-md" style={{ backgroundColor: '#D0A9A0' }} />
                    <p className="text-xs font-semibold text-brand-navy pt-1">Dusty Peach</p>
                    <p className="text-[11px] leading-5 text-slate-600">Kehangatan, ketulusan hubungan, dan kepedulian.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Ajak Jelajahi Produk — Minimalis & Bersih Tanpa Banner PO Hardcoded */}
      <section className="py-16 sm:py-20 bg-[#FAF8F5]">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-navy">
            Temukan Koleksi Rovella
          </h2>
          <p className="text-sm leading-6 text-slate-600 max-w-md mx-auto font-normal">
            Koleksi tas tumbler rajut buatan tangan yang dirancang dengan fungsionalitas dan estetika harian.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-7 py-3 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-brand-slate active:scale-95"
            >
              <span>Kunjungi Toko</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer Resmi & Navigasi Mobile Dock */}
      <Footer />
      <MagicNavigation />
    </main>
  );
}
