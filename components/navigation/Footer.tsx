'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, MessageCircle, Mail, Instagram, Music2 } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';

export function Footer() {
  const { siteSettings } = useCompanyStore();
  const currentYear = new Date().getFullYear();
  const waNumberClean = siteSettings.whatsappNumber.replace(/^0/, '62');
  const igClean = siteSettings.instagram.replace(/^@/, '');
  const ttClean = siteSettings.tiktok.replace(/^@/, '');

  return (
    <footer className="border-t border-brand-lavender/30 bg-white text-brand-navy">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand & Mission column */}
          <div className="space-y-4 md:col-span-5">
            <OrvaxiaLogo size={32} />
            <p className="max-w-sm text-sm leading-6 text-slate-600 font-normal">
              Orvaxia Company menghadirkan karya kerajinan rajutan multifungsi berupa tempat botol minum praktis yang dapat dilipat menjadi bag charm elegan.
            </p>
          </div>

          {/* Quick Navigation column */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="font-display text-xs font-semibold text-brand-navy">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 font-normal">
              <li>
                <Link href="/" className="transition hover:text-brand-navy">Beranda</Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-brand-navy">Tentang Kami</Link>
              </li>
              <li>
                <Link href="/shop" className="transition hover:text-brand-navy">Toko Produk</Link>
              </li>
              <li>
                <Link href="/team" className="transition hover:text-brand-navy">Tim Kami</Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-brand-navy">Kontak</Link>
              </li>
            </ul>
          </div>

          {/* Official Contact & Social column */}
          <div className="space-y-3 md:col-span-4">
            <h4 className="font-display text-xs font-semibold text-brand-navy">
              Kontak Resmi
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-normal">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-slate" />
                <span className="leading-5">{siteSettings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle size={14} className="shrink-0 text-brand-slate" />
                <a
                  href={`https://wa.me/${waNumberClean}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-brand-navy transition"
                >
                  WhatsApp: {siteSettings.whatsappNumber}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-brand-slate" />
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="font-medium hover:text-brand-navy transition"
                >
                  {siteSettings.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram size={14} className="shrink-0 text-brand-slate" />
                <a
                  href={`https://www.instagram.com/${igClean}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-brand-navy transition"
                >
                  @{igClean}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Music2 size={14} className="shrink-0 text-brand-slate" />
                <a
                  href={`https://www.tiktok.com/@${ttClean}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-brand-navy transition"
                >
                  @{ttClean}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-500 text-center sm:text-left">
          <p>© {currentYear} Orvaxia Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
