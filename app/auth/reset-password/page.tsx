'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!supabase) return;

    const authClient = supabase;
    let active = true;
    const checkRecoverySession = async () => {
      const { data, error } = await authClient.auth.getSession();
      if (!active) return;
      if (error) {
        toast.error('Sesi reset tidak dapat diperiksa. Minta tautan reset baru.');
        return;
      }
      if (data.session) setIsReady(true);
    };

    void checkRecoverySession();
    const { data: listener } = authClient.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setIsReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !isReady) {
      toast.error('Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.');
      return;
    }
    if (password.length < 6) {
      toast.error('Kata sandi harus minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(`Kata sandi gagal diperbarui: ${error.message}`);
        return;
      }
      await supabase.auth.signOut();
      toast.success('Kata sandi berhasil diperbarui. Silakan masuk.');
      router.replace('/auth');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-navy">
      <header className="border-b border-brand-lavender/30 bg-white/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/"><OrvaxiaLogo size={36} /></Link>
          <Link href="/auth" className="text-xs font-semibold text-brand-slate hover:text-brand-navy">
            Kembali ke Login
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-brand-lavender/40 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-brand-surface text-brand-slate">
              <Lock size={18} />
            </div>
            <h1 className="font-serif text-2xl font-bold">Buat Kata Sandi Baru</h1>
            <p className="mt-1 text-xs text-slate-500">
              {isReady
                ? 'Masukkan kata sandi baru untuk akunmu.'
                : 'Memeriksa tautan reset. Jika gagal, minta tautan baru dari halaman login.'}
            </p>
          </div>
          <label className="block text-xs font-semibold text-slate-700">
            Kata sandi baru
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal focus:border-brand-slate focus:outline-none"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Ulangi kata sandi baru
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal focus:border-brand-slate focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!isReady || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy py-3.5 text-xs font-bold text-white transition-all hover:bg-brand-slate disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan kata sandi'}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </main>
  );
}
