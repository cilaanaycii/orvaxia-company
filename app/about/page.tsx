'use client';

import React from 'react';
import Image from 'next/image';
import {
  Compass,
  Eye,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Camera,
  Heart,
  Users2,
} from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';
import { Footer } from '@/components/navigation/Footer';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { OrgStructureTree } from '@/components/team/OrgStructureTree';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePublicContent } from '@/lib/content/use-public-content';

export default function AboutPage() {
  const { gallery } = useCompanyStore();
  const { bySlug } = usePublicContent('about');
  const introduction = bySlug['about-introduction'];

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy pb-24 md:pb-0">
      {/* 1. Header Navigasi Shell */}
      <TopNav />

      {/* 2. Hero Editorial — Profil Perusahaan ORVAXIA */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 space-y-10">
        <section className="rounded-[2.25rem] border border-brand-lavender/30 bg-white p-6 sm:p-10 shadow-xs bg-grain">
          <div className="max-w-3xl space-y-4">
            <span className="badge-brand">
              <Sparkles size={12} className="text-brand-slate" />
              Profil Perusahaan
            </span>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
              {introduction?.title || 'ORVAXIA COMPANY'}
            </h1>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {introduction?.body ||
                'ORVAXIA adalah perusahaan rintisan siswa SMKN 2 Buduran yang berkomitmen menghadirkan produk kerajinan rajutan berupa tas tumbler yang praktis, fungsional, dan memiliki estetika menawan. Mengedepankan inovasi desain, mutu rajutan, dan kegunaan harian, ORVAXIA berupaya memberikan sentuhan personal di setiap karya yang dihasilkan.'}
            </p>
          </div>
        </section>

        {/* 3. Filosofi Nama & Logo ORVAXIA */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Makna Nama: Orbis + Axiom */}
          <div className="rounded-[2rem] border border-brand-lavender/30 bg-white p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface text-brand-slate">
                <Compass size={20} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-brand-navy">
                  Filosofi Nama ORVAXIA
                </h2>
                <p className="text-xs text-slate-500">Kombinasi Orbis dan Axiom</p>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
              <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4">
                <h3 className="font-display font-bold text-brand-navy text-sm">ORBIS (Lingkaran & Persatuan)</h3>
                <p className="mt-1">
                  Melambangkan keutuhan dunia, lingkaran persatuan, dan terbukanya peluang baru. Menggambarkan visi luas 31 anggota SMKN 2 Buduran yang saling bersinergi dalam harmoni kolaborasi.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4">
                <h3 className="font-display font-bold text-brand-navy text-sm">AXIOM (Prinsip & Kebenaran)</h3>
                <p className="mt-1">
                  Melambangkan prinsip kebenaran yang tak terbantahkan, integritas profesional, kejujuran etis, dan tanggung jawab tinggi dalam setiap proses kerja maupun pelayanan kepada konsumen.
                </p>
              </div>
            </div>
          </div>

          {/* Filosofi Simbol & Logo */}
          <div className="rounded-[2rem] border border-brand-lavender/30 bg-white p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface text-brand-slate">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-brand-navy">
                  Filosofi Simbol Logo
                </h2>
                <p className="text-xs text-slate-500">Identitas Visual Resmi</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs leading-6 text-slate-600 sm:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-brand-slate shrink-0 mt-2" />
                <span><strong>Bentuk Lengkungan Menyatu:</strong> Menggambarkan keterhubungan, persatuan kru, dan kekuatan kolaborasi tim.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-brand-lavender shrink-0 mt-2" />
                <span><strong>Bentuk Dinamis:</strong> Melambangkan adaptabilitas, pertumbuhan berkelanjutan, dan keterbukaan terhadap inovasi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-brand-peach shrink-0 mt-2" />
                <span><strong>Titik Pusat Bintang:</strong> Melambangkan cita-cita luhur, inspirasi, dan harapan untuk menghasilkan karya yang bermakna.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                <span><strong>Kerapian Geometris:</strong> Mencerminkan ketelitian rajutan tangan dan kendali mutu terstandar.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Visi & Misi Perusahaan */}
        <section className="grid gap-6 md:grid-cols-12 items-stretch">
          <div className="rounded-[2rem] border border-brand-lavender/30 bg-white p-7 shadow-xs md:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface text-brand-slate">
                <Eye size={20} />
              </div>
              <h3 className="font-display text-2xl font-bold text-brand-navy">Visi Perusahaan</h3>
              <p className="text-sm leading-7 text-slate-600 italic">
                &ldquo;Menjadi perusahaan kerajinan rajutan yang kreatif, berkualitas tinggi, dan inovatif yang memprioritaskan kepedulian serta kolaborasi.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-brand-slate">
              SMKN 2 Buduran Sidoarjo
            </div>
          </div>

          <div className="rounded-[2rem] border border-brand-lavender/30 bg-white p-7 shadow-xs md:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface text-brand-slate">
                <Lightbulb size={20} />
              </div>
              <h3 className="font-display text-2xl font-bold text-brand-navy">Misi Perusahaan</h3>
              <ol className="list-decimal space-y-2.5 pl-5 text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
                <li>Menghasilkan produk kerajinan berkualitas dengan inovasi desain fungsional yang berkelanjutan.</li>
                <li>Menumbuhkan budaya kerja profesional yang mendukung kolaborasi, kreativitas, dan pengembangan 31 anggota tim.</li>
                <li>Memberikan pelayanan yang ramah, transparan, etis, dan berfokus penuh pada kepuasan setiap pelanggan.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* 5. Nilai-Nilai Perusahaan (Company Values) */}
        <section className="rounded-[2.25rem] border border-brand-lavender/30 bg-white p-7 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface text-brand-slate">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-brand-navy">
                Nilai Utama Perusahaan
              </h2>
              <p className="text-xs text-slate-500">Prinsip kerja yang dipegang teguh seluruh anggota tim</p>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { title: 'Inovasi Berkelanjutan', desc: 'Selalu mencari terobosan desain yang fungsional dan relevan.' },
              { title: 'Kualitas & Ketelitian', desc: 'Standar mutu terukur pada setiap anyaman dan simpul rajut.' },
              { title: 'Kreativitas', desc: 'Keberanian mengeksplorasi warna, pola, dan varian baru.' },
              { title: 'Kolaborasi', desc: 'Sinergi lintas divisi demi kelancaran flow produksi dan pelayanan.' },
              { title: 'Integritas Kerja', desc: 'Kejujuran, transparansi, dan tanggung jawab pada setiap amanah.' },
            ].map((val) => (
              <div
                key={val.title}
                className="rounded-2xl border border-slate-100 bg-[#FAF8F5] p-4 text-left space-y-1.5 transition-all hover:border-brand-lavender/40 hover:bg-white shadow-2xs"
              >
                <span className="font-display text-xs font-bold text-brand-navy block">{val.title}</span>
                <p className="text-[11px] leading-5 text-slate-600">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Identitas Visual & Warna Brand Resmi */}
        <section className="rounded-[2.25rem] border border-brand-lavender/30 bg-white p-7 sm:p-9 shadow-xs space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-navy">
              Identitas Warna Brand ORVAXIA
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Empat pilar warna resmi yang mencerminkan karakter lembut, hangat, dan profesional.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="h-12 rounded-xl flex items-center justify-end px-3 text-white text-[11px] font-mono font-bold" style={{ backgroundColor: '#606C8D' }}>
                #606C8D
              </div>
              <p className="text-xs font-bold text-brand-navy">Bru Slate</p>
              <p className="text-[11px] leading-5 text-slate-600">Ketenangan emosional, kejernihan berpikir, dan stabilitas profesional.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="h-12 rounded-xl flex items-center justify-end px-3 text-brand-navy text-[11px] font-mono font-bold" style={{ backgroundColor: '#A99AB3' }}>
                #A99AB3
              </div>
              <p className="text-xs font-bold text-brand-navy">Lavender</p>
              <p className="text-[11px] leading-5 text-slate-600">Relaksasi, intuisi lembut, kehangatan batin, dan keseimbangan visual.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="h-12 rounded-xl flex items-center justify-end px-3 text-brand-navy text-[11px] font-mono font-bold" style={{ backgroundColor: '#FDF5AE' }}>
                #FDF5AE
              </div>
              <p className="text-xs font-bold text-brand-navy">Pastel Yellow</p>
              <p className="text-[11px] leading-5 text-slate-600">Pencerahan, optimisme berkreasi, dan semangat menyambut peluang baru.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="h-12 rounded-xl flex items-center justify-end px-3 text-white text-[11px] font-mono font-bold" style={{ backgroundColor: '#D0A9A0' }}>
                #D0A9A0
              </div>
              <p className="text-xs font-bold text-brand-navy">Dusty Peach</p>
              <p className="text-[11px] leading-5 text-slate-600">Kehangatan hubungan, keramahan komunikasi, ketulusan, dan kepedulian.</p>
            </div>
          </div>
        </section>

        {/* 7. Bagan Struktur Organisasi */}
        <section className="rounded-[2.25rem] border border-brand-lavender/30 bg-white p-6 sm:p-10 shadow-xs">
          <OrgStructureTree />
        </section>

        {/* 8. Dokumentasi Kegiatan (Gallery) */}
        <section className="rounded-[2.25rem] border border-brand-lavender/30 bg-white p-7 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-brand-navy">
                Dokumentasi Kegiatan Tim
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Aktivitas produksi, kolaborasi kru, dan kegiatan resmi ORVAXIA COMPANY.
              </p>
            </div>
            <span className="rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-slate border border-brand-lavender/30">
              {gallery.length} dokumentasi
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(0, 6).map((item) => {
              const hasValidPhoto =
                Boolean(item.imageUrl) &&
                !item.imageUrl.includes('unsplash.com') &&
                item.imageUrl.includes('/storage/v1/object/public/orvaxia-images/');

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-brand-lavender/30 bg-white shadow-2xs card-interactive flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF8F5]">
                    {hasValidPhoto ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      /* Fallback Bersih Dokumentasi */
                      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-slate-400">
                        <Camera size={24} className="text-brand-slate/60 mb-1" />
                        <span className="text-[11px] font-semibold text-brand-slate">Dokumentasi Resmi</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Segera hadir</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">
                      {item.category || 'Aktivitas'}
                    </span>
                    <h3 className="font-display text-xs font-bold text-brand-navy line-clamp-1">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-[11px] leading-5 text-slate-500 line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {gallery.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#FAF8F5] p-8 text-center text-xs text-slate-500">
              Dokumentasi kegiatan resmi sedang dipersiapkan oleh divisi Public Relations.
            </div>
          )}
        </section>
      </div>

      {/* 9. Footer Shell & Mobile Dock */}
      <Footer />
      <MagicNavigation />
    </main>
  );
}
