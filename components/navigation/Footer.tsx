'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, MessageCircle, Mail, Instagram, Music2, ShieldCheck, Heart, Sparkles } from 'lucide-react';
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
            <OrvaxiaLogo size={34} />
            <p className="max-w-sm text-sm leading-6 text-slate-600">
              ORVAXIA COMPANY menghadirkan karya kerajinan rajutan multifungsi berupa tempat botol minum praktis yang dapat dilipat menjadi bag charm elegan.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-lavender/30 bg-brand-surface px-3 py-1 text-[11px] font-semibold text-brand-navy">
                <Sparkles size={12} className="text-brand-slate" /> 3-in-1 Utility
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-lavender/30 bg-brand-surface px-3 py-1 text-[11px] font-semibold text-brand-navy">
                <ShieldCheck size={12} className="text-brand-slate" /> Handmade
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-lavender/30 bg-brand-surface px-3 py-1 text-[11px] font-semibold text-brand-navy">
                <Heart size={12} className="text-brand-slate" /> SMKN 2 Buduran
              </span>
            </div>
          </div>

          {/* Quick Navigation column */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-navy">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="transition hover:text-brand-navy">Beranda</Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-brand-navy">About Company</Link>
              </li>
              <li>
                <Link href="/shop" className="transition hover:text-brand-navy">Shop & Pre-Order</Link>
              </li>
              <li>
                <Link href="/team" className="transition hover:text-brand-navy">Our Team</Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-brand-navy">Contact Company</Link>
              </li>
              <li>
                <Link href="/order-tracking" className="transition hover:text-brand-navy">Lacak Pesanan</Link>
              </li>
            </ul>
          </div>

          {/* Official Contact & Social column */}
          <div className="space-y-3 md:col-span-4">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-brand-navy">
              Kontak Resmi
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-brand-slate" />
                <span className="leading-5">{siteSettings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle size={15} className="shrink-0 text-brand-slate" />
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
                <Mail size={15} className="shrink-0 text-brand-slate" />
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="font-medium hover:text-brand-navy transition"
                >
                  {siteSettings.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram size={15} className="shrink-0 text-brand-slate" />
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
                <Music2 size={15} className="shrink-0 text-brand-slate" />
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

        {/* Bottom copyright and portal links */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} ORVAXIA COMPANY. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/auth" className="hover:text-brand-navy transition">
              Portal Kru & Internal
            </Link>
            <span>·</span>
            <Link href="/account" className="hover:text-brand-navy transition">
              Akun Pelanggan
            </Link>
            <span>·</span>
            <Link href="/order-tracking" className="hover:text-brand-navy transition">
              Pelacakan Pesanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
