'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Inbox as InboxIcon,
  ExternalLink,
  Clock,
  Tag,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { useCompanyStore } from '@/lib/store/company-store';
import { DashboardNotification } from '@/lib/types';

export default function InboxPage() {
  const router = useRouter();
  const {
    currentUser,
    isAuthReady,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useCompanyStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthReady && !currentUser) {
      router.replace('/auth?tab=login&next=/inbox');
    }
  }, [currentUser, isAuthReady, router]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const readCount = notifications.filter((n) => Boolean(n.readAt)).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.readAt;
    if (activeFilter === 'read') return Boolean(item.readAt);
    return true;
  });

  const selectedNotification =
    notifications.find((n) => n.id === selectedNotificationId) || null;

  const handleSelectNotification = async (notification: DashboardNotification) => {
    setSelectedNotificationId(notification.id);
    if (!notification.readAt) {
      await markNotificationRead(notification.id);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'order':
        return 'Pesanan';
      case 'shipment':
        return 'Pengiriman';
      case 'task':
        return 'Tugas Operasional';
      case 'task_reminder':
        return 'Pengingat Tugas';
      default:
        return 'Notifikasi Sistem';
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Kembali ke beranda ORVAXIA" className="transition-transform active:scale-95">
            <OrvaxiaLogo size={34} />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={
                !currentUser
                  ? '/'
                  : currentUser.role === 'customer'
                  ? '/account'
                  : `/dashboard/${currentUser.role}`
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/40 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-navy shadow-xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
            >
              <ArrowLeft size={14} className="text-brand-slate" />
              <span>
                {!currentUser
                  ? 'Beranda'
                  : currentUser.role === 'customer'
                  ? 'Area Akun'
                  : 'Dashboard'}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Title & Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-brand">
                <Bell size={12} className="text-brand-slate" />
                Pusat Komunikasi & Notifikasi
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-brand-navy sm:text-4xl">
              Inbox
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {currentUser
                ? `Pembaruan resmi untuk ${currentUser.fullName} (${currentUser.role.toUpperCase()})`
                : 'Pusat notifikasi dan informasi penting akun Anda'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllNotificationsRead()}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/40 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-slate shadow-xs transition-all duration-200 hover:border-brand-slate hover:bg-brand-surface hover:text-brand-navy active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
              >
                <CheckCheck size={14} className="text-brand-slate" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('all');
              setSelectedNotificationId(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate ${
              activeFilter === 'all'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface'
            }`}
          >
            <span>Semua</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter('unread');
              setSelectedNotificationId(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate ${
              activeFilter === 'unread'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface'
            }`}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilter('read');
              setSelectedNotificationId(null);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate ${
              activeFilter === 'read'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'border border-brand-lavender/35 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface'
            }`}
          >
            <span>Sudah Dibaca</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
              {readCount}
            </span>
          </button>
        </div>

        {/* Content Box */}
        {!isAuthReady ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-brand-lavender/30 bg-white p-16 text-xs text-slate-500 shadow-xs">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-slate border-t-transparent" />
            <span>Memulihkan notifikasi akun...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-lavender/50 bg-white/80 p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-brand-surface text-brand-slate shadow-xs">
              <InboxIcon size={26} />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-brand-navy">
              {activeFilter === 'unread'
                ? 'Tidak ada pesan yang belum dibaca'
                : activeFilter === 'read'
                ? 'Belum ada arsip pesan yang terbaca'
                : 'Kotak masuk masih kosong'}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
              {currentUser
                ? 'Semua pembaruan pesanan, tugas operasional, dan pengumuman divisi akan ditampilkan rapi di sini.'
                : 'Silakan masuk ke akun Anda untuk melihat pembaruan dan riwayat transaksi.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* List Column */}
            <div
              className={`${
                selectedNotification ? 'hidden lg:block lg:col-span-5' : 'col-span-12'
              } space-y-2`}
            >
              <div className="overflow-hidden rounded-3xl border border-brand-lavender/30 bg-white shadow-xs divide-y divide-slate-100">
                {filteredNotifications.map((item) => {
                  const isUnread = !item.readAt;
                  const isSelected = item.id === selectedNotificationId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void handleSelectNotification(item)}
                      className={`group flex w-full items-start gap-3.5 p-4 text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-brand-surface/80 border-l-4 border-l-brand-slate'
                          : isUnread
                          ? 'bg-white hover:bg-brand-surface/50 font-medium'
                          : 'bg-white/60 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {/* Read status icon */}
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${
                          isUnread
                            ? 'border-brand-lavender/40 bg-brand-surface text-brand-slate shadow-xs'
                            : 'border-slate-100 bg-slate-50 text-slate-400'
                        }`}
                      >
                        {isUnread ? <Bell size={14} /> : <Check size={14} />}
                      </span>

                      {/* Snippet */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">
                            {getKindLabel(item.kind)}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                        <h4
                          className={`mt-0.5 truncate text-xs ${
                            isUnread ? 'font-bold text-brand-navy' : 'font-medium text-slate-700'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                          {item.message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {isUnread && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-slate shadow-xs" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail Column */}
            {selectedNotification && (
              <div className="col-span-12 lg:col-span-7">
                <article className="overflow-hidden rounded-3xl border border-brand-lavender/35 bg-white p-6 shadow-sm space-y-5">
                  {/* Top Bar inside Detail */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <button
                      type="button"
                      onClick={() => setSelectedNotificationId(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-slate hover:text-brand-navy transition-colors lg:hidden"
                    >
                      <ArrowLeft size={14} />
                      <span>Kembali ke daftar pesan</span>
                    </button>

                    <div className="hidden lg:flex items-center gap-2">
                      <span className="rounded-md border border-brand-lavender/30 bg-brand-surface px-2.5 py-0.5 text-[10px] font-bold text-brand-slate uppercase">
                        {getKindLabel(selectedNotification.kind)}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(selectedNotification.createdAt)}
                      </span>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      Terbaca
                    </span>
                  </div>

                  {/* Subject & Metadata */}
                  <div className="space-y-2">
                    <h2 className="font-display text-xl font-bold text-brand-navy sm:text-2xl leading-snug">
                      {selectedNotification.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 lg:hidden">
                      <span className="font-bold text-brand-slate uppercase text-[10px]">
                        {getKindLabel(selectedNotification.kind)}
                      </span>
                      <span>•</span>
                      <span>{formatDateTime(selectedNotification.createdAt)}</span>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="rounded-2xl border border-brand-lavender/25 bg-[#FAF8F5]/80 p-5 text-xs leading-relaxed text-slate-700 sm:text-sm">
                    <p className="whitespace-pre-line">{selectedNotification.message}</p>
                  </div>

                  {/* Action Link Footer */}
                  {selectedNotification.href && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-500">
                        Pesan ini memiliki tautan tindakan langsung:
                      </span>
                      <Link
                        href={selectedNotification.href}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-xs font-bold text-white shadow-xs transition-all duration-150 hover:bg-brand-slate active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate"
                      >
                        <span>Buka Halaman Terkait</span>
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  )}
                </article>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Floating Mobile Dock */}
      <MagicNavigation />
    </main>
  );
}
