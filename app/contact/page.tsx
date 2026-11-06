'use client';

import Link from 'next/link';
import { ArrowLeft, Instagram, Mail, MapPin, MessageCircle, Music2 } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { useCompanyStore } from '@/lib/store/company-store';

export default function ContactPage() {
  const { siteSettings } = useCompanyStore();
  const whatsappLink = `https://wa.me/${siteSettings.whatsappNumber.replace(/^0/, '62')}`;
  const instagramLink = `https://www.instagram.com/${siteSettings.instagram.replace(/^@/, '')}`;
  const tiktokLink = `https://www.tiktok.com/@${siteSettings.tiktok.replace(/^@/, '')}`;

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={34} />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate transition hover:text-brand-navy">
            <ArrowLeft size={14} /> Beranda
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-brand-lavender/30 bg-white p-6 shadow-sm sm:p-8">
          <span className="badge-brand">Contact Company</span>
          <h1 className="mt-4 font-serif text-3xl font-bold text-brand-navy sm:text-5xl">Hubungi ORVAXIA COMPANY</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Kami siap membantu pertanyaan, kebutuhan custom, dan konfirmasi pesanan terkait produk ORVAXIA.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-brand-lavender/30 bg-brand-surface p-4 text-brand-navy transition hover:border-brand-slate">
              <MessageCircle className="text-brand-slate" size={20} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">WhatsApp</div>
                <div className="text-sm font-semibold">{siteSettings.whatsappNumber}</div>
              </div>
            </a>

            <a href={`mailto:${siteSettings.email}`} className="flex items-center gap-3 rounded-2xl border border-brand-lavender/30 bg-white p-4 text-brand-navy transition hover:border-brand-slate">
              <Mail className="text-brand-slate" size={20} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">Email</div>
                <div className="text-sm font-semibold">{siteSettings.email}</div>
              </div>
            </a>

            <a href={instagramLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-brand-lavender/30 bg-white p-4 text-brand-navy transition hover:border-brand-slate">
              <Instagram className="text-brand-slate" size={20} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">Instagram</div>
                <div className="text-sm font-semibold">@{siteSettings.instagram.replace(/^@/, '')}</div>
              </div>
            </a>

            <a href={tiktokLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-brand-lavender/30 bg-white p-4 text-brand-navy transition hover:border-brand-slate">
              <Music2 className="text-brand-slate" size={20} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">TikTok</div>
                <div className="text-sm font-semibold">@{siteSettings.tiktok.replace(/^@/, '')}</div>
              </div>
            </a>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-brand-lavender/30 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <MapPin className="text-brand-slate" size={20} />
            <h2 className="font-serif text-2xl font-bold text-brand-navy">Alamat</h2>
          </div>
          <p className="mt-4 text-base leading-7 text-slate-600">{siteSettings.address}</p>
          <div className="mt-5 rounded-2xl border border-brand-lavender/20 bg-brand-surface p-4 text-sm text-slate-600">
            Lokasi: Jl. Jenggolo No.2 A, Bedrek, Siwalanpanji, Kecamatan Buduran, Kabupaten Sidoarjo, Jawa Timur 61219.
          </div>
        </section>
      </div>

      <MagicNavigation />
    </main>
  );
}
