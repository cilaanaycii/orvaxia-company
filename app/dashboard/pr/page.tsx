'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  Megaphone,
  Plus,
  Trash2,
  Image,
  Instagram,
  Share2,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PRDashboard() {
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    gallery,
    faqs,
    siteSettings,
    updateSiteSettings,
    currentUser,
  } = useCompanyStore();

  const [activeTab, setActiveTab] = useState<'announcements' | 'socials' | 'faqs'>('announcements');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

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
            Kelola pengumuman publik, rilis kegiatan rajutan, media sosial resmi (@orvaxia.company), dan tanya jawab pelanggan.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'announcements'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Pengumuman Perusahaan ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('socials')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'socials'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Media Sosial & Kontak
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'faqs'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            FAQ Pelanggan ({faqs.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ANNOUNCEMENTS ================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* New Announcement Form */}
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
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
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

      {/* ================= TAB 2: SOCIALS ================= */}
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

      {/* ================= TAB 3: FAQS ================= */}
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
