'use client';

import { useMemo } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { Network, Users } from 'lucide-react';

const DIVISIONS = [
  'Kesekretariatan',
  'Finance',
  'HRD',
  'Marketing',
  'Produksi',
  'Public Relations',
  'Sales',
];

export function OrgStructureTree() {
  const { teamMembers } = useCompanyStore();
  const members = useMemo(
    () => teamMembers.filter((member) => member.status === 'Aktif'),
    [teamMembers],
  );
  const ceo = members.find((member) => /chief executive officer|\bceo\b/i.test(member.position));
  const secretary = members.filter(
    (member) => member.division === 'Kesekretariatan' && member.id !== ceo?.id,
  );
  const divisions = DIVISIONS.map((name) => {
    const divisionMembers = members
      .filter(
        (member) =>
          member.division === name &&
          member.id !== ceo?.id &&
          !secretary.some((secretaryMember) => secretaryMember.id === member.id),
      )
      .sort((left, right) => left.sortOrder - right.sortOrder);
    return { name, members: divisionMembers };
  }).filter((division) => division.members.length > 0);

  const MemberRow = ({ name, position, isLeader = false }: { name: string; position: string; isLeader?: boolean }) => (
    <div className={`rounded-xl border p-3 transition-all ${
      isLeader
        ? 'border-brand-lavender/60 bg-white shadow-2xs'
        : 'border-slate-100 bg-white/80 hover:bg-white'
    }`}>
      <p className="text-xs font-bold leading-5 text-brand-navy">{name}</p>
      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{position || 'Anggota Tim'}</p>
    </div>
  );

  return (
    <div className="w-full space-y-8">
      <div className="mx-auto max-w-2xl text-center space-y-2">
        <span className="badge-brand">
          <Network size={12} className="text-brand-slate" />
          Struktur Resmi
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
          Bagan Organisasi Perusahaan
        </h2>
        <p className="text-xs leading-5 text-slate-600 sm:text-sm">
          Susunan tim resmi ORVAXIA COMPANY yang dikelola oleh divisi HRD.
        </p>
        <span className="inline-block rounded-full bg-brand-surface px-3 py-1 text-[11px] font-semibold text-brand-slate border border-brand-lavender/30">
          {members.length} dari 31 anggota aktif tercatat
        </span>
      </div>

      {/* Tingkat Pimpinan Tertinggi (CEO & Kesekretariatan) */}
      <div className="flex flex-col items-center">
        {ceo ? (
          <div className="w-full max-w-sm rounded-2xl bg-brand-navy p-5 text-center text-white shadow-brand-sm">
            <span className="rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-peach">
              Pimpinan Tertinggi
            </span>
            <p className="mt-2 font-display text-lg font-bold">{ceo.name}</p>
            <p className="mt-0.5 text-xs text-white/80 font-medium">{ceo.position}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 text-center">
            Data pimpinan sedang diperbarui oleh sistem HRD.
          </div>
        )}

        {secretary.length > 0 && (
          <>
            <div className="h-6 w-0.5 bg-brand-lavender/50" />
            <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              {secretary.map((member) => (
                <MemberRow key={member.id} name={member.name} position={member.position} isLeader />
              ))}
            </div>
          </>
        )}

        <div className="h-6 w-0.5 bg-brand-lavender/50" />
      </div>

      {/* Grid Divisi Perusahaan */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {divisions.map(({ name, members: divisionMembers }) => {
          const directorIndex = divisionMembers.findIndex((member) => /director|direktur|head|ketua/i.test(member.position));
          const orderedMembers =
            directorIndex > 0
              ? [divisionMembers[directorIndex], ...divisionMembers.filter((_, index) => index !== directorIndex)]
              : divisionMembers;

          return (
            <section
              key={name}
              className="rounded-2xl border border-brand-lavender/30 bg-[#FAF8F5] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="mb-3.5 flex items-center justify-between border-b border-brand-lavender/25 pb-2.5">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-brand-navy">
                    Divisi {name}
                  </h3>
                  <span className="text-[10px] font-semibold text-brand-slate">
                    {orderedMembers.length} anggota
                  </span>
                </div>
                <div className="space-y-2">
                  {orderedMembers.map((member, index) => (
                    <MemberRow
                      key={member.id}
                      name={member.name}
                      position={member.position}
                      isLeader={index === 0 && directorIndex >= 0}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
