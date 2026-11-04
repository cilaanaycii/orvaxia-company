'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'customer' | 'login' | 'register_crew';

const INPUT =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-slate focus:bg-white focus:outline-none transition-colors';

const LABEL = 'block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide';

const BTN_PRIMARY =
  'w-full rounded-2xl bg-brand-navy py-3.5 text-sm font-bold text-white hover:bg-brand-slate transition-colors flex items-center justify-center gap-2';

const BTN_GHOST =
  'w-full rounded-2xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2';

export default function AuthPage() {
  const router = useRouter();
  const { login, registerStaff, loginAs } = useCompanyStore();

  const [tab, setTab] = useState<Tab>('customer');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register — step 1: kode undangan, step 2: data diri
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [staffCode, setStaffCode] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffDivision, setStaffDivision] = useState('Produksi');
  const [staffNotes, setStaffNotes] = useState('');
  const [registered, setRegistered] = useState(false);

  // Customer
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  const switchTab = (t: Tab) => {
    setTab(t);
    setRegStep(1);
    setRegistered(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (result.success && result.user) {
      if (result.user.role === 'owner') router.push('/dashboard/owner');
      else if (result.user.status === 'pending_approval') router.push('/dashboard');
      else router.push(`/dashboard/${result.user.role}`);
    }
  };

  const handleRegStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffCode.trim()) { toast.error('Masukkan kode undangan'); return; }
    setRegStep(2);
  };

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerStaff({
      fullName: staffName,
      email: staffEmail,
      phone: staffPhone,
      password: staffPassword,
      invitationCode: staffCode,
      division: staffDivision,
      position: staffNotes ? `Calon ${staffDivision} (${staffNotes})` : `Calon ${staffDivision}`,
    });
    if (result.success) setRegistered(true);
  };

  const handleCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs('customer');
    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-100 bg-white px-4 py-3 flex items-center justify-between">
        <Link href="/"><OrvaxiaLogo size={32} /></Link>
        <Link href="/" className="text-xs text-slate-400 hover:text-brand-navy transition-colors">
          ← Beranda
        </Link>
      </header>

      {/* Tab Bar */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-4 pt-4 pb-0 flex gap-0">
        {(['customer', 'login', 'register_crew'] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = {
            customer: 'Pemesan PO',
            login: 'Login Crew',
            register_crew: 'Daftar Crew',
          };
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition-all ${
                active
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Content — takes remaining height */}
      <div className="flex-1 flex flex-col px-4 py-8 max-w-sm w-full mx-auto">

        {/* ── PEMESAN PO ── */}
        {tab === 'customer' && (
          <form onSubmit={handleCustomer} className="flex flex-col gap-5">
            <div>
              <h1 className="font-serif text-2xl font-bold text-brand-navy">Pesan Rovella</h1>
              <p className="text-sm text-slate-400 mt-1">Tas tumbler rajut custom ORVAXIA</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className={LABEL}>Nama</label>
                <input
                  type="text" required placeholder="Nama lengkap"
                  value={custName} onChange={e => setCustName(e.target.value)}
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>WhatsApp</label>
                <input
                  type="tel" required placeholder="08xxxxxxxxxx"
                  value={custPhone} onChange={e => setCustPhone(e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            <button type="submit" className={BTN_PRIMARY}>
              Lanjut ke Checkout <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ── LOGIN CREW ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <h1 className="font-serif text-2xl font-bold text-brand-navy">Masuk</h1>
              <p className="text-sm text-slate-400 mt-1">Portal internal ORVAXIA</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className={LABEL}>Email</label>
                <input
                  type="email" required placeholder="email@gmail.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Kata Sandi</label>
                <input
                  type="password" required placeholder="••••••••"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className={BTN_PRIMARY}>
              Masuk <ArrowRight size={16} />
            </button>

            <button type="button" onClick={() => switchTab('register_crew')} className={BTN_GHOST}>
              Daftar sebagai crew baru
            </button>
          </form>
        )}

        {/* ── DAFTAR CREW ── */}
        {tab === 'register_crew' && (
          <>
            {registered ? (
              /* Success */
              <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-brand-navy">Pendaftaran Dikirim</h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Akun kamu menunggu persetujuan.<br />Cek dashboard untuk status terbaru.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-brand-navy px-8 py-3.5 text-sm font-bold text-white hover:bg-brand-slate transition-colors"
                >
                  Buka Dashboard
                </Link>
              </div>
            ) : regStep === 1 ? (
              /* Step 1 — Kode Undangan */
              <form onSubmit={handleRegStep1} className="flex flex-col gap-5">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-brand-navy">Daftar Crew</h1>
                  <p className="text-sm text-slate-400 mt-1">Masukkan kode undangan dari koordinator</p>
                </div>

                <div className="rounded-2xl border-2 border-brand-navy/20 bg-brand-surface/40 p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-brand-navy">
                    <KeyRound size={18} />
                    <span className="text-sm font-bold">Kode Undangan</span>
                  </div>
                  <input
                    type="text" required placeholder="XXXXXXXX"
                    value={staffCode}
                    onChange={e => setStaffCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center font-mono text-xl font-bold tracking-widest text-brand-navy focus:border-brand-navy focus:outline-none uppercase"
                  />
                </div>

                <button type="submit" className={BTN_PRIMARY}>
                  Lanjut <ArrowRight size={16} />
                </button>

                <button type="button" onClick={() => switchTab('login')} className={BTN_GHOST}>
                  Sudah punya akun? Masuk
                </button>
              </form>
            ) : (
              /* Step 2 — Data Diri */
              <form onSubmit={handleRegSubmit} className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <div>
                    <h1 className="font-serif text-xl font-bold text-brand-navy">Data Diri</h1>
                    <p className="text-xs text-slate-400">Langkah 2 dari 2</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div>
                    <label className={LABEL}>Nama Lengkap</label>
                    <input
                      type="text" required placeholder="Nama kamu"
                      value={staffName} onChange={e => setStaffName(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Email</label>
                    <input
                      type="email" required placeholder="email@gmail.com"
                      value={staffEmail} onChange={e => setStaffEmail(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>WhatsApp</label>
                    <input
                      type="tel" required placeholder="08xxxxxxxxxx"
                      value={staffPhone} onChange={e => setStaffPhone(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Kata Sandi</label>
                    <input
                      type="password" required placeholder="Min. 6 karakter"
                      value={staffPassword} onChange={e => setStaffPassword(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Divisi Minat</label>
                    <select
                      value={staffDivision}
                      onChange={e => setStaffDivision(e.target.value)}
                      className={INPUT}
                    >
                      <option value="Produksi">Produksi</option>
                      <option value="Sales">Sales</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="HRD">HRD</option>
                      <option value="Public Relations">Public Relations</option>
                      <option value="Kesekretariatan">Kesekretariatan</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Catatan <span className="normal-case font-normal">(opsional)</span></label>
                    <input
                      type="text" placeholder="Pengalaman atau keahlian"
                      value={staffNotes} onChange={e => setStaffNotes(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </div>

                <button type="submit" className={BTN_PRIMARY}>
                  Kirim Pendaftaran <ArrowRight size={16} />
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <MagicNavigation />
    </main>
  );
}
