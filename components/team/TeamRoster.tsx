'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Instagram, Search, X, User } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/company-store';
import { TeamMember } from '@/lib/types';

const divisions = [
  { id: 'all', label: 'Semua Divisi' },
  { id: 'Executive', label: 'Executive' },
  { id: 'Kesekretariatan', label: 'Kesekretariatan' },
  { id: 'Finance', label: 'Finance' },
  { id: 'HRD', label: 'HRD' },
  { id: 'Marketing', label: 'Marketing' },
  { id: 'Produksi', label: 'Produksi' },
  { id: 'Public Relations', label: 'Public Relations' },
  { id: 'Sales', label: 'Sales' },
];

function isStoredPortrait(url: string) {
  try {
    const parsedUrl = new URL(url);
    const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : '';
    return (
      (parsedUrl.origin === supabaseOrigin &&
        parsedUrl.pathname.startsWith('/storage/v1/object/public/orvaxia-images/crew/')) ||
      (parsedUrl.origin === supabaseOrigin &&
        parsedUrl.pathname.startsWith('/storage/v1/object/public/orvaxia-images/catalog/'))
    );
  } catch {
    return false;
  }
}

function MemberPortrait({ member, large = false }: { member: TeamMember; large?: boolean }) {
  const hasPhoto = isStoredPortrait(member.avatarUrl);
  return (
    <div className={`relative overflow-hidden bg-[#FAF8F5] ${large ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
      {hasPhoto ? (
        <Image
          src={member.avatarUrl}
          alt={`Foto ${member.name}`}
          fill
          unoptimized
          sizes={large ? '(max-width: 640px) 90vw, 460px' : '(max-width: 640px) 50vw, 25vw'}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F4F2F7] p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-lavender/30 bg-white text-brand-slate shadow-2xs">
            <User size={22} strokeWidth={1.5} />
          </div>
          <span className="mt-2.5 text-xs text-brand-slate">
            Foto belum tersedia
          </span>
        </div>
      )}
    </div>
  );
}

export function TeamRoster() {
  const { teamMembers } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  const visibleMembers = useMemo(
    () => teamMembers.filter((member) => member.profileVisible !== false),
    [teamMembers],
  );

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return visibleMembers.filter((member) => {
      const matchesDivision = selectedDivision === 'all' || member.division === selectedDivision;
      const matchesSearch =
        !query ||
        [member.name, member.position, member.division].some((value) =>
          value.toLocaleLowerCase().includes(query),
        );
      return matchesDivision && matchesSearch;
    });
  }, [visibleMembers, searchQuery, selectedDivision]);

  useEffect(() => {
    if (!activeMember) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMember(null);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusableElements.length) return;
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [activeMember]);

  const instagramUrl = (member: TeamMember) => {
    if (!member.instagramUrl) return null;
    try {
      const url = new URL(member.instagramUrl);
      return url.protocol === 'https:' && ['www.instagram.com', 'instagram.com'].includes(url.hostname)
        ? url.toString()
        : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Kolom Filter & Pencarian */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="relative block w-full sm:max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Cari nama anggota, jabatan, atau divisi..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-brand-lavender/30 bg-white py-2.5 pl-11 pr-4 text-xs text-brand-navy shadow-2xs focus:border-brand-slate focus:outline-none focus:ring-2 focus:ring-brand-slate/20"
            />
          </label>
          <span className="text-xs text-brand-slate">
            {filteredMembers.length} dari {visibleMembers.length} anggota
          </span>
        </div>

        {/* Pill Navigasi Filter Divisi */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Filter divisi">
          {divisions.map((division) => (
            <button
              key={division.id}
              type="button"
              onClick={() => setSelectedDivision(division.id)}
              aria-pressed={selectedDivision === division.id}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                selectedDivision === division.id
                  ? 'bg-brand-navy text-white shadow-brand-sm'
                  : 'border border-brand-lavender/30 bg-white text-slate-600 hover:border-brand-slate hover:bg-brand-surface'
              }`}
            >
              {division.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Roster Kartu Anggota */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
        {filteredMembers.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => setActiveMember(member)}
            aria-label={`Lihat profil ${member.name}`}
            className="group overflow-hidden rounded-2xl border border-brand-lavender/30 bg-white text-left shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-brand-slate hover:shadow-brand-sm focus:outline-none focus:ring-2 focus:ring-brand-slate"
          >
            <MemberPortrait member={member} />
            <span className="block p-4">
              <span className="block text-xs text-brand-slate">
                {member.division}
              </span>
              <span className="mt-1 block line-clamp-1 font-display text-sm font-semibold text-brand-navy">
                {member.name}
              </span>
              <span className="mt-0.5 block line-clamp-2 min-h-8 text-[11px] leading-4 text-slate-500">
                {member.position}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Pesan Jika Hasil Pencarian Kosong */}
      {filteredMembers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-lavender/40 bg-white p-12 text-center text-xs text-slate-500">
          Tidak ada anggota yang sesuai dengan filter atau kata kunci pencarian.
        </div>
      )}

      {/* Modal Dialog Detail Anggota */}
      {activeMember && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-brand-navy/60 p-4 backdrop-blur-xs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveMember(null);
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-member-title"
            className="grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:grid-cols-[0.85fr_1.15fr] border border-brand-lavender/30"
          >
            <div className="group">
              <MemberPortrait member={activeMember} large />
            </div>

            <div className="flex flex-col p-6 sm:p-8 justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-brand-slate">
                    Divisi {activeMember.division}
                  </span>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setActiveMember(null)}
                    aria-label="Tutup profil"
                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-navy"
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 id="team-member-title" className="mt-3 font-display text-xl font-bold text-brand-navy sm:text-2xl">
                  {activeMember.name}
                </h2>
                <p className="mt-1 text-xs text-brand-slate">{activeMember.position}</p>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-xs">
                  <div>
                    <dt className="text-slate-400">Kelas</dt>
                    <dd className="mt-0.5 font-medium text-brand-navy">{activeMember.className || 'SMKN 2 Buduran'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Status</dt>
                    <dd className="mt-0.5 font-medium text-brand-navy">{activeMember.status}</dd>
                  </div>
                </dl>

                <p className="mt-4 text-xs leading-6 text-slate-600">
                  {activeMember.bio || 'Profil anggota terdaftar dalam tim Orvaxia.'}
                </p>

                {activeMember.responsibilities && activeMember.responsibilities.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <span className="text-xs font-medium text-brand-slate block">
                      Tanggung Jawab Utama
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {activeMember.responsibilities.map((responsibility) => (
                        <li key={responsibility} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-slate" />
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveMember(null)}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Tutup
                </button>
                {instagramUrl(activeMember) && (
                  <a
                    href={instagramUrl(activeMember) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 text-xs font-medium text-white hover:bg-brand-slate transition-all"
                  >
                    <Instagram size={14} /> Instagram
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
