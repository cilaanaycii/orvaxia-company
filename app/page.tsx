'use client';

import Link from 'next/link';
import { ArrowRight, Instagram, Mail, MapPin, MessageCircle, Music2, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { TopNav } from '@/components/navigation/TopNav';
import { POStatusBanner } from '@/components/shop/POStatusBanner';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePublicContent } from '@/lib/content/use-public-content';

export default function HomePage() {
  const { siteSettings } = useCompanyStore();
  const { bySlug } = usePublicContent('home');
  const introduction = bySlug['home-introduction'];

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy selection:bg-brand-lavender/30">
      <TopNav />

      <section id="home" className="relative overflow-hidden border-b border-brand-lavender/20 bg-white pb-14 pt-10 sm:pt-16">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-slate via-brand-lavender to-brand-peach" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-brand-lavender/40 bg-brand-surface/70 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-brand-slate">
              ORVAXIA COMPANY
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl font-serif text-4xl font-bold leading-tight tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                {introduction?.title || 'Kreasi rajutan yang praktis, elegan, dan siap menemani hari Anda.'}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                {introduction?.body || 'ORVAXIA menghadirkan karya rajutan multifungsi untuk aktifitas harian, dengan desain yang fleksibel, nyaman digunakan, dan tetap mencerminkan identitas brand yang hangat serta modern.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-slate"
              >
                {bySlug['home-shop-cta']?.title || 'Lihat Shop'}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand-slate transition hover:border-brand-slate hover:text-brand-navy"
              >
                {bySlug['home-about-cta']?.title || 'Tentang ORVAXIA'} <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-3 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">3-in-1 Utility Design</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Handmade</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Community-driven</span>
            </div>
          </div>

          <div className="flex min-h-[18rem] items-center justify-center border-y border-brand-lavender/30 px-6 py-10 text-center sm:min-h-[24rem]">
            <div className="max-w-sm">
              <OrvaxiaLogo size={86} vertical />
              <p className="mt-7 font-serif text-xl font-semibold leading-8 text-brand-slate">
                Berangkat dari prinsip, tumbuh melalui kebersamaan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <span className="badge-brand">Why ORVAXIA</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-brand-navy">Desain yang terus berkembang, tetap bersahaja.</h2>
            </div>
            <Link href="/about" className="hidden items-center gap-2 text-sm font-semibold text-brand-slate hover:text-brand-navy sm:inline-flex">
              Detail perusahaan <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-brand-lavender/30 bg-[#FAF8F5] p-5">
              <Palette className="mb-3 text-brand-slate" size={22} />
              <h3 className="font-serif text-xl font-bold text-brand-navy">Desain multifungsi</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Produk dirancang untuk praktis dibawa, mudah dilipat, dan tetap berfungsi sebagai aksesori harian.
              </p>
            </div>
            <div className="rounded-3xl border border-brand-lavender/30 bg-[#FAF8F5] p-5">
              <ShieldCheck className="mb-3 text-brand-slate" size={22} />
              <h3 className="font-serif text-xl font-bold text-brand-navy">Kualitas terjaga</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Setiap produk dibuat dengan prinsip ketelitian, integritas, dan perhatian pada detail agar konsisten dan nyaman dipakai.
              </p>
            </div>
            <div className="rounded-3xl border border-brand-lavender/30 bg-[#FAF8F5] p-5">
              <Sparkles className="mb-3 text-brand-slate" size={22} />
              <h3 className="font-serif text-xl font-bold text-brand-navy">Inspirasi berkelanjutan</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                ORVAXIA terus berinovasi dengan tren yang relevan sambil menjaga nilai kerja sama dan kepedulian.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-lavender/20 bg-[#FAF8F5] py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="rounded-[2rem] border border-brand-lavender/30 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="badge-brand">PO Status</span>
                <h3 className="mt-3 font-serif text-2xl font-bold text-brand-navy">Informasi buka-preorder saat ini</h3>
              </div>
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-slate">
                Lihat katalog <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-6">
              <POStatusBanner />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-brand-lavender/20 bg-white py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-10">
          <div>
            <OrvaxiaLogo size={30} />
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
              ORVAXIA COMPANY menghadirkan karya rajutan handmade yang praktis, multifungsi, dan bernilai untuk kebutuhan harian.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-brand-navy">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> {siteSettings.address}</li>
              <li className="flex items-center gap-2"><MessageCircle size={15} className="shrink-0" /> <a href={`https://wa.me/${siteSettings.whatsappNumber.replace(/^0/, '62')}`} className="hover:text-brand-navy">{siteSettings.whatsappNumber}</a></li>
              <li className="flex items-center gap-2"><Mail size={15} className="shrink-0" /> <a href={`mailto:${siteSettings.email}`} className="hover:text-brand-navy">{siteSettings.email}</a></li>
              <li className="flex items-center gap-2"><Instagram size={15} className="shrink-0" /> <a href={`https://www.instagram.com/${siteSettings.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="hover:text-brand-navy">@{siteSettings.instagram.replace(/^@/, '')}</a></li>
              <li className="flex items-center gap-2"><Music2 size={15} className="shrink-0" /> <a href={`https://www.tiktok.com/@${siteSettings.tiktok.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="hover:text-brand-navy">@{siteSettings.tiktok.replace(/^@/, '')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-brand-navy">Menu</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <Link href="/about" className="block hover:text-brand-navy">About Company</Link>
              <Link href="/shop" className="block hover:text-brand-navy">Shop</Link>
              <Link href="/team" className="block hover:text-brand-navy">Our Team</Link>
              <Link href="/contact" className="block hover:text-brand-navy">Contact Company</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
