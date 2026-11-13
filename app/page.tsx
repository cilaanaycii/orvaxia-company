'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Heart,
  Clock,
  Compass,
  Layers,
  Gift,
  Ruler,
  ImageIcon,
  Megaphone,
  Bell,
} from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';
import { Footer } from '@/components/navigation/Footer';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePublicContent } from '@/lib/content/use-public-content';

export default function HomePage() {
  const { products, poPeriod, currentUser, notifications } = useCompanyStore();
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const { bySlug } = usePublicContent('home');
  const { content: prAnnouncements } = usePublicContent('announcement');

  const introduction = bySlug['home-introduction'];
  const rovella = products.find((p) => p.slug === 'rovella-3in1-tumbler-bag') || products[0];

  // Hanya tampilkan foto resmi dari Supabase Storage (tanpa foto AI generik atau placeholder)
  const productHeroImage = rovella
    ? [...rovella.images, ...rovella.variants.map((v) => v.image || '')].find(
        (img) => img && img.includes('/storage/v1/object/public/orvaxia-images/')
      )
    : undefined;

  // Pengumuman resmi PR: hanya tampil jika PR telah menerbitkan pengumuman aktif
  const activePrAnnouncement = prAnnouncements.find(
    (item) => item.status === 'published' && Boolean(item.title && item.body)
  );

  const isPoActive = poPeriod.status === 'open' || poPeriod.status === 'closing_soon';
  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy selection:bg-brand-lavender/30 pb-24 md:pb-0">
      {/* 1. Pengumuman Resmi PR (Hanya tampil jika ada pengumuman terbit dari PR, tanpa dummy) */}
      {activePrAnnouncement && (
        <aside
          aria-label="Pengumuman Resmi PR"
          className="bg-brand-peach/20 border-b border-brand-peach/40 px-4 py-2.5 text-center text-xs text-brand-navy"
        >
          <div className="mx-auto max-w-6xl flex items-center justify-center gap-2">
            <Megaphone size={14} className="text-brand-slate shrink-0" />
            <span className="font-bold">{activePrAnnouncement.title}:</span>
            <span className="text-slate-700 line-clamp-1">{activePrAnnouncement.body}</span>
          </div>
        </aside>
      )}

      {/* 2. Header Navigasi Desktop & Mobile Shell */}
      <TopNav />

      {/* 3. Hero Section — Editorial Warm Lifestyle */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-brand-lavender/25 bg-white bg-grain">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Kolom Teks Hero */}
            <div className="space-y-6 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-brand">
                  <Sparkles size={12} className="text-brand-slate" />
                  ORVAXIA COMPANY
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-peach/40 bg-brand-peach/15 px-3 py-1 text-xs font-semibold text-brand-navy">
                  Karya Resmi SMKN 2 Buduran
                </span>
                <Link
                  href={currentUser ? '/inbox' : '/auth?tab=login&next=/inbox'}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/40 bg-white/90 px-3 py-1 text-xs font-semibold text-brand-slate shadow-xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                  title="Pusat komunikasi & notifikasi"
                >
                  <Bell size={12} className="text-brand-slate" />
                  <span>Inbox</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {unreadCount} baru
                    </span>
                  )}
                </Link>
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                  {introduction?.title || (
                    <>
                      Tas Tumbler Rajut <br className="hidden sm:inline" />
                      <span className="text-brand-slate">yang Fleksibel Menemani</span> Harimu.
                    </>
                  )}
                </h1>

                <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  {introduction?.body ||
                    'ORVAXIA menghadirkan ROVELLA: tas tumbler rajut buatan tangan dengan konsep inovatif untuk melengkapi keseharianmu.'}
                </p>
              </div>

              {/* Kelompok CTA */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-7 py-3.5 text-sm font-bold text-white shadow-brand-sm transition-all duration-200 hover:bg-brand-slate active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>{bySlug['home-shop-cta']?.title || 'Pesan ROVELLA Sekarang'}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-lavender/40 bg-white px-6 py-3.5 text-sm font-semibold text-brand-navy shadow-xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>{bySlug['home-about-cta']?.title || 'Kenali ORVAXIA'}</span>
                </Link>
              </div>

              {/* Tiga Pilar Singkat Hero (Hanya 3 Klaim Resmi) */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 max-w-lg">
                <div>
                  <span className="block font-display text-base font-bold text-brand-navy sm:text-lg">Fungsi 3-in-1</span>
                  <span className="block text-xs text-slate-500">Konsep ROVELLA</span>
                </div>
                <div>
                  <span className="block font-display text-base font-bold text-brand-navy sm:text-lg">Custom GRATIS</span>
                  <span className="block text-xs text-slate-500">Ukuran Botol</span>
                </div>
                <div>
                  <span className="block font-display text-base font-bold text-brand-navy sm:text-lg">Bonus GRATIS</span>
                  <span className="block text-xs text-slate-500">Gantungan Kunci Mini</span>
                </div>
              </div>
            </div>

            {/* Showcase Visual Hero */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Floating pill badge atas */}
                <div className="absolute -top-3 left-4 z-20 rounded-full border border-brand-lavender/35 bg-white/95 px-3.5 py-1.5 text-xs font-bold text-brand-navy shadow-brand-sm backdrop-blur-md">
                  ROVELLA by ORVAXIA
                </div>

                {/* Wadah Visual Utama */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] border border-brand-lavender/35 bg-[#F4F2F7] shadow-brand">
                  {productHeroImage ? (
                    <Image
                      src={productHeroImage}
                      alt="Rovella by ORVAXIA"
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover"
                    />
                  ) : (
                    /* Fallback Area Gambar Kosong yang Rapi & Bersih (Tanpa Monogram, Tanpa Gambar AI, Tanpa Dummy) */
                    <div className="flex h-full w-full flex-col items-center justify-between p-8 text-center bg-[#FAF8F5]/80">
                      <div className="w-full flex justify-end">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-brand-slate uppercase tracking-wider border border-brand-lavender/30 shadow-2xs">
                          Foto Resmi
                        </span>
                      </div>

                      <div className="space-y-3 my-auto max-w-xs">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-white text-brand-slate shadow-xs">
                          <ImageIcon size={26} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-display text-base font-bold text-brand-navy">
                            Foto Produk Resmi Segera Hadir
                          </h3>
                          <p className="text-xs leading-relaxed text-slate-600">
                            Foto produk ROVELLA sedang disiapkan oleh tim produksi SMKN 2 Buduran.
                          </p>
                        </div>
                      </div>

                      {/* Swatch Palet Warna Brand Resmi */}
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: '#606C8D' }} title="Bru Slate" />
                        <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: '#A99AB3' }} title="Lavender" />
                        <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: '#FDF5AE' }} title="Pastel Yellow" />
                        <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: '#D0A9A0' }} title="Dusty Peach" />
                      </div>
                    </div>
                  )}

                  {/* Floating pill status PO bawah */}
                  <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between rounded-2xl border border-white/80 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isPoActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className="text-xs font-bold text-brand-navy">
                        {isPoActive ? 'Pre-Order Dibuka' : 'Pre-Order Ditutup'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-brand-slate">
                      Estimasi {poPeriod.productionEstimateDays} hari kerja
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Introduction — Tiga Klaim Resmi ROVELLA */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <span className="badge-brand">
              <Layers size={13} className="text-brand-slate" />
              Keunggulan Resmi ROVELLA
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              Tiga Nilai Utama di Setiap Pesanan.
            </h2>
            <p className="text-sm leading-6 text-slate-600 sm:text-base">
              ORVAXIA menghadirkan ROVELLA dengan komitmen kejujuran produk dan kepuasan setiap pemesan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Klaim Resmi 1: Custom Ukuran Botol GRATIS */}
            <div className="rounded-[1.75rem] border border-brand-lavender/30 bg-white p-7 shadow-xs card-interactive flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface text-brand-slate">
                  <Ruler size={24} />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-navy">
                  Custom Ukuran Botol GRATIS
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  Pembeli dapat menyesuaikan ukuran tas rajut dengan diameter dan tinggi botol minum tanpa biaya tambahan.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-brand-slate flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Bebas biaya tambahan
              </div>
            </div>

            {/* Klaim Resmi 2: Fungsi 3-in-1 */}
            <div className="rounded-[1.75rem] border border-brand-lavender/30 bg-white p-7 shadow-xs card-interactive flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface text-brand-slate">
                  <Layers size={24} />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-navy">
                  Fungsi 3-in-1
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  Satu produk rajutan dengan tiga fungsi sesuai konsep ROVELLA untuk menemani berbagai aktivitas harianmu.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-brand-slate flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Konsep resmi ROVELLA
              </div>
            </div>

            {/* Klaim Resmi 3: Bonus Gantungan Kunci Mini GRATIS */}
            <div className="rounded-[1.75rem] border border-brand-lavender/30 bg-white p-7 shadow-xs card-interactive flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface text-brand-slate">
                  <Gift size={24} />
                </div>
                <h3 className="font-display text-xl font-bold text-brand-navy">
                  Bonus Gantungan Kunci Mini GRATIS
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  Setiap pemesan produk ROVELLA langsung mendapatkan bonus gantungan kunci mini sebagai pelengkap spesial.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-brand-slate flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Termasuk di setiap pesanan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why ORVAXIA — Prinsip Orbis & Axiom */}
      <section className="py-16 sm:py-24 bg-white border-y border-brand-lavender/25 bg-grain">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="space-y-6 lg:col-span-5">
              <span className="badge-brand">
                <Compass size={13} className="text-brand-slate" />
                Filosofi Perusahaan
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Berangkat dari Prinsip, Tumbuh Melalui Kebersamaan.
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                Nama <strong>ORVAXIA</strong> merupakan perpaduan dari <strong>Orbis</strong> (lingkaran persatuan dan peluang baru) serta <strong>Axiom</strong> (prinsip kebenaran dan integritas kerja).
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4">
                  <ShieldCheck size={20} className="text-brand-slate shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">Integritas dan Ketelitian</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Setiap helai rajutan diproduksi teliti oleh 31 anggota kru SMKN 2 Buduran dengan kendali mutu terukur.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4">
                  <Heart size={20} className="text-brand-slate shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">Kolaborasi dan Kepedulian</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Memberikan layanan transparan, etis, dan berfokus penuh pada kepuasan pelanggan di setiap pesanan.</p>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-navy underline-offset-4 hover:underline"
                >
                  Pelajari Visi & Struktur Lengkap Perusahaan <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Kolom Visual Nilai & Swatch Palet Warna Brand Resmi */}
            <div className="lg:col-span-7">
              <div className="rounded-[2.25rem] border border-brand-lavender/35 bg-[#FAF8F5] p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-navy">
                    Makna Warna Identitas ORVAXIA
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Setiap warna memiliki tujuan psikologis yang menenangkan dan ramah dalam interaksi visual.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="h-10 rounded-xl flex items-center justify-end px-3 text-white text-[11px] font-mono font-bold" style={{ backgroundColor: '#606C8D' }}>
                      #606C8D
                    </div>
                    <p className="text-xs font-bold text-brand-navy">Bru Slate</p>
                    <p className="text-[11px] leading-5 text-slate-600">Melambangkan ketenangan emosional, pemikiran jernih, dan stabilitas profesional.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="h-10 rounded-xl flex items-center justify-end px-3 text-brand-navy text-[11px] font-mono font-bold" style={{ backgroundColor: '#A99AB3' }}>
                      #A99AB3
                    </div>
                    <p className="text-xs font-bold text-brand-navy">Lavender</p>
                    <p className="text-[11px] leading-5 text-slate-600">Memberikan kesan relaksasi, intuisi, kelembutan, dan keseimbangan batin.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="h-10 rounded-xl flex items-center justify-end px-3 text-brand-navy text-[11px] font-mono font-bold" style={{ backgroundColor: '#FDF5AE' }}>
                      #FDF5AE
                    </div>
                    <p className="text-xs font-bold text-brand-navy">Pastel Yellow</p>
                    <p className="text-[11px] leading-5 text-slate-600">Melambangkan pencerahan, optimisme, dan semangat kreatif menyambut peluang baru.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="h-10 rounded-xl flex items-center justify-end px-3 text-white text-[11px] font-mono font-bold" style={{ backgroundColor: '#D0A9A0' }}>
                      #D0A9A0
                    </div>
                    <p className="text-xs font-bold text-brand-navy">Dusty Peach</p>
                    <p className="text-[11px] leading-5 text-slate-600">Menggambarkan kehangatan, ketulusan hubungan, keramahan, dan kepedulian.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pre-Order & Product CTA — Data Aktual Store */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="rounded-[2.25rem] border border-brand-lavender/35 bg-white p-6 sm:p-10 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              <div className="space-y-4 lg:col-span-8">
                <div className="flex items-center gap-2">
                  <span className="badge-brand">
                    <Clock size={12} className="text-brand-slate" />
                    Status Pre-Order Terkini
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      isPoActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {isPoActive ? 'Periode Pemesanan Aktif' : 'Pemesanan Ditutup'}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-navy">
                  {poPeriod.title}
                </h3>

                {poPeriod.announcement && (
                  <p className="text-sm leading-6 text-slate-600 max-w-2xl">
                    {poPeriod.announcement}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Jadwal Pre-Order:</span>
                    <span className="font-semibold text-brand-navy">
                      {dateFormatter.format(new Date(poPeriod.startsAt))} – {dateFormatter.format(new Date(poPeriod.endsAt))}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Estimasi Produksi:</span>
                    <span className="font-semibold text-brand-navy">
                      {poPeriod.productionEstimateDays} hari kerja
                    </span>
                  </div>
                  {poPeriod.quota > 0 && (
                    <div>
                      <span className="text-slate-400 block">Kuota Pemesanan:</span>
                      <span className="font-semibold text-brand-navy">
                        {poPeriod.orderedCount} / {poPeriod.quota} pesanan
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Aksi CTA Menuju Katalog Shop */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-brand-sm transition-all duration-200 hover:bg-brand-slate active:scale-95 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>Buka Katalog & Pesan</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  href="/order-tracking"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-xs font-semibold text-brand-navy transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface active:scale-95 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                >
                  <span>Lacak Status Pesanan</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer Resmi & Navigasi Dock Mobile */}
      <Footer />
      <MagicNavigation />
    </main>
  );
}
