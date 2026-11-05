'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  Users2,
  Award,
  Star,
  FileCheck,
  Printer,
  Plus,
  Search,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HRDDashboard() {
  const { teamMembers, performanceReviews, addPerformanceReview, currentUser } = useCompanyStore();
  const [activeTab, setActiveTab] = useState<'roster' | 'evaluate' | 'history'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const selectedMember =
    teamMembers.find((member) => member.id === selectedMemberId) || teamMembers[0] || null;

  // Form states for the 7 evaluation metrics
  const [period, setPeriod] = useState('November 2026');
  const [responsibilityScore, setResponsibilityScore] = useState(90);
  const [punctualityScore, setPunctualityScore] = useState(90);
  const [qualityScore, setQualityScore] = useState(90);
  const [collaborationScore, setCollaborationScore] = useState(90);
  const [productivityScore, setProductivityScore] = useState(90);
  const [communicationScore, setCommunicationScore] = useState(90);
  const [consistencyScore, setConsistencyScore] = useState(90);
  const [evalNotes, setEvalNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const averageScore = Number(
    (
      (responsibilityScore +
        punctualityScore +
        qualityScore +
        collaborationScore +
        productivityScore +
        communicationScore +
        consistencyScore) /
      7
    ).toFixed(1)
  );

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      toast.error('Pilih anggota crew yang akan dievaluasi.');
      return;
    }
    if (!evalNotes) {
      toast.error('Mohon isi catatan evaluasi');
      return;
    }

    const saved = await addPerformanceReview({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      memberDivision: selectedMember.division,
      reviewerId: currentUser?.id || 'hrd-director',
      reviewerName: currentUser?.fullName || 'Nur Aliccia (Director of HRD)',
      reviewDate: new Date().toISOString().slice(0, 10),
      period,
      scores: {
        responsibility: responsibilityScore,
        punctuality: punctualityScore,
        quality: qualityScore,
        collaboration: collaborationScore,
        productivity: productivityScore,
        communication: communicationScore,
        consistency: consistencyScore,
      },
      averageScore,
      notes: evalNotes,
      developmentRecommendations: recommendations,
    });

    if (!saved) return;
    setEvalNotes('');
    setRecommendations('');
    setActiveTab('history');
  };

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.division.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (
    currentUser?.status !== 'active' ||
    (currentUser.role !== 'owner' && currentUser.role !== 'ceo' && currentUser.role !== 'hrd')
  ) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-brand-navy">Akses evaluasi crew dibatasi</h2>
        <p className="mt-2 text-sm text-slate-600">
          Evaluasi kinerja hanya dapat dikelola oleh anggota HRD aktif, CEO, dan Owner.
        </p>
      </div>
    );
  }

  if (!selectedMember) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-brand-navy">Data anggota crew belum tersedia</h2>
        <p className="mt-2 text-sm text-slate-600">
          Muat ulang halaman setelah database anggota crew berhasil disinkronkan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Pengembangan Sumber Daya Manusia</span>
            <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[10px] font-bold">
              DIVISI HRD
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Human Resource & 31 Member Performance Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database 31 anggota ORVAXIA COMPANY, penilaian kinerja 7 indikator, bimbingan berkala, dan laporan evaluasi.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'roster'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Database Anggota ({teamMembers.length}/31)
          </button>
          <button
            onClick={() => setActiveTab('evaluate')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'evaluate'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Form Penilaian 7 Indikator
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-slate text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Riwayat Evaluasi ({performanceReviews.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: 31 MEMBERS ROSTER ================= */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari anggota dari 31 personil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs focus:border-brand-slate focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total Kuota: 31 Anggota Resmi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-lavender transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-brand-lavender/50 bg-slate-100 shrink-0">
                    <Image
                      src={member.avatarUrl}
                      alt={member.name}
                      fill
                      unoptimized
                      sizes="48px"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="rounded-md bg-brand-surface px-2 py-0.5 text-[10px] font-bold text-brand-slate border border-brand-lavender/30">
                      {member.division}
                    </span>
                    <h4 className="font-bold text-xs text-brand-navy truncate mt-0.5">
                      {member.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{member.position}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    Status: {member.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setActiveTab('evaluate');
                    }}
                    className="rounded-lg bg-brand-surface px-2.5 py-1 text-[11px] font-bold text-brand-slate hover:bg-brand-slate hover:text-white transition-colors"
                  >
                    Beri Penilaian →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: EVALUATION FORM (7 INDICATORS) ================= */}
      {activeTab === 'evaluate' && (
        <form
          onSubmit={handleSubmitEvaluation}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="badge-brand">Standar Evaluasi HRD ORVAXIA</span>
              <h3 className="font-serif text-lg font-bold text-brand-navy mt-1">
                Formulir Penilaian Kinerja Anggota: {selectedMember.name}
              </h3>
              <p className="text-slate-500 mt-0.5">
                Jabatan: {selectedMember.position} · Divisi: {selectedMember.division}
              </p>
            </div>

            <div className="rounded-2xl bg-brand-surface p-3 text-center border border-brand-lavender/30 min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Skor Rata-Rata:
              </span>
              <span className="font-serif text-2xl font-bold text-brand-slate">
                {averageScore} <span className="text-xs text-slate-400">/ 100</span>
              </span>
            </div>
          </div>

          {/* Member Picker & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Pilih Anggota</label>
              <select
                value={selectedMember.id}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              >
                {teamMembers.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.name} — {tm.position} ({tm.division})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Periode Evaluasi</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
          </div>

          {/* The 7 Official Indicators as Sliders */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              7 Indikator Kinerja Resmi
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>1. Tanggung Jawab</span>
                  <span className="text-brand-slate font-bold">{responsibilityScore}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={responsibilityScore}
                  onChange={(e) => setResponsibilityScore(Number(e.target.value))}
                  className="w-full accent-brand-slate"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>2. Ketepatan Waktu</span>
                  <span className="text-brand-slate font-bold">{punctualityScore}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={punctualityScore}
                  onChange={(e) => setPunctualityScore(Number(e.target.value))}
                  className="w-full accent-brand-slate"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>3. Kualitas Pekerjaan</span>
                  <span className="text-brand-slate font-bold">{qualityScore}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={qualityScore}
                  onChange={(e) => setQualityScore(Number(e.target.value))}
                  className="w-full accent-brand-slate"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>4. Kolaborasi</span>
                  <span className="text-brand-slate font-bold">{collaborationScore}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={collaborationScore}
                  onChange={(e) => setCollaborationScore(Number(e.target.value))}
                  className="w-full accent-brand-slate"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>5. Produktivitas</span>
                  <span className="text-brand-slate font-bold">{productivityScore}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={productivityScore}
                  onChange={(e) => setProductivityScore(Number(e.target.value))}
                  className="w-full accent-brand-slate"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>6. Komunikasi</span>
                  <span className="text-brand-slate font-bold">{communicationScore}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={communicationScore}
                  onChange={(e) => setCommunicationScore(Number(e.target.value))}
                  className="w-full accent-brand-slate"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between font-semibold mb-1">
                  <span>7. Konsistensi</span>
                  <span className="text-brand-slate font-bold">{consistencyScore}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={consistencyScore}
                  onChange={(e) => setConsistencyScore(Number(e.target.value))}
                  className="w-full accent-brand-slate"
                />
              </div>
            </div>
          </div>

          {/* Notes & Recommendations */}
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Catatan Penilaian & Apresiasi Kinerja *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Tuliskan catatan apresiasi, kedisiplinan, dan dedikasi anggota..."
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Rekomendasi Pengembangan Anggota
              </label>
              <textarea
                rows={2}
                placeholder="Rekomendasi pelatihan soft skill / workshop teknis yang disarankan..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-brand-slate px-8 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-navy"
            >
              <CheckCircle size={14} /> Simpan Evaluasi Resmi HRD
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 3: EVALUATION HISTORY ================= */}
      {activeTab === 'history' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Arsip Evaluasi Kinerja Karyawan
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Printer size={13} /> Ekspor Laporan Evaluasi (PDF)
            </button>
          </div>

          {performanceReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">Belum ada riwayat penilaian kinerja anggota</p>
              <p className="text-xs text-slate-400">
                Divisi HRD dapat menilai 31 anggota ORVAXIA melalui tab &quot;Form Penilaian 7 Indikator&quot; di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {performanceReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-brand-lavender transition-all"
                >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{rev.memberName}</h4>
                    <p className="text-xs text-slate-500">
                      Divisi: {rev.memberDivision} · Periode: {rev.period} · Dinilai oleh: {rev.reviewerName}
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-xs font-bold self-start sm:self-auto">
                    Skor Rata-Rata: {rev.averageScore} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-[10px]">
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-slate-500 block">Tanggung Jwb</span>
                    <span className="font-bold text-slate-900">{rev.scores.responsibility}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-slate-500 block">Ketepatan</span>
                    <span className="font-bold text-slate-900">{rev.scores.punctuality}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-slate-500 block">Kualitas</span>
                    <span className="font-bold text-slate-900">{rev.scores.quality}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-slate-500 block">Kolaborasi</span>
                    <span className="font-bold text-slate-900">{rev.scores.collaboration}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-slate-500 block">Produktivitas</span>
                    <span className="font-bold text-slate-900">{rev.scores.productivity}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-slate-500 block">Komunikasi</span>
                    <span className="font-bold text-slate-900">{rev.scores.communication}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border">
                    <span className="text-slate-500 block">Konsistensi</span>
                    <span className="font-bold text-slate-900">{rev.scores.consistency}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-brand-surface/30 p-3 rounded-xl border border-brand-lavender/20">
                  <span className="font-semibold text-slate-900">Catatan:</span> {rev.notes}
                </p>

                {rev.developmentRecommendations && (
                  <p className="text-xs text-brand-slate italic">
                    Rekomendasi Pengembangan: {rev.developmentRecommendations}
                  </p>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
