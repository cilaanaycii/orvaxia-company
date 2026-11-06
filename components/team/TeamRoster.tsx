'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Instagram, Search, X } from 'lucide-react';
import { useCompanyStore } from '@/lib/store/company-store';
import { TeamMember } from '@/lib/types';

const divisions = [
  { id: 'all', label: 'Semua anggota' },
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
      parsedUrl.origin === supabaseOrigin &&
      parsedUrl.pathname.startsWith('/storage/v1/object/public/orvaxia-images/crew/') ||
      parsedUrl.origin === supabaseOrigin &&
      parsedUrl.pathname.startsWith('/storage/v1/object/public/orvaxia-images/catalog/')
    );
  } catch {
    return false;
  }
}

function MemberPortrait({ member, large = false }: { member: TeamMember; large?: boolean }) {
  const hasPhoto = isStoredPortrait(member.avatarUrl);
  return (
    <div className={`relative overflow-hidden bg-[#EEEAF2] ${large ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F4F0F6] via-[#ECE9F1] to-[#E8E3ED] px-4 text-center">
          <span className="font-serif text-5xl font-semibold tracking-[0.12em] text-brand-slate/70">
            {member.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}
          </span>
          <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-slate/70">
            ORVAXIA COMPANY
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
    () => teamMembers.filter((member) => member.status === 'Aktif' && member.profileVisible !== false),
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
    <div className="w-full space-y-7">
      <div className="flex flex-col gap-4">
        <label className="relative block w-full sm:max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Cari nama, jabatan, atau divisi"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-brand-slate focus:outline-none focus:ring-1 focus:ring-brand-slate"
          />
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Filter divisi">
          {divisions.map((division) => (
            <button
              key={division.id}
              type="button"
              onClick={() => setSelectedDivision(division.id)}
              aria-pressed={selectedDivision === division.id}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                selectedDivision === division.id
                  ? 'bg-brand-navy text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-slate'
              }`}
            >
              {division.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {filteredMembers.length} dari {visibleMembers.length} profil anggota
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {filteredMembers.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => setActiveMember(member)}
            aria-label={`Lihat profil ${member.name}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-brand-lavender hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-slate"
          >
            <MemberPortrait member={member} />
            <span className="block p-3 sm:p-4">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-slate">
                {member.division}
              </span>
              <span className="mt-1 block line-clamp-2 min-h-10 font-serif text-sm font-bold leading-5 text-brand-navy sm:text-base">
                {member.name}
              </span>
              <span className="mt-1 block min-h-8 line-clamp-2 text-[11px] leading-4 text-slate-500">
                {member.position}
              </span>
            </span>
          </button>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Tidak ada anggota yang cocok dengan pencarian.
        </div>
      )}

      {activeMember && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-brand-navy/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveMember(null);
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-member-title"
            className="grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:grid-cols-[0.85fr_1.15fr]"
          >
            <div className="group">
              <MemberPortrait member={activeMember} large />
            </div>
            <div className="flex flex-col p-5 sm:p-7">
              <div className="flex justify-end">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setActiveMember(null)}
                  aria-label="Tutup profil"
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-slate"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-slate">
                {activeMember.division}
              </p>
              <h2 id="team-member-title" className="mt-2 font-serif text-2xl font-bold leading-tight text-brand-navy sm:text-3xl">
                {activeMember.name}
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-600">{activeMember.position}</p>
              <dl className="mt-5 grid gap-3 border-y border-slate-100 py-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Kelas</dt>
                  <dd className="mt-0.5 text-slate-700">{activeMember.className || 'Belum dilengkapi'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Status keanggotaan</dt>
                  <dd className="mt-0.5 text-slate-700">{activeMember.status}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {activeMember.bio || 'Informasi profil belum dilengkapi.'}
              </p>
              {activeMember.responsibilities.length > 0 && (
                <ul className="mt-4 space-y-2 text-xs leading-5 text-slate-600">
                  {activeMember.responsibilities.map((responsibility) => (
                    <li key={responsibility} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-slate" />
                      {responsibility}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => setActiveMember(null)}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                {instagramUrl(activeMember) && (
                  <a
                    href={instagramUrl(activeMember) || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-slate"
                  >
                    <Instagram size={14} /> Lihat Instagram
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
