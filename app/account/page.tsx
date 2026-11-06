'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, isAuthReady } = useCompanyStore();

  useEffect(() => {
    if (isAuthReady && (!currentUser || currentUser.role !== 'customer')) {
      router.replace('/auth?next=%2Faccount');
    }
  }, [currentUser, isAuthReady, router]);

  if (!isAuthReady || !currentUser || currentUser.role !== 'customer') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <p className="text-sm font-semibold text-slate-600">Memeriksa sesi akun...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
          <Link href="/" aria-label="ORVAXIA Home">
            <OrvaxiaLogo size={34} />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate transition hover:text-brand-navy">
            <ArrowLeft size={14} /> Beranda
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-brand-lavender/30 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand-navy">
              <UserRound size={20} />
            </div>
            <div>
              <span className="badge-brand">My Profile</span>
              <h1 className="mt-2 font-serif text-3xl font-bold text-brand-navy">{currentUser.fullName}</h1>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate">Nomor telepon terverifikasi</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700"><Mail size={15} /> {currentUser.phone}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate">Role</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700"><ShieldCheck size={15} /> {currentUser.role}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Link href="/account/profile" className="rounded-2xl border border-brand-lavender/30 bg-brand-surface p-4 text-center text-sm font-semibold text-brand-navy transition hover:border-brand-slate">Edit Profil</Link>
            <Link href="/account/orders" className="rounded-2xl border border-brand-lavender/30 bg-brand-surface p-4 text-center text-sm font-semibold text-brand-navy transition hover:border-brand-slate">Purchase History</Link>
            <Link href="/account/inbox" className="rounded-2xl border border-brand-lavender/30 bg-brand-surface p-4 text-center text-sm font-semibold text-brand-navy transition hover:border-brand-slate">Inbox</Link>
            <Link href="/shop" className="rounded-2xl border border-brand-lavender/30 bg-brand-surface p-4 text-center text-sm font-semibold text-brand-navy transition hover:border-brand-slate">Shop</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
