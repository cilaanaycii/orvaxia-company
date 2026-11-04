'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { POStatusBanner } from '@/components/shop/POStatusBanner';
import { ProductShowcase } from '@/components/shop/ProductShowcase';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  ArrowRight,
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Phone,
  Mail,
  Instagram,
  ShoppingBag,
  HeartHandshake,
  Layers,
  Leaf,
  ChevronDown,
} from 'lucide-react';

export default function HomePage() {
  const { siteSettings, gallery, faqs, cart } = useCompanyStore();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy selection:bg-brand-lavender/30">
      {/* ================= HERO SECTION ================= */}
      <section id="home" className="relative overflow-hidden border-b border-brand-lavender/20 bg-gradient-to-b from-white via-brand-surface/40 to-[#FAF8F5] pt-6 pb-20">
        {/* Subtle Brand Accent Lines */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-slate via-brand-lavender to-brand-peach" />

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between border-b border-brand-lavender/20 pb-6 mb-12">
            <OrvaxiaLogo size={44} />

            <div className="flex items-center gap-4">
              <Link
                href="/checkout"
                className="relative hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-brand-slate shadow-xs hover:border-brand-slate hover:text-brand-navy transition-all"
              >
                <ShoppingBag size={15} />
                <span>Keranjang ({cart.length})</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-full bg-brand-slate px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-navy transition-all"
              >
                <span>Portal Internal</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Hero Typography & Brand Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-brand-lavender/40 px-4 py-1.5 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold tracking-wide text-brand-slate uppercase">
                  A World Connected by Truth
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-navy leading-[1.12]">
                Kreativitas Rajutan Bernilai Tinggi,{' '}
                <span className="text-brand-gradient">Fungsional & Multifungsi.</span>
              </h1>

              <p className="text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl font-medium">
                Tas rajut <strong>Rovella</strong> — tumbler sling 3-in-1 yang bisa dilipat jadi gantungan kunci. Dibuat tangan dengan teliti, ramah lingkungan, dan bisa dipesan sesuai warna & ukuran botol pilihanmu.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  href="#shop"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-navy px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-brand-slate active:scale-[0.99] transition-all"
                >
                  <ShoppingBag size={18} /> Pesan Pre-Order Rovella
                </a>
                <a
                  href="#about"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-xs font-semibold text-slate-700 hover:border-brand-slate hover:text-brand-navy shadow-xs transition-all"
                >
                  Pelajari Profil Perusahaan
                </a>
              </div>

              {/* Value Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 max-w-xl text-left">
                <div>
                  <span className="font-serif font-bold text-lg text-brand-navy block">3-in-1</span>
                  <span className="text-[11px] text-slate-500">Tumbler, Pouch, Gantungan</span>
                </div>
                <div>
                  <span className="font-serif font-bold text-lg text-brand-navy block">31 Anggota</span>
                  <span className="text-[11px] text-slate-500">Struktur Profesional Resmi</span>
                </div>
                <div>
                  <span className="font-serif font-bold text-lg text-brand-navy block">Ramah Lingkungan</span>
                  <span className="text-[11px] text-slate-500">Benang Katun Pilihan</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: The Rovella 3-in-1 Presentation */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl border border-brand-lavender/30 bg-white p-7 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-brand-slate">
                    FLAGSHIP INNOVATION
                  </span>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                    Official Launch
                  </span>
                </div>

                <div className="flex flex-col items-center py-4">
                  <div className="w-32 h-44 rounded-3xl bg-gradient-to-tr from-brand-slate to-brand-lavender shadow-xl flex flex-col justify-between p-3.5 text-white">
                    <span className="text-[9px] font-bold tracking-widest uppercase">ORVAXIA</span>
                    <div className="text-center">
                      <span className="font-serif font-bold text-lg block drop-shadow">Rovella</span>
                      <span className="text-[9px] opacity-80">3-in-1 Tumbler Sling</span>
                    </div>
                    <span className="text-[8px] bg-white/20 rounded px-1 text-center">Handmade</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-brand-navy mt-4">
                    Rovella by Orvaxia
                  </h3>
                  <p className="text-xs text-slate-500 text-center max-w-xs mt-0.5">
                    Tas tumbler rajut serbaguna yang bisa dilipat praktis menjadi gantungan kunci mungil.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Harga Produk:</span>
                    <span className="font-serif font-bold text-sm text-brand-navy">Gratis (Hanya Ongkir)</span>
                  </div>
                  <a
                    href="#shop"
                    className="flex items-center gap-1 rounded-full bg-brand-surface px-4 py-2 font-bold text-brand-slate hover:bg-brand-slate hover:text-white transition-all text-xs"
                  >
                    Pesan Pre-Order <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time PO Status Banner */}
          <div className="mt-12">
            <POStatusBanner />
          </div>
        </div>
      </section>

      {/* ================= ABOUT US SECTION ================= */}
      <section id="about" className="py-20 border-b border-brand-lavender/20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="badge-brand">01 / Tentang Kami</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-navy">
                Dedikasi Merajut Kualitas, Keberlanjutan & Manfaat.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ORVAXIA COMPANY merupakan perusahaan kreatif yang berkomitmen menghadirkan produk kerajinan rajutan berupa tempat botol minum yang praktis, fungsional, menarik, dan multifungsi.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Melalui produk unggulan kami, <strong>Rovella</strong>, kami menjawab kebutuhan konsumen modern yang menginginkan kemudahan membawa tumbler sehari-hari sekaligus fleksibilitas pouch yang dapat dilipat ringkas menjadi gantungan kunci.
              </p>

              <div className="rounded-2xl border border-brand-lavender/30 bg-brand-surface/50 p-4 space-y-2 text-xs">
                <span className="font-bold text-brand-navy block">Komitmen Resmi Perusahaan:</span>
                <p className="text-slate-600 leading-relaxed">
                  "Menghadirkan produk yang sesuai dengan kebutuhan konsumen sekaligus memberikan pengalaman penggunaan yang lebih praktis dan menyenangkan dengan semangat kolaborasi dan integritas."
                </p>
              </div>
            </div>

            {/* Philosophy: ORBIS & AXIOM */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-slate-200 bg-brand-surface/40 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-bold text-brand-slate">ORBIS</span>
                    <Compass size={24} className="text-brand-slate" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-slate mt-3">
                    Dunia · Lingkaran · Persatuan · Peluang
                  </p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Orbis menggambarkan visi yang luas, persatuan, dan terbukanya berbagai peluang baru. Melalui nama ini, ORVAXIA ingin menunjukkan bahwa setiap ide memiliki potensi untuk berkembang dan memberikan dampak positif bagi masyarakat. Lingkaran juga melambangkan kebersamaan dan hubungan yang saling terhubung dalam mencapai tujuan.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Filosofi Nama Orvaxia
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-bold text-brand-navy">AXIOM</span>
                    <ShieldCheck size={24} className="text-brand-lavender" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-slate mt-3">
                    Prinsip Dasar · Kebenaran · Integritas · Tanggung Jawab
                  </p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    Axiom melambangkan prinsip yang kuat sebagai fondasi dalam membangun kepercayaan dan menjalankan perusahaan. Kami menegaskan pentingnya kejujuran, tanggung jawab, dan konsistensi dalam setiap tindakan maupun keputusan tanpa kehilangan nilai-nilai luhur yang dipegang.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Fondasi Kepercayaan
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VISION, MISSION & VALUES ================= */}
      <section className="py-20 border-b border-brand-lavender/20 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge-brand">02 / Landasan Perusahaan</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-navy mt-2">
              Visi, Misi & Nilai-Nilai Utama
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Panduan resmi dalam setiap karya rajutan dan hubungan antardivisi di ORVAXIA COMPANY.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vision */}
            <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-xs space-y-3">
              <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold text-brand-slate border border-brand-lavender/30">
                VISI PERUSAHAAN
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy">
                Menjadi Perusahaan Rajutan Terdepan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed italic bg-brand-surface/40 p-4 rounded-2xl border border-brand-lavender/20">
                "Menjadi perusahaan rajutan yang kreatif, berkualitas tinggi, dan inovatif yang memprioritaskan kepedulian dan kolaborasi."
              </p>
            </div>

            {/* Mission */}
            <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-xs space-y-3">
              <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold text-brand-slate border border-brand-lavender/30">
                MISI PERUSAHAAN
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy">
                Tiga Pilar Komitmen Nyata
              </h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-slate shrink-0">1.</span>
                  <span>Menghasilkan produk ramah lingkungan dengan kualitas dan inovasi yang berkelanjutan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-slate shrink-0">2.</span>
                  <span>Menumbuhkan budaya kerja profesional yang mendukung kolaborasi dan kesejahteraan karyawan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-brand-slate shrink-0">3.</span>
                  <span>Memberikan layanan yang transparan, etis, dan berfokus pada kepuasan pelanggan.</span>
                </li>
              </ul>
            </div>

            {/* Company Values */}
            <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-xs space-y-3">
              <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold text-brand-slate border border-brand-lavender/30">
                NILAI PERUSAHAAN
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-navy">
                5 Prinsip Keunggulan
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <Leaf size={14} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">Inovasi Berkelanjutan</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <ShieldCheck size={14} className="text-brand-slate shrink-0" />
                  <span className="font-semibold">Kualitas dan Ketelitian</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <Sparkles size={14} className="text-amber-500 shrink-0" />
                  <span className="font-semibold">Kreativitas</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <HeartHandshake size={14} className="text-rose-500 shrink-0" />
                  <span className="font-semibold">Kolaborasi</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <ShieldCheck size={14} className="text-purple-600 shrink-0" />
                  <span className="font-semibold">Integritas dan Wewenang</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SHOP / FLAGSHIP PRODUCT SHOWCASE ================= */}
      <section id="shop" className="py-20 border-b border-brand-lavender/20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge-brand">03 / Katalog & Pre-Order Resmi</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-navy mt-2">
              Koleksi Unggulan: Rovella by Orvaxia
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pilih varian warna, ukuran botol, dan aksesoris charm rajutan sesuai preferensi Anda.
            </p>
          </div>

          <ProductShowcase />
        </div>
      </section>

      {/* ================= OUR TEAM TEASER ================= */}
      <section id="team" className="py-16 border-b border-brand-lavender/20 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-3xl border border-brand-lavender/30 bg-white p-7 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="badge-brand">Struktur Tim Resmi</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-brand-navy">
                Didukung oleh 31 Profesional Berdedikasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dari Produksi, Sales, Finance, HRD, hingga Public Relations — setiap divisi bekerja sinergis memastikan mutu dan ketepatan setiap rajutan Rovella.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-2">
                {['Produksi', 'Sales', 'Finance', 'HRD', 'Marketing', 'PR', 'Kesekretariatan'].map((divName) => (
                  <span
                    key={divName}
                    className="rounded-full bg-brand-surface border border-brand-lavender/30 px-3 py-1 text-[11px] font-semibold text-brand-slate"
                  >
                    {divName}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/team"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-brand-navy px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-brand-slate hover:shadow-lg transition-all"
              >
                <Users size={16} />
                <span>Lihat Seluruh Anggota Tim (31)</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DOCUMENTATION GALLERY ================= */}
      <section id="gallery" className="py-20 border-b border-brand-lavender/20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="badge-brand">04 / Galeri Dokumentasi</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-navy mt-1">
              Proses Produksi & Aktivitas Perusahaan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumentasi nyata kegiatan merajut, pengemasan, dan koordinasi antardivisi di SMKN 2 Buduran Sidoarjo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 aspect-square shadow-sm"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-yellow">
                    {item.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm mt-0.5">{item.title}</h4>
                  <p className="text-[10px] text-white/80 line-clamp-2 mt-1">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ & CONTACT SECTION ================= */}
      <section id="contact" className="py-20 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* FAQ Accordion */}
            <div className="lg:col-span-7 space-y-4">
              <span className="badge-brand">FAQ & Panduan Pemesanan</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
                Pertanyaan yang Sering Diajukan
              </h3>

              <div className="space-y-2.5 pt-2">
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
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-brand-navy text-xs sm:text-sm hover:text-brand-slate transition-colors"
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
                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed bg-brand-surface/20">
                          {f.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-brand-lavender/30 bg-white p-7 shadow-sm space-y-5">
                <div>
                  <span className="badge-brand">Informasi Resmi</span>
                  <h3 className="font-serif text-xl font-bold text-brand-navy mt-1">
                    Kontak & Lokasi Perusahaan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hubungi perwakilan resmi kami untuk pertanyaan pre-order atau kolaborasi.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 rounded-2xl bg-brand-surface/40 p-3.5 border border-brand-lavender/20">
                    <MapPin size={18} className="text-brand-slate shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-navy block">Alamat Perusahaan:</span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {siteSettings.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-brand-surface/40 p-3.5 border border-brand-lavender/20">
                    <Phone size={18} className="text-brand-slate shrink-0" />
                    <div>
                      <span className="font-bold text-brand-navy block">WhatsApp Resmi:</span>
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

                  <div className="flex items-center gap-3 rounded-2xl bg-brand-surface/40 p-3.5 border border-brand-lavender/20">
                    <Mail size={18} className="text-brand-slate shrink-0" />
                    <div>
                      <span className="font-bold text-brand-navy block">Email Resmi:</span>
                      <a
                        href={`mailto:${siteSettings.email}`}
                        className="text-brand-slate hover:underline font-semibold"
                      >
                        {siteSettings.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-brand-surface/40 p-3.5 border border-brand-lavender/20">
                    <Instagram size={18} className="text-brand-slate shrink-0" />
                    <div>
                      <span className="font-bold text-brand-navy block">Media Sosial:</span>
                      <p className="text-slate-600 mt-0.5">
                        Instagram: @{siteSettings.instagram} · TikTok: @{siteSettings.tiktok}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <OrvaxiaLogo size={36} />
          <p className="text-center sm:text-left">
            © 2026 ORVAXIA COMPANY. A World Connected by Truth. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="hover:text-brand-navy font-semibold">
              Portal Staf
            </Link>
            <Link href="/dashboard" className="hover:text-brand-navy font-semibold">
              Dashboard Internal
            </Link>
          </div>
        </div>
      </footer>

      {/* ================= MAGIC NAVIGATION MENU (FLOATING DOCK) ================= */}
      <MagicNavigation />
    </main>
  );
}
