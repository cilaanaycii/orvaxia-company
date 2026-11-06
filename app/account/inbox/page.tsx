'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';

export default function AccountInboxPage() {
  const router = useRouter();
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useCompanyStore();

  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
        <p className="text-sm font-semibold text-slate-600">Memeriksa akses inbox...</p>
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
          <Link href="/account" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate transition hover:text-brand-navy">
            <ArrowLeft size={14} /> My Profile
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge-brand">Inbox</span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-brand-navy">Notifikasi customer</h1>
          </div>
          {notifications.length > 0 && (
            <button type="button" onClick={() => void markAllNotificationsRead()} className="inline-flex items-center gap-2 rounded-full border border-brand-lavender/30 bg-white px-3 py-2 text-xs font-semibold text-brand-slate transition hover:border-brand-slate">
              <CheckCheck size={14} /> Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="space-y-3 rounded-[2rem] border border-brand-lavender/30 bg-white p-4 shadow-sm">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#FAF8F5] p-8 text-center text-sm text-slate-600">
              <Bell className="mx-auto mb-3 text-brand-slate" size={24} />
              Belum ada notifikasi untuk akun Anda.
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.readAt) void markNotificationRead(notification.id);
                }}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left ${notification.readAt ? 'border-slate-200 bg-white' : 'border-brand-lavender/30 bg-brand-surface'}`}
              >
                <span className="mt-1 rounded-full bg-white p-2 text-brand-slate shadow-sm">
                  <Bell size={14} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-brand-navy">{notification.title}</span>
                  <span className="mt-1 block text-xs leading-6 text-slate-600">{notification.message}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
