'use client';

import React, { useState, useMemo } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { TeamMember } from '@/lib/types';
import { Search, UserCheck, Shield, ChevronRight, Mail, Phone } from 'lucide-react';

export function TeamRoster() {
  const { teamMembers } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [activeModalMember, setActiveModalMember] = useState<TeamMember | null>(null);

  const divisions = [
    { id: 'all', label: 'Semua Anggota (31)' },
    { id: 'Executive', label: 'Executive' },
    { id: 'Kesekretariatan', label: 'Kesekretariatan' },
    { id: 'Finance', label: 'Finance' },
    { id: 'HRD', label: 'HRD' },
    { id: 'Marketing', label: 'Marketing' },
    { id: 'Produksi', label: 'Produksi' },
    { id: 'Public Relations', label: 'PR' },
    { id: 'Sales', label: 'Sales' },
  ];

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.division.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision =
        selectedDivision === 'all' || member.division === selectedDivision;

      return matchesSearch && matchesDivision;
    });
  }, [teamMembers, searchQuery, selectedDivision]);

  return (
    <div className="w-full space-y-6">
      {/* Controls: Search and Division Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs focus:border-brand-slate focus:outline-none focus:ring-1 focus:ring-brand-slate shadow-sm"
          />
        </div>

        {/* Division Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {divisions.map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedDivision === div.id
                  ? 'bg-brand-slate text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setActiveModalMember(member)}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-brand-lavender transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-brand-lavender/50 bg-slate-100 shrink-0">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <span className="inline-block rounded-md bg-brand-surface px-2 py-0.5 text-[10px] font-semibold text-brand-slate border border-brand-lavender/30">
                    {member.division}
                  </span>
                  <h4 className="font-bold text-xs text-brand-navy truncate mt-1 group-hover:text-brand-slate transition-colors">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{member.position}</p>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {member.bio}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {member.status}
              </span>
              <span className="flex items-center gap-1 text-brand-slate group-hover:translate-x-0.5 transition-transform">
                Detail <ChevronRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm text-slate-500">Tidak ada anggota yang cocok dengan filter pencarian.</p>
        </div>
      )}

      {/* Member Detail Dialog */}
      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setActiveModalMember(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-brand-slate shadow-sm shrink-0">
                  <img
                    src={activeModalMember.avatarUrl}
                    alt={activeModalMember.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-xs font-semibold text-brand-slate border border-brand-lavender/30">
                    {activeModalMember.division}
                  </span>
                  <h3 className="font-bold text-base text-brand-navy mt-1">
                    {activeModalMember.name}
                  </h3>
                  <p className="text-xs text-brand-slate font-medium">
                    {activeModalMember.position}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalMember(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <h5 className="font-semibold text-slate-900 uppercase tracking-wider text-[10px]">
                  Profil & Dedikasi
                </h5>
                <p className="mt-1 leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {activeModalMember.bio}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 uppercase tracking-wider text-[10px]">
                  Tanggung Jawab Resmi
                </h5>
                <ul className="mt-2 space-y-1.5">
                  {activeModalMember.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-slate shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <UserCheck size={14} /> Status Keanggotaan: {activeModalMember.status}
                </span>
                <span className="text-slate-400">ORVAXIA COMPANY</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
