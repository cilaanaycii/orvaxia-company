'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import { TeamMember } from '@/lib/types';
import { UserCheck, Shield, ChevronRight, Sparkles } from 'lucide-react';

export function OrgStructureTree() {
  const { teamMembers } = useCompanyStore();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(teamMembers[0]);

  // Group members according to the hierarchy
  const ceo = teamMembers.find((m) => m.position.includes('CEO'));
  const sekretaris = teamMembers.find((m) => m.position.includes('Sekretaris'));

  const divisions = [
    {
      name: 'Finance',
      color: 'border-emerald-300 bg-emerald-50/50',
      tagColor: 'bg-emerald-100 text-emerald-800',
      director: teamMembers.find((m) => m.position === 'Director of Finance'),
      managers: teamMembers.filter(
        (m) => m.division === 'Finance' && m.position !== 'Director of Finance'
      ),
    },
    {
      name: 'HRD',
      color: 'border-purple-300 bg-purple-50/50',
      tagColor: 'bg-purple-100 text-purple-800',
      director: teamMembers.find((m) => m.position === 'Director of HRD'),
      managers: teamMembers.filter(
        (m) => m.division === 'HRD' && m.position !== 'Director of HRD'
      ),
    },
    {
      name: 'Marketing',
      color: 'border-amber-300 bg-amber-50/50',
      tagColor: 'bg-amber-100 text-amber-800',
      director: teamMembers.find((m) => m.position === 'Director of Marketing'),
      managers: teamMembers.filter(
        (m) => m.division === 'Marketing' && m.position !== 'Director of Marketing'
      ),
    },
    {
      name: 'Produksi',
      color: 'border-blue-300 bg-blue-50/50',
      tagColor: 'bg-blue-100 text-blue-800',
      director: teamMembers.find((m) => m.position === 'Director of Production'),
      managers: teamMembers.filter(
        (m) => m.division === 'Produksi' && m.position !== 'Director of Production'
      ),
    },
    {
      name: 'Public Relations',
      color: 'border-rose-300 bg-rose-50/50',
      tagColor: 'bg-rose-100 text-rose-800',
      director: teamMembers.find((m) => m.position === 'Director of PR'),
      managers: teamMembers.filter(
        (m) => m.division === 'Public Relations' && m.position !== 'Director of PR'
      ),
    },
    {
      name: 'Sales',
      color: 'border-indigo-300 bg-indigo-50/50',
      tagColor: 'bg-indigo-100 text-indigo-800',
      director: teamMembers.find((m) => m.position === 'Director of Sales'),
      managers: teamMembers.filter(
        (m) => m.division === 'Sales' && m.position !== 'Director of Sales'
      ),
    },
  ];

  return (
    <div className="w-full space-y-10">
      <div className="flex flex-col items-center text-center">
        <span className="badge-brand">Hierarki Resmi Perusahaan</span>
        <h3 className="font-serif text-3xl font-bold tracking-tight text-brand-navy mt-2">
          Struktur Organisasi ORVAXIA COMPANY
        </h3>
        <p className="text-sm text-brand-slate max-w-xl mt-1">
          Bagan terintegrasi 31 anggota resmi ORVAXIA dari Chief Executive Officer, Sekretaris, hingga seluruh jajaran direktur dan manager lintas divisi.
        </p>
      </div>

      {/* Interactive Detail Modal / Flyout when a node is selected */}
      {selectedMember && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-brand-lavender/40 bg-white/90 p-5 shadow-sm backdrop-blur-md transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-brand-slate bg-brand-surface shadow-inner shrink-0">
                <img
                  src={selectedMember.avatarUrl}
                  alt={selectedMember.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-brand-navy">{selectedMember.name}</h4>
                  <span className="rounded-full bg-brand-surface px-2.5 py-0.5 text-[11px] font-semibold text-brand-slate border border-brand-lavender/30">
                    {selectedMember.division}
                  </span>
                </div>
                <p className="text-xs font-medium text-brand-slate">{selectedMember.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <UserCheck size={12} /> {selectedMember.status}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
            {selectedMember.bio}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedMember.responsibilities.map((resp, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
              >
                <Sparkles size={10} className="text-brand-slate" /> {resp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Visual Hierarchy Diagram */}
      <div className="flex flex-col items-center gap-6 overflow-x-auto pb-6">
        {/* CEO Node */}
        {ceo && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setSelectedMember(ceo)}
              className={`group flex flex-col items-center rounded-2xl border-2 px-8 py-3.5 shadow-md transition-all ${
                selectedMember?.id === ceo.id
                  ? 'border-brand-slate bg-brand-slate text-white scale-105 shadow-lg'
                  : 'border-brand-slate/40 bg-white hover:border-brand-slate text-brand-navy'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} className={selectedMember?.id === ceo.id ? 'text-amber-300' : 'text-brand-slate'} />
                <span className="text-xs font-bold tracking-widest uppercase">CEO</span>
              </div>
              <span className="font-serif font-bold text-base mt-0.5">{ceo.name}</span>
            </button>
            <div className="h-6 w-0.5 bg-brand-slate/30" />
          </div>
        )}

        {/* Sekretaris Node */}
        {sekretaris && (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setSelectedMember(sekretaris)}
              className={`group flex items-center gap-3 rounded-xl border px-6 py-2.5 shadow-sm transition-all ${
                selectedMember?.id === sekretaris.id
                  ? 'border-brand-lavender bg-brand-lavender text-brand-navy font-bold scale-105'
                  : 'border-slate-200 bg-white hover:border-brand-lavender text-slate-800'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-slate">SEKRETARIS</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="text-xs font-semibold">{sekretaris.name}</span>
            </button>
            <div className="h-6 w-0.5 bg-brand-slate/30" />
          </div>
        )}

        {/* Division Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 w-full">
          {divisions.map((div) => (
            <div
              key={div.name}
              className={`flex flex-col rounded-2xl border p-3.5 transition-all shadow-sm ${div.color}`}
            >
              {/* Division Director */}
              <div className="border-b border-black/5 pb-2.5 mb-2.5">
                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${div.tagColor}`}>
                  {div.name}
                </span>
                {div.director && (
                  <button
                    onClick={() => setSelectedMember(div.director!)}
                    className={`mt-2 block w-full text-left rounded-lg p-2 transition-all ${
                      selectedMember?.id === div.director.id
                        ? 'bg-white shadow-sm ring-2 ring-brand-slate'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase text-brand-slate">
                      {div.director.position}
                    </p>
                    <p className="text-xs font-bold text-brand-navy truncate">
                      {div.director.name}
                    </p>
                  </button>
                )}
              </div>

              {/* Division Managers / Team Members */}
              <div className="space-y-1.5 flex-1">
                {div.managers.map((mgr) => (
                  <button
                    key={mgr.id}
                    onClick={() => setSelectedMember(mgr)}
                    className={`block w-full text-left rounded-lg p-1.5 text-xs transition-all ${
                      selectedMember?.id === mgr.id
                        ? 'bg-white shadow-sm ring-1 ring-brand-slate font-semibold'
                        : 'hover:bg-white/60 text-slate-700'
                    }`}
                  >
                    <p className="text-[9px] text-slate-500 font-medium truncate">
                      {mgr.position}
                    </p>
                    <p className="font-medium text-slate-900 truncate">
                      {mgr.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
