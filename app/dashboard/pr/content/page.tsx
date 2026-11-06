'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/company-store';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

type ContentCategory = 'home' | 'about' | 'contact' | 'shop' | 'announcement';
type ContentStatus = 'draft' | 'published';

interface ContentItem {
  id: string;
  slug: string;
  category: ContentCategory;
  title: string;
  body: string;
  status: ContentStatus;
  published_at: string | null;
  updated_at: string;
  updated_by: string | null;
}

const CATEGORIES: ContentCategory[] = ['home', 'about', 'contact', 'shop', 'announcement'];

export default function PRContentPage() {
  const { currentUser } = useCompanyStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ContentCategory>('home');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ContentCategory>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadContent = useCallback(async () => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      setIsLoading(false);
      return;
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error('Sesi Crew tidak tersedia. Silakan masuk kembali.');
      setIsLoading(false);
      return;
    }
    const response = await fetch('/api/content?manage=1', {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || 'Daftar konten gagal dimuat.');
      setIsLoading(false);
      return;
    }
    const content = result.content as ContentItem[];
    setItems(content);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${item.title} ${item.slug} ${item.body}`.toLowerCase().includes(query);
    return matchesStatus && matchesCategory && matchesSearch;
  }), [categoryFilter, items, search, statusFilter]);

  const resetForm = () => {
    setSelectedId('');
    setSlug('');
    setCategory('home');
    setTitle('');
    setBody('');
  };

  const selectItem = (item: ContentItem) => {
    setSelectedId(item.id);
    setSlug(item.slug);
    setCategory(item.category);
    setTitle(item.title);
    setBody(item.body);
  };

  const saveContent = async (status: ContentStatus) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error('Sesi Crew tidak tersedia. Silakan masuk kembali.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ slug, category, title, body, status }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || 'Konten gagal disimpan.');
        return;
      }
      const saved = result.content as ContentItem;
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      selectItem(saved);
      toast.success(status === 'published' ? 'Konten berhasil dipublikasikan.' : 'Draft berhasil disimpan.');
    } catch (error) {
      console.error('CMS save request failed', error);
      toast.error('Konten gagal disimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteContent = async (id: string, slug: string) => {
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }
    if (!window.confirm(`Hapus konten "${slug}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error('Sesi Crew tidak tersedia. Silakan masuk kembali.');
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/content?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || 'Konten gagal dihapus.');
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedId === id) {
        resetForm();
      }
      toast.success('Konten berhasil dihapus.');
    } catch (error) {
      console.error('CMS delete request failed', error);
      toast.error('Konten gagal dihapus. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <span className="badge-brand">Public Relations</span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-brand-navy">CMS Konten Publik</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Simpan draft atau publikasikan konten tanpa deployment. Konten hanya tampil di halaman publik setelah dipublikasikan.
        </p>
        <p className="mt-1 text-xs text-slate-500">Akun: {currentUser?.fullName || 'Crew PR'}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Cari konten</span>
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul, slug, isi..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ContentStatus)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="all">Semua status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | ContentCategory)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="all">Semua kategori</option>
              {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Konten baru</button>
          </div>
          {isLoading ? <p className="py-8 text-center text-sm text-slate-500">Memuat daftar konten...</p> : filteredItems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Belum ada konten yang sesuai.</p>
          ) : (
            <ul className="max-h-[34rem] space-y-2 overflow-auto">
              {filteredItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <button type="button" onClick={() => selectItem(item)} className={`flex-1 rounded-2xl border p-4 text-left ${selectedId === item.id ? 'border-brand-slate bg-brand-surface' : 'border-slate-200 bg-white'}`}>
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-brand-navy">{item.title}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">{item.status}</span>
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">{item.category} · {item.slug}</span>
                    <span className="mt-2 block line-clamp-2 text-xs leading-5 text-slate-600">{item.body}</span>
                    <span className="mt-2 block text-[10px] text-slate-400">
                      Diperbarui {new Date(item.updated_at).toLocaleString('id-ID')}
                      {item.updated_by ? ` · Editor ${item.updated_by.slice(0, 8)}` : ''}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); void deleteContent(item.id, item.slug); }}
                    disabled={isDeleting}
                    aria-label={`Hapus ${item.title}`}
                    className="rounded-xl border border-rose-200 p-2.5 text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <form onSubmit={(event) => { event.preventDefault(); void saveContent('draft'); }} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-brand-navy">{selectedId ? 'Edit konten' : 'Tambah konten'}</h2>
            <label className="block text-xs font-semibold text-slate-700">
              Slug unik
              <input required pattern="[a-z0-9][a-z0-9-]{1,79}" maxLength={80} value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="home-introduction" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Kategori
              <select value={category} onChange={(event) => setCategory(event.target.value as ContentCategory)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal">
                {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Judul
              <input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Isi
              <textarea required maxLength={10000} rows={7} value={body} onChange={(event) => setBody(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={isSaving} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-brand-navy disabled:opacity-50">Simpan draft</button>
              <button type="button" disabled={isSaving} onClick={() => void saveContent('published')} className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Publikasikan</button>
              {selectedId && items.find((item) => item.id === selectedId)?.status === 'published' && (
                <button type="button" disabled={isSaving} onClick={() => void saveContent('draft')} className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-50">Unpublish</button>
              )}
            </div>
          </form>

          <section className="rounded-3xl border border-brand-lavender/30 bg-brand-surface p-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-slate">Preview</span>
            <h2 className="mt-2 font-serif text-xl font-bold text-brand-navy">{title || 'Judul konten'}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{body || 'Pratinjau isi konten akan tampil di sini.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
