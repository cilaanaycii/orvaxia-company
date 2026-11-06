'use client';

import { useMemo } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';

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

  const MemberRow = ({ name, position }: { name: string; position: string }) => (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-xs font-semibold leading-5 text-brand-navy">{name}</p>
      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{position || 'Jabatan perlu dilengkapi Owner'}</p>
    </div>
  );

  return (
    <div className="w-full space-y-7">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge-brand">Company Structure</span>
        <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-brand-navy">
          Struktur Organisasi ORVAXIA
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Struktur hierarkis berdasarkan roster anggota resmi yang tersimpan di database.
        </p>
        <p className="mt-2 text-xs font-medium text-brand-slate">
          {members.length} dari 31 anggota tercatat
        </p>
      </div>

      <div className="flex flex-col items-center">
        {ceo ? (
          <div className="w-full max-w-sm rounded-2xl bg-brand-navy px-5 py-4 text-center text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Pimpinan tertinggi</p>
            <p className="mt-1 font-serif text-lg font-bold">{ceo.name}</p>
            <p className="mt-1 text-xs text-white/80">{ceo.position}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Data CEO perlu dilengkapi oleh Owner.
          </div>
        )}
        {secretary.length > 0 && (
          <>
            <div className="h-6 w-px bg-brand-lavender" />
            <div className="grid w-full max-w-4xl gap-2 sm:grid-cols-2">
              {secretary.map((member) => (
                <MemberRow key={member.id} name={member.name} position={member.position} />
              ))}
            </div>
          </>
        )}
        <div className="h-6 w-px bg-brand-lavender" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {divisions.map(({ name, members: divisionMembers }) => {
          const directorIndex = divisionMembers.findIndex((member) => /director|direktur/i.test(member.position));
          const orderedMembers =
            directorIndex > 0
              ? [divisionMembers[directorIndex], ...divisionMembers.filter((_, index) => index !== directorIndex)]
              : divisionMembers;
          return (
            <section key={name} className="rounded-2xl border border-brand-lavender/30 bg-[#FAF8F5] p-4">
              <h3 className="mb-3 border-b border-brand-lavender/30 pb-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-slate">
                {name}
              </h3>
              <div className="space-y-2">
                {orderedMembers.map((member, index) => (
                  <div key={member.id} className={index === 0 && directorIndex >= 0 ? 'rounded-xl ring-1 ring-brand-lavender/60' : ''}>
                    <MemberRow name={member.name} position={member.position} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {members.length !== 31 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Roster saat ini memuat {members.length} anggota. Periksa data anggota dan status profil di dashboard Owner untuk melengkapi roster 31 anggota.
        </p>
      )}
    </div>
  );
}
