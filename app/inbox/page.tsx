'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft, Bell, Check, CheckCheck, Inbox as InboxIcon } from 'lucide-react';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';

export default function InboxPage() {
  const router = useRouter();
  const {
    currentUser,
    isAuthReady,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useCompanyStore();
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  useEffect(() => {
    if (isAuthReady && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, isAuthReady, router]);

  return (
    <main className="min-h-screen bg-[#F4F6F9] pb-32 text-brand-navy">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="Kembali ke beranda">
            <OrvaxiaLogo size={36} />
          </Link>
          <Link
            href={currentUser ? `/dashboard/${currentUser.role}` : '/'}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            {currentUser ? 'Dashboard' : 'Beranda'}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-brand-slate shadow-sm">
              <Bell size={13} /> Pusat notifikasi
            </span>
            <h1 className="mt-3 font-serif text-3xl font-bold text-brand-navy">Inbox</h1>
            <p className="mt-1 text-sm text-slate-500">
              {currentUser ? `Notifikasi untuk ${currentUser.fullName}` : 'Pembaruan dan informasi akun Anda'}
            </p>
          </div>
          {currentUser && unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllNotificationsRead()}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-brand-slate hover:bg-slate-50"
            >
              <CheckCheck size={14} /> Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {!isAuthReady ? (
            <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-slate border-t-transparent" />
              Memuat Inbox...
            </div>
          ) : !currentUser || notifications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface text-brand-slate">
                <InboxIcon size={25} />
              </span>
              <h2 className="mt-4 text-sm font-bold text-slate-800">Belum ada notifikasi</h2>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                {currentUser
                  ? 'Notifikasi baru untuk akun Anda akan muncul di sini.'
                  : 'Untuk akun pembeli, cek perkembangan pesanan melalui halaman pelacakan.'}
              </p>
              {!currentUser && (
                <Link
                  href="/order-tracking"
                  className="mt-4 inline-flex rounded-full bg-brand-slate px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-navy"
                >
                  Cek Status Pesanan
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => {
                    if (!notification.readAt) void markNotificationRead(notification.id);
                    router.push(notification.href);
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:px-6 ${
                    notification.readAt ? 'bg-white' : 'bg-sky-50/70'
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-slate shadow-sm">
                    {notification.readAt ? <Check size={15} /> : <Bell size={15} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800">{notification.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">{notification.message}</span>
                    <span className="mt-2 block text-[10px] text-slate-400">
                      {new Date(notification.createdAt).toLocaleString('id-ID')}
                    </span>
                  </span>
                  {!notification.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      <MagicNavigation />
    </main>
  );
}
