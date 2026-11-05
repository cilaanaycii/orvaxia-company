'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { POStatusBanner } from '@/components/shop/POStatusBanner';
import { ProductShowcase } from '@/components/shop/ProductShowcase';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  Users,
  MapPin,
  Phone,
  Mail,
  Instagram,
  ShoppingBag,
  ChevronDown,
  UserRound,
} from 'lucide-react';

export default function HomePage() {
  const { siteSettings, gallery, faqs, cart, currentUser } = useCompanyStore();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-28 text-brand-navy selection:bg-brand-lavender/30 sm:pb-32">
      <section
        id="home"
        className="relative overflow-hidden border-b border-brand-lavender/20 bg-white pt-4 pb-10 sm:pt-6 sm:pb-14"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-slate via-brand-lavender to-brand-peach" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-8 flex items-center justify-between border-b border-brand-lavender/20 pb-4 sm:mb-12 sm:pb-6">
            <OrvaxiaLogo size={40} />

            <div className="flex items-center gap-4">
              <Link
                href="/checkout"
                className="relative hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-brand-slate shadow-xs hover:border-brand-slate hover:text-brand-navy transition-all"
              >
                <ShoppingBag size={15} />
                <span>Keranjang ({cart.length})</span>
              </Link>
              <Link
                href={currentUser && currentUser.role !== 'customer' ? `/dashboard/${currentUser.role}` : '/auth'}
                aria-label="Akun"
                title="Akun"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-lavender/40 bg-white text-brand-slate shadow-sm transition-all hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy"
              >
                <UserRound size={19} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="max-w-3xl space-y-5 sm:space-y-6">
            <div className="inline-flex rounded-full border border-brand-lavender/40 bg-brand-surface/50 px-3 py-1 text-[10px] font-semibold tracking-wide text-brand-slate sm:text-xs">
              RAJUTAN TANGAN · SIDOARJO
            </div>

            <h1 className="font-serif text-[2.15rem] font-bold leading-[1.12] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                Teman praktis untuk tumbler harianmu.
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                Rovella adalah tas tumbler rajut 3-in-1 yang bisa dilipat menjadi pouch atau gantungan kunci.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <a
                  href="#shop"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-slate sm:w-fit"
                >
                  <ShoppingBag size={17} /> Lihat Rovella
                </a>
                <a
                  href="#about"
                  className="py-2 text-center text-sm font-medium text-brand-slate underline-offset-4 hover:underline sm:text-left"
                >
                  Tentang Orvaxia
                </a>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
                <span>3 fungsi dalam satu tas</span>
                <span className="text-brand-lavender">·</span>
                <span>Dibuat dengan tangan</span>
                <span className="text-brand-lavender">·</span>
                <span>Ukuran bisa disesuaikan</span>
              </div>
            </div>

          <div className="mt-8 sm:mt-10">
            <POStatusBanner />
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-brand-lavender/20 bg-[#FAF8F5] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-3">
              <span className="badge-brand">Tentang Orvaxia</span>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
                Rajutan sederhana, fungsi yang dipikirkan.
              </h2>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                ORVAXIA COMPANY adalah usaha kerajinan rajut dari Sidoarjo. Kami membuat Rovella,
                tas tumbler yang dapat dilipat menjadi pouch kecil.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-brand-lavender/30 bg-white p-4">
                <Compass size={20} className="text-brand-slate" aria-hidden="true" />
                <h3 className="mt-3 font-serif text-lg font-bold text-brand-navy">Orbis</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Terbuka pada ide dan peluang baru.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-lavender/30 bg-white p-4">
                <ShieldCheck size={20} className="text-brand-lavender" aria-hidden="true" />
                <h3 className="mt-3 font-serif text-lg font-bold text-brand-navy">Axiom</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Bekerja dengan jujur dan bertanggung jawab.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VISION, MISSION & VALUES ================= */}
      <section className="border-b border-brand-lavender/20 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-6 max-w-xl">
            <span className="badge-brand">Cara kami bekerja</span>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              Dibuat dengan teliti, bersama-sama.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <h3 className="font-semibold text-brand-navy">Kualitas</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">Setiap rajutan diperiksa dengan cermat.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <h3 className="font-semibold text-brand-navy">Kolaborasi</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">Dikerjakan oleh tim lintas divisi.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <h3 className="font-semibold text-brand-navy">Tanggung jawab</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">Mengutamakan kebutuhan pelanggan.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="shop" className="scroll-mt-20 border-b border-brand-lavender/20 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-6 max-w-2xl sm:mb-8">
            <span className="badge-brand">Rovella</span>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              Pilih desain dan ukuran botol.
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Sesuaikan pilihan, lalu lanjutkan ke pemesanan.
            </p>
          </div>

          <ProductShowcase />
        </div>
      </section>

      <section id="team" className="scroll-mt-20 border-b border-brand-lavender/20 bg-[#FAF8F5] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-brand-lavender/30 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <span className="badge-brand">Tim Orvaxia</span>
              <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-brand-navy">
                31 anggota, satu tim.
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Kenali orang-orang di balik Rovella.
              </p>
            </div>

            <div className="w-full sm:w-auto sm:shrink-0">
              <Link
                href="/team"
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-slate sm:w-auto"
              >
                <Users size={16} aria-hidden="true" />
                <span>Lihat tim</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-20 border-b border-brand-lavender/20 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-6 max-w-xl sm:mb-8">
            <span className="badge-brand">Galeri</span>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              Proses di balik rajutan.
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Kegiatan tim Orvaxia di Sidoarjo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:rounded-3xl"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 text-white sm:p-5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-yellow">
                    {item.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm mt-0.5">{item.title}</h4>
                  <p className="mt-1 line-clamp-2 text-[10px] text-white/80 sm:text-xs">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 bg-[#FAF8F5] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-4 lg:col-span-7">
              <span className="badge-brand">Bantuan</span>
              <h3 className="font-serif text-2xl font-bold text-brand-navy sm:text-3xl">
                Ada yang ingin ditanyakan?
              </h3>

              <div className="space-y-2 pt-1">
                {faqs.map((f) => {
                  const isOpen = openFaq === f.id;
                  return (
                    <div
                      key={f.id}
                      className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : f.id)}
                        className="flex min-h-12 w-full items-center justify-between p-4 text-left text-sm font-semibold text-brand-navy transition-colors hover:text-brand-slate"
                      >
                        <span className="pr-3 leading-snug">{f.question}</span>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-brand-navy' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100 bg-brand-surface/20 px-4 pb-4 pt-3 text-sm leading-6 text-slate-600">
                          {f.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="space-y-4 rounded-2xl border border-brand-lavender/30 bg-white p-5 sm:p-6">
                <div>
                  <span className="badge-brand">Kontak</span>
                  <h3 className="mt-2 font-serif text-xl font-bold text-brand-navy">
                    Hubungi kami
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-brand-slate" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-500">Alamat</span>
                      <p className="mt-0.5 leading-relaxed text-slate-700">
                        {siteSettings.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <Phone size={18} className="shrink-0 text-brand-slate" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-500">WhatsApp</span>
                      <a
                        href={`https://wa.me/62${siteSettings.whatsappNumber.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-slate hover:underline font-semibold"
                      >
                        {siteSettings.whatsappNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <Mail size={18} className="shrink-0 text-brand-slate" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-500">Email</span>
                      <a
                        href={`mailto:${siteSettings.email}`}
                        className="text-brand-slate hover:underline font-semibold"
                      >
                        {siteSettings.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Instagram size={18} className="shrink-0 text-brand-slate" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-500">Instagram · TikTok</span>
                      <p className="mt-0.5 text-slate-700">
                        @{siteSettings.instagram} · @{siteSettings.tiktok}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-10">
          <OrvaxiaLogo size={32} />
          <p>© 2026 Orvaxia Company</p>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="hover:text-brand-navy font-semibold">
              Akun staf
            </Link>
            <Link href="/dashboard" className="hover:text-brand-navy font-semibold">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>

      {/* ================= MAGIC NAVIGATION MENU (FLOATING DOCK) ================= */}
      <MagicNavigation />
    </main>
  );
}
