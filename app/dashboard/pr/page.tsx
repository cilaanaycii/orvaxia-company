'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  Megaphone,
  Plus,
  Trash2,
  ImageIcon,
  Instagram,
  Share2,
  HelpCircle,
  UploadCloud,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PRDashboard() {
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    gallery,
    addGalleryItem,
    deleteGalleryItem,
    faqs,
    siteSettings,
    updateSiteSettings,
    currentUser,
  } = useCompanyStore();

  const [activeTab, setActiveTab] = useState<'announcements' | 'gallery' | 'socials' | 'faqs'>('announcements');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Gallery form
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState<'Produksi' | 'Produk' | 'Aktivitas Anggota' | 'Event'>('Produksi');
  const [galImageUrl, setGalImageUrl] = useState('');
  const [galCaption, setGalCaption] = useState('');
  const [galDate, setGalDate] = useState(new Date().toISOString().slice(0, 10));
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Social form
  const [igHandle, setIgHandle] = useState(siteSettings.instagram);
  const [tiktokHandle, setTiktokHandle] = useState(siteSettings.tiktok);

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) {
      toast.error('Mohon lengkapi judul dan isi pengumuman');
      return;
    }

    addAnnouncement({
      title: annTitle,
      content: annContent,
      author: currentUser?.fullName || 'Sava Nada Hasana (Director of PR)',
      isPublic: true,
      priority: annPriority,
    });

    setAnnTitle('');
    setAnnContent('');
  };

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle || !galImageUrl) {
      toast.error('Mohon lengkapi judul dan URL foto galeri');
      return;
    }

    addGalleryItem({
      title: galTitle,
      category: galCategory,
      imageUrl: galImageUrl,
      caption: galCaption || galTitle,
      date: galDate,
    });

    setGalTitle('');
    setGalImageUrl('');
    setGalCaption('');
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar (JPG, PNG, WebP) yang diizinkan');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5 MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setGalImageUrl(data.url);
        toast.success('Foto berhasil diunggah!');
      } else {
        // Fallback: convert to Data URL for client storage
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalImageUrl(reader.result as string);
          toast.success('Foto siap digunakan (pratinjau lokal)');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalImageUrl(reader.result as string);
        toast.info('Foto disimpan dalam pratinjau lokal');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveSocials = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      instagram: igHandle,
      tiktok: tiktokHandle,
    });
    toast.success('Tautan media sosial berhasil diperbarui');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Komunikasi & Hubungan Masyarakat</span>
            <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-bold">
              DIVISI PUBLIC RELATIONS
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            PR & Public Communications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola galeri kegiatan SMKN 2 Buduran, rilis pengumuman, media sosial resmi, dan FAQ pelanggan.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/pr/content" className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-slate">
            CMS Konten
          </Link>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'announcements'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Pengumuman ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'gallery'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Galeri Dokumentasi ({gallery.length})
          </button>
          <button
            onClick={() => setActiveTab('socials')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'socials'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Media Sosial
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'faqs'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            FAQ ({faqs.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ANNOUNCEMENTS ================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddAnnouncement}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs"
          >
            <h3 className="font-serif text-base font-bold text-brand-navy border-b border-slate-100 pb-2.5">
              + Buat Pengumuman Publik / Internal Baru
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-800 block mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Distribusi Pesanan Kelas SMKN 2 Buduran"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Prioritas</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as 'normal' | 'urgent')}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent / Penting</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="font-semibold text-slate-800 block mb-1">Isi Pengumuman</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan detail pengumuman yang ingin disampaikan..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-navy"
              >
                <Megaphone size={14} /> Publikasikan Pengumuman
              </button>
            </div>
          </form>

          {/* Published Announcements List */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-brand-navy">
              Pengumuman Sedang Tayang ({announcements.length})
            </h4>

            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <h5 className="font-bold text-sm text-slate-900">{ann.title}</h5>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Penulis: {ann.author} · Tanggal: {ann.createdAt}
                  </p>
                </div>

                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Hapus Pengumuman"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GALLERY CRUD ================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* New Gallery Item Form */}
          <form
            onSubmit={handleAddGallery}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-serif text-base font-bold text-brand-navy flex items-center gap-2">
                <ImageIcon size={18} className="text-brand-slate" />
                <span>+ Unggah Dokumentasi Galeri Baru</span>
              </h3>
              <span className="text-[11px] text-slate-400">Ditampilkan di halaman Tentang Perusahaan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Judul Dokumentasi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proses Finishing Rajutan Batch 1"
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Kategori Kegiatan</label>
                <select
                  value={galCategory}
                  onChange={(e) => setGalCategory(e.target.value as 'Produksi' | 'Produk' | 'Aktivitas Anggota' | 'Event')}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none bg-white"
                >
                  <option value="Produksi">Produksi Rajutan</option>
                  <option value="Produk">Produk & Display</option>
                  <option value="Aktivitas Anggota">Aktivitas Anggota</option>
                  <option value="Event">Event & Pameran</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Tanggal Kegiatan</label>
                <input
                  type="date"
                  value={galDate}
                  onChange={(e) => setGalDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-semibold text-slate-800 block mb-1">Foto / URL Gambar *</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://... atau gunakan tombol unggah di samping"
                    value={galImageUrl}
                    onChange={(e) => setGalImageUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                  />
                  <label className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0">
                    <UploadCloud size={16} />
                    <span>{isUploadingImage ? 'Mengunggah...' : 'Unggah File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
                {galImageUrl && (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <Image src={galImageUrl} alt="Pratinjau" fill unoptimized className="object-cover" />
                    </div>
                    <span className="text-[11px] text-slate-600 truncate">{galImageUrl}</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-3">
                <label className="font-semibold text-slate-800 block mb-1">Keterangan / Caption</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat tentang foto dokumentasi ini..."
                  value={galCaption}
                  onChange={(e) => setGalCaption(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-navy"
              >
                <Plus size={14} /> Simpan Foto ke Galeri
              </button>
            </div>
          </form>

          {/* Gallery Items Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif font-bold text-sm text-brand-navy">
                Koleksi Galeri Dokumentasi ({gallery.length} foto)
              </h4>
              <span className="text-[11px] text-slate-500">Otomatis sinkron dengan landing page & About</span>
            </div>

            {gallery.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                Belum ada foto galeri yang diunggah.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-brand-navy">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {item.date}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-brand-navy leading-snug">{item.title}</h5>
                        <p className="text-xs text-slate-600 line-clamp-2">{item.caption}</p>
                      </div>
                    </div>

                    <div className="p-3 pt-0 flex justify-end">
                      <button
                        onClick={() => deleteGalleryItem(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus foto ini"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SOCIALS ================= */}
      {activeTab === 'socials' && (
        <form
          onSubmit={handleSaveSocials}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 text-xs max-w-xl"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Saluran Media Sosial Resmi ORVAXIA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Akun resmi yang ditautkan di header, footer, dan landing page publik.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Akun Instagram (@)
              </label>
              <input
                type="text"
                value={igHandle}
                onChange={(e) => setIgHandle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Profil: instagram.com/{igHandle}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Akun TikTok (@)
              </label>
              <input
                type="text"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Profil: tiktok.com/@{tiktokHandle}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-navy"
            >
              Simpan Tautan Sosial Media
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 4: FAQS ================= */}
      {activeTab === 'faqs' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif text-lg font-bold text-brand-navy border-b border-slate-100 pb-3">
            Daftar FAQ Publik ({faqs.length})
          </h3>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                <span className="rounded-md bg-brand-surface px-2 py-0.5 text-[10px] font-bold text-brand-slate border border-brand-lavender/30">
                  {faq.category}
                </span>
                <h5 className="font-bold text-xs text-slate-900 mt-1">{faq.question}</h5>
                <p className="text-slate-600 mt-1 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
