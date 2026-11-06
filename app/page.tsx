'use client';

import Link from 'next/link';
import { ArrowRight, Mail, MapPin, MessageCircle, Palette, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { POStatusBanner } from '@/components/shop/POStatusBanner';
import { ProductShowcase } from '@/components/shop/ProductShowcase';
import { useCompanyStore } from '@/lib/store/company-store';

export default function HomePage() {
  const { siteSettings, currentUser } = useCompanyStore();

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-28 text-brand-navy selection:bg-brand-lavender/30 sm:pb-32">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={34} />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-brand-slate md:flex">
            <Link href="/" className="transition hover:text-brand-navy">Home</Link>
            <Link href="/about" className="transition hover:text-brand-navy">About Company</Link>
            <Link href="/shop" className="transition hover:text-brand-navy">Shop</Link>
            <Link href="/team" className="transition hover:text-brand-navy">Our Team</Link>
            <Link href="/contact" className="transition hover:text-brand-navy">Contact Company</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="hidden items-center gap-2 rounded-full border border-brand-lavender/40 bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-navy transition hover:border-brand-slate sm:inline-flex"
            >
              <ShoppingBag size={15} /> Shop
            </Link>
            <Link
              href={currentUser ? '/account' : '/login'}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-slate transition hover:border-brand-slate hover:text-brand-navy"
            >
              {currentUser ? 'Akun' : 'Login'}
            </Link>
          </div>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden border-b border-brand-lavender/20 bg-white pb-14 pt-10 sm:pt-16">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-slate via-brand-lavender to-brand-peach" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-brand-lavender/40 bg-brand-surface/70 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-brand-slate">
              ORVAXIA COMPANY
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl font-serif text-4xl font-bold leading-tight tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                Kreasi rajutan yang praktis, elegan, dan siap menemani hari Anda.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                ORVAXIA menghadirkan karya rajutan multifungsi untuk aktifitas harian, dengan desain yang fleksibel,
                nyaman digunakan, dan tetap mencerminkan identitas brand yang hangat serta modern.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-slate"
              >
                <ShoppingBag size={17} /> Lihat Shop
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand-slate transition hover:border-brand-slate hover:text-brand-navy"
              >
                Tentang ORVAXIA <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-3 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">3-in-1 Utility Design</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Handmade</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Community-driven</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg rounded-[2rem] border border-brand-lavender/30 bg-[#F7F3FF] p-4 shadow-[0_22px_50px_rgba(96,108,141,0.12)]">
              <div className="rounded-[1.5rem] bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-slate">
                      Pre-Order Active
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-bold text-brand-navy">Rovella</h2>
                  </div>
                  <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[10px] font-bold text-brand-navy">
                    PO Open
                  </span>
                </div>
                <div className="rounded-2xl border border-brand-lavender/30 bg-gradient-to-br from-brand-surface to-white p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Brand Identity</span>
                    <Sparkles className="text-brand-slate" size={16} />
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {['#606C8D', '#A99AB3', '#FDF5AE'].map((color) => (
                      <div key={color} className="h-16 rounded-xl border border-white/80" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-white/80 p-3 text-sm text-slate-600">
                    Produk utama ORVAXIA adalah tas tumbler rajut multi fungsi yang dapat dilipat menjadi pouch atau gantungan kunci.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-lavender/20 bg-[#FAF8F5] py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="mb-8 text-center">
            <span className="badge-brand">Our Product</span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-brand-navy sm:text-4xl">Preview produk unggulan</h2>
          </div>
          <ProductShowcase />
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
                Produk dirancang untuk praktis dibawa, mudah dilipat, dan tetap berfungsi sebagai aksesori harian yang estetik.
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
                ORVAXIA terus berinovasi dengan tren yang relevan sambil menjaga nilai kerja sama, kreativitas, dan kepedulian.
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
              ORVAXIA COMPANY menghadirkan solusi kreatif untuk kebutuhan barang harian yang lebih praktis, estetik, dan bernilai.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-brand-navy">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> {siteSettings.address}</li>
              <li className="flex items-center gap-2"><MessageCircle size={15} className="shrink-0" /> {siteSettings.whatsappNumber}</li>
              <li className="flex items-center gap-2"><Mail size={15} className="shrink-0" /> {siteSettings.email}</li>
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

      <MagicNavigation />
    </main>
  );
}
