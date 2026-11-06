'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Compass, Eye, Lightbulb, ShieldCheck, Sparkles } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { OrgStructureTree } from '@/components/team/OrgStructureTree';
import { useCompanyStore } from '@/lib/store/company-store';

export default function AboutPage() {
  const { gallery } = useCompanyStore();

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <Link href="/" aria-label="Kembali ke beranda">
            <OrvaxiaLogo size={34} />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate transition hover:text-brand-navy">
            <ArrowLeft size={14} /> Beranda
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-brand-lavender/30 bg-white p-6 shadow-sm sm:p-8">
          <span className="badge-brand">Company Introduction</span>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-brand-navy sm:text-5xl">ORVAXIA COMPANY</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Orvaxia adalah perusahaan yang berkomitmen untuk menghadirkan produk kerajinan rajutan berupa tempat botol minum yang praktis,
            fungsional, dan memiliki tampilan menarik. Dengan mengutamakan desain kreatif, kualitas produk, serta kegunaan sehari-hari,
            Orvaxia berupaya menghadirkan produk yang tidak hanya memudahkan konsumen membawa botol minum, tetapi juga memberikan sentuhan
            unik melalui desain rajutan. Produk dirancang secara fleksibel sehingga dapat dilipat menjadi gantungan kunci, menjadikannya
            praktis dan multifungsi.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6">
            <div className="mb-3 flex items-center gap-3">
              <Compass className="text-brand-slate" size={22} />
              <h2 className="font-serif text-2xl font-bold text-brand-navy">Philosophy of ORVAXIA</h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-slate-600">
              <div>
                <h3 className="font-semibold text-brand-navy">ORBIS</h3>
                <p>Orbis berarti dunia, lingkaran, persatuan, dan peluang. Menggambarkan visi yang luas, persatuan, terbukanya peluang baru, serta kerja sama dalam mencapai tujuan bersama.</p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-navy">AXIOM</h3>
                <p>Axiom berarti prinsip dasar, kebenaran, dan integritas. Melambangkan kejujuran, tanggung jawab, konsistensi, dan prinsip kuat dalam menjalankan perusahaan.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6">
            <div className="mb-3 flex items-center gap-3">
              <Sparkles className="text-brand-slate" size={22} />
              <h2 className="font-serif text-2xl font-bold text-brand-navy">Logo Philosophy</h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              <li>• Bentuk lengkungan yang saling menyatu melambangkan persatuan, kerja sama, dan keterhubungan.</li>
              <li>• Bentuk dinamis menggambarkan pertumbuhan dan keterbukaan terhadap ide baru.</li>
              <li>• Warna biru slate melambangkan ketenangan emosional, logika, dan pemikiran jernih.</li>
              <li>• Lavender memberikan kesan relaksasi, intuisi, dan ketenangan batin.</li>
              <li>• Kuning pastel melambangkan optimisme, kebahagiaan, dan semangat berkembang.</li>
              <li>• Peach dusty menggambarkan kehangatan, ketulusan, dan kepedulian.</li>
              <li>• Bentuk menyerupai bintang di tengah logo melambangkan harapan, inspirasi, dan tujuan menciptakan sesuatu yang bernilai.</li>
            </ul>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6">
            <Eye className="mb-3 text-brand-slate" size={22} />
            <h3 className="font-serif text-2xl font-bold text-brand-navy">Vision</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">“Menjadi perusahaan rajutan yang kreatif, berkualitas tinggi, dan inovatif yang memprioritaskan kepedulian dan kolaborasi.”</p>
          </div>
          <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 md:col-span-2">
            <Lightbulb className="mb-3 text-brand-slate" size={22} />
            <h3 className="font-serif text-2xl font-bold text-brand-navy">Mission</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-600">
              <li>Menghasilkan produk ramah lingkungan dengan kualitas dan inovasi yang berkelanjutan.</li>
              <li>Menumbuhkan budaya kerja profesional yang mendukung kolaborasi dan kesejahteraan karyawan.</li>
              <li>Memberikan layanan yang transparan, etis, dan berfokus pada kepuasan pelanggan.</li>
            </ol>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-brand-lavender/30 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="text-brand-slate" size={22} />
            <h2 className="font-serif text-2xl font-bold text-brand-navy">Company Values</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {['Inovasi Berkelanjutan', 'Kualitas dan Ketelitian', 'Kreativitas', 'Kolaborasi', 'Integritas dan Wewenang'].map((value) => (
              <div key={value} className="rounded-2xl bg-brand-surface p-4 text-center text-sm font-semibold text-brand-navy shadow-sm">
                {value}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-brand-lavender/30 bg-white p-6">
          <h2 className="font-serif text-2xl font-bold text-brand-navy">Company Branding</h2>
          <div className="mt-5 flex justify-center rounded-2xl bg-[#FAF8F5] p-6">
            <OrvaxiaLogo size={80} vertical />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="h-16 rounded-xl" style={{ backgroundColor: '#606C8D' }} />
              <p className="mt-3 text-sm font-semibold text-brand-navy">Bru Slate</p>
              <p className="text-xs text-slate-500">#606C8D</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="h-16 rounded-xl" style={{ backgroundColor: '#A99AB3' }} />
              <p className="mt-3 text-sm font-semibold text-brand-navy">Lavender</p>
              <p className="text-xs text-slate-500">#A99AB3</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="h-16 rounded-xl" style={{ backgroundColor: '#FDF5AE' }} />
              <p className="mt-3 text-sm font-semibold text-brand-navy">Pastel Yellow</p>
              <p className="text-xs text-slate-500">#FDF5AE</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Font yang digunakan mengacu pada identitas perusahaan: TAN Meringue, Canva Sans, Noto Serif Display, Brittany, dan Klein.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Kode warna Dusty Peach belum diverifikasi dari dokumen sumber, sehingga tidak ditetapkan sebagai swatch resmi pada halaman ini.
          </p>
        </section>

        <section className="mt-10 rounded-3xl border border-brand-lavender/30 bg-white p-5 sm:p-8">
          <OrgStructureTree />
        </section>

        <section className="mt-10 rounded-3xl border border-brand-lavender/30 bg-white p-6">
          <h2 className="font-serif text-2xl font-bold text-brand-navy">Our Activities</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {gallery.slice(0, 6).map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="relative flex h-40 items-center justify-center bg-brand-surface px-5 text-center text-xs text-brand-slate">
                  {item.imageUrl &&
                  !item.imageUrl.includes('unsplash.com') &&
                  item.imageUrl.includes('/storage/v1/object/public/orvaxia-images/') ? (
                    <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className="object-cover" />
                  ) : (
                    'Dokumentasi belum tersedia'
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-brand-navy">{item.title}</div>
                  {item.caption && <p className="mt-1 text-xs leading-5 text-slate-500">{item.caption}</p>}
                </div>
              </div>
            ))}
          </div>
          {gallery.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">Dokumentasi kegiatan akan ditampilkan setelah diunggah oleh pengelola galeri.</p>
          )}
        </section>
      </div>

      <MagicNavigation />
    </main>
  );
}
