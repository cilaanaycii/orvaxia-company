'use client';

import React, { useState } from 'react';
import { useCompanyStore } from '@/lib/store/company-store';
import {
  CheckSquare,
  Clock,
  Award,
  Bell,
  CheckCircle,
  Circle,
  Plus,
  UserCheck,
} from 'lucide-react';

export default function MemberDashboard() {
  const {
    tasks,
    updateTaskStatus,
    addTask,
    announcements,
    performanceReviews,
    currentUser,
  } = useCompanyStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2026-11-10');

  // Personal workspace tasks are scoped to the signed-in crew member.
  const myTasks = tasks.filter(
    (task) => task.assignedToId === currentUser?.id
  );

  // Recent evaluation feedback for current member
  const myReview = performanceReviews.find(
    (r) => r.memberName.includes(currentUser?.fullName || '')
  );

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const saved = await addTask({
      title: newTaskTitle,
      description: 'Dibuat secara mandiri oleh anggota',
      division: currentUser?.division || 'Produksi',
      assignedToId: currentUser?.id,
      assignedToName: currentUser?.fullName,
      priority: 'medium',
      status: 'todo',
      deadline: newTaskDeadline,
    });

    if (saved) setNewTaskTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-brand">Portal Anggota Internal</span>
            <span className="rounded-full bg-slate-100 text-slate-800 px-2.5 py-0.5 text-[10px] font-bold">
              31 ANGGOTA ORVAXIA
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-navy mt-1">
            Personal Workspace: {currentUser?.fullName || 'Anggota Orvaxia'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Divisi: {currentUser?.division || 'Produksi'} · Jabatan: {currentUser?.position || 'Staff'} · Status:{' '}
            <span className="text-emerald-700 font-bold">{currentUser?.status || 'Active'}</span>
          </p>
        </div>
      </div>

      {/* Member Profile & Status Card */}
      <div className="rounded-3xl border border-brand-lavender/30 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-slate text-white font-serif font-bold text-xl shadow-md">
              {currentUser?.fullName.slice(0, 2).toUpperCase() || 'OV'}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-navy">
                {currentUser?.fullName}
              </h3>
              <p className="text-xs text-brand-slate font-medium">
                {currentUser?.position} — {currentUser?.division}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                <span>Email: {currentUser?.email}</span>
                <span>•</span>
                <span>Telp: {currentUser?.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
              <UserCheck size={14} /> Anggota Resmi Terverifikasi
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Task Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-serif font-bold text-base text-brand-navy">
                Daftar Tugas & Tanggung Jawab ({myTasks.length})
              </h4>
              <span className="text-xs text-slate-400">Tenggat Waktu Pre-Order</span>
            </div>

            {/* Quick Add Task */}
            <form onSubmit={handleCreateTask} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="Tambah catatan tugas baru..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-brand-slate px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-navy"
              >
                <Plus size={14} /> Catat
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2.5 pt-2">
              {myTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Belum ada tugas spesifik untuk akun ini. Tambahkan tugas baru di atas.
                </p>
              ) : (
                myTasks.map((task) => {
                  const isDone = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all text-xs ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/30 text-slate-400'
                          : 'border-slate-200 bg-white hover:border-brand-lavender'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() =>
                            updateTaskStatus(task.id, isDone ? 'todo' : 'completed')
                          }
                          className="mt-0.5 text-brand-slate hover:text-brand-navy"
                        >
                          {isDone ? (
                            <CheckCircle size={18} className="text-emerald-600" />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                        <div>
                          <h5
                            className={`font-semibold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock size={11} /> Deadline: {task.deadline} · Divisi: {task.division}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: HRD Feedback & Company Announcements */}
        <div className="lg:col-span-5 space-y-4">
          {/* HRD Feedback Card */}
          <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-purple-700" />
              <h4 className="font-bold text-sm text-purple-950">
                Umpan Balik Evaluasi HRD
              </h4>
            </div>

            {myReview ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Skor Rata-Rata:</span>
                  <span className="rounded-full bg-purple-200 text-purple-900 px-2 py-0.5 font-bold">
                    {myReview.averageScore} / 100
                  </span>
                </div>
                <p className="bg-white p-3 rounded-xl border border-purple-200 text-slate-700 italic">
                  &quot;{myReview.notes}&quot;
                </p>
                {myReview.developmentRecommendations && (
                  <p className="text-[11px] text-purple-900 font-medium">
                    Saran Pengembangan: {myReview.developmentRecommendations}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic bg-white p-3 rounded-xl border border-purple-100">
                Evaluasi kinerja resmi untuk periode ini sedang diproses oleh Director of HRD (Nur Aliccia).
              </p>
            )}
          </div>

          {/* Announcements Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Bell size={16} className="text-brand-slate" />
              <h4 className="font-serif font-bold text-sm text-brand-navy">
                Pengumuman Pimpinan
              </h4>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 p-3 bg-slate-50/60">
                  <span className="rounded-md bg-brand-surface px-1.5 py-0.2 text-[9px] font-bold text-brand-slate border border-brand-lavender/30">
                    {a.author}
                  </span>
                  <h5 className="font-semibold text-xs text-slate-900 mt-1">{a.title}</h5>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {a.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
