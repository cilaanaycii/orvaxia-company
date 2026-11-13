'use client';

import React from 'react';
import {
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Sparkles,
  Phone,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { TopNav } from '@/components/navigation/TopNav';
import { Footer } from '@/components/navigation/Footer';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { usePublicContent } from '@/lib/content/use-public-content';

export default function ContactPage() {
  const { siteSettings } = useCompanyStore();
  const { bySlug } = usePublicContent('contact');

  // Format link kontak resmi
  const rawWa = (siteSettings.whatsappNumber || '').replace(/[^0-9]/g, '');
  const formattedWa = rawWa.startsWith('0') ? `62${rawWa.slice(1)}` : rawWa.startsWith('62') ? rawWa : `62${rawWa}`;
  const whatsappLink = `https://wa.me/${formattedWa}`;
  const instagramHandle = (siteSettings.instagram || '').replace(/^@/, '');
  const instagramLink = `https://www.instagram.com/${instagramHandle}`;
  const tiktokHandle = (siteSettings.tiktok || '').replace(/^@/, '');
  const tiktokLink = `https://www.tiktok.com/@${tiktokHandle}`;

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy pb-24 md:pb-0">
      {/* 1. Header Navigasi Shell */}
      <TopNav />

      {/* 2. Konten Kontak Resmi */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 space-y-8">
        {/* Header Kontak */}
        <section className="rounded-[2.25rem] border border-brand-lavender/30 bg-white p-6 sm:p-10 shadow-xs bg-grain">
          <div className="max-w-2xl space-y-3">
            <span className="badge-brand">
              <Sparkles size={12} className="text-brand-slate" />
              Layanan Pelanggan
            </span>
            <h1 className="font-display text-3xl font-extrabold text-brand-navy sm:text-4xl">
              Hubungi ORVAXIA COMPANY
            </h1>
            <p className="text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
              {bySlug['contact-introduction']?.body ||
                'Kami siap melayani pertanyaan seputar produk ROVELLA, konsultasi ukuran botol custom, informasi pre-order, dan koordinasi pengambilan pesanan.'}
            </p>
          </div>

          {/* Grid Kanal Kontak Resmi */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {/* WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-brand-lavender/30 bg-[#FAF8F5] p-5 transition-all duration-200 hover:border-brand-slate hover:bg-white hover:shadow-2xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-2xs border border-emerald-100">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block">
                    WhatsApp Resmi
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-0.5 block">
                    {siteSettings.whatsappNumber || 'Nomor WhatsApp belum diisi'}
                  </span>
                  <span className="text-[11px] text-slate-500">Respon cepat via chat</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Email */}
            <a
              href={`mailto:${siteSettings.email}`}
              className="group flex items-center justify-between rounded-2xl border border-brand-lavender/30 bg-[#FAF8F5] p-5 transition-all duration-200 hover:border-brand-slate hover:bg-white hover:shadow-2xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-slate shadow-2xs border border-brand-lavender/25">
                  <Mail size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block">
                    Email Resmi
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-0.5 block">
                    {siteSettings.email || 'Email belum diisi'}
                  </span>
                  <span className="text-[11px] text-slate-500">Pertanyaan dan korespondensi</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* Instagram */}
            <a
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-brand-lavender/30 bg-[#FAF8F5] p-5 transition-all duration-200 hover:border-brand-slate hover:bg-white hover:shadow-2xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-pink-600 shadow-2xs border border-pink-100">
                  <Instagram size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block">
                    Instagram Resmi
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-0.5 block">
                    @{instagramHandle || 'orvaxia.company'}
                  </span>
                  <span className="text-[11px] text-slate-500">Katalog dan dokumentasi visual</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all" />
            </a>

            {/* TikTok */}
            <a
              href={tiktokLink}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-brand-lavender/30 bg-[#FAF8F5] p-5 transition-all duration-200 hover:border-brand-slate hover:bg-white hover:shadow-2xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-navy shadow-2xs border border-slate-200">
                  <Music2 size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block">
                    TikTok Resmi
                  </span>
                  <span className="text-sm font-bold text-brand-navy mt-0.5 block">
                    @{tiktokHandle || 'orvaxia.company'}
                  </span>
                  <span className="text-[11px] text-slate-500">Video tutorial dan kreasi</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>
        </section>

        {/* Alamat & Informasi Lokasi Sekolah */}
        <section className="rounded-[2.25rem] border border-brand-lavender/30 bg-white p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface text-brand-slate">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-brand-navy">
                Alamat & Lokasi Operasional
              </h2>
              <p className="text-xs text-slate-500">Basis produksi dan kegiatan siswa</p>
            </div>
          </div>

          <p className="text-sm leading-7 text-slate-700">
            {siteSettings.address || 'SMKN 2 Buduran Sidoarjo, Jawa Timur'}
          </p>

          <div className="rounded-2xl border border-brand-lavender/25 bg-[#FAF8F5] p-4 text-xs leading-6 text-slate-600">
            <strong>Catatan Pengambilan Pesanan:</strong> Siswa-siswi dan kru SMKN 2 Buduran yang memilih opsi pengambilan di sekolah dapat mengambil pesanan di area ruang kelas atau titik kumpul yang dikoordinasikan oleh tim Sales pada saat jam istirahat.
          </div>
        </section>
      </div>

      {/* 3. Footer Shell & Mobile Dock */}
      <Footer />
      <MagicNavigation />
    </main>
  );
}
