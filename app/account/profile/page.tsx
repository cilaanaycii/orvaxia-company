'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AccountProfilePage() {
  const router = useRouter();
  const { currentUser, isAuthReady } = useCompanyStore();
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);

  if (isAuthReady && (!currentUser || currentUser.role !== 'customer')) {
    router.replace('/auth?next=%2Faccount%2Fprofile');
  }
  if (!isAuthReady || !currentUser || currentUser.role !== 'customer') {
    return <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">Memeriksa sesi akun...</main>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      toast.error('Supabase belum dikonfigurasi.');
      return;
    }
    setIsSaving(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error('Sesi berakhir. Silakan masuk kembali.');
        return;
      }
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ fullName }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || 'Profil gagal disimpan.');
        return;
      }
      toast.success('Nama profil berhasil diperbarui.');
      router.refresh();
    } catch {
      toast.error('Profil gagal disimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 text-brand-navy">
      <section className="mx-auto max-w-xl rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/account" className="text-sm font-semibold text-brand-slate underline">Kembali ke akun</Link>
        <h1 className="mt-5 font-serif text-3xl font-bold">Profil Customer</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            Nama lengkap
            <input
              required
              maxLength={120}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold">
            Nomor telepon terverifikasi
            <input readOnly value={currentUser.phone} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-normal" />
          </label>
          <p className="text-xs leading-5 text-slate-500">Untuk mengganti nomor, verifikasi ulang melalui login OTP. Nomor tidak bisa diganti hanya dengan mengubah teks profil.</p>
          <button type="submit" disabled={isSaving} className="w-full rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Menyimpan...' : 'Simpan profil'}
          </button>
        </form>
      </section>
    </main>
  );
}
