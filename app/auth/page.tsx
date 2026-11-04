'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
  const { login, registerStaff, loginAs, currentUser } = useCompanyStore();
  const [authTab, setAuthTab] = useState<'login' | 'register_crew' | 'customer'>('customer');

  // Internal Login Form (Owner & Crew)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Crew Registration Form
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [staffDivision, setStaffDivision] = useState('Produksi');
  const [staffNotes, setStaffNotes] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Customer Form
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');

  const handleInternalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Mohon isi email dan kata sandi');
      return;
    }

    setIsSubmitting(true);
    const result = login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (result.success && result.user) {
      if (result.user.role === 'owner') {
        router.push('/dashboard/owner');
      } else if (result.user.status === 'pending_approval') {
        router.push('/dashboard');
      } else {
        router.push(`/dashboard/${result.user.role}`);
      }
    }
  };

  const handleStaffRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPhone || !staffPassword || !staffCode) {
      toast.error('Mohon lengkapi semua kolom termasuk kode undangan');
      return;
    }

    const result = registerStaff({
      fullName: staffName,
      email: staffEmail,
      phone: staffPhone,
      password: staffPassword,
      invitationCode: staffCode,
      division: staffDivision,
      position: staffNotes ? `Calon ${staffDivision} (${staffNotes})` : `Calon ${staffDivision}`,
    });

    if (result.success) {
      setRegisteredSuccess(true);
    }
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs('customer');
    router.push('/checkout');
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-24 text-brand-navy flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-brand-lavender/30 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/">
            <OrvaxiaLogo size={36} />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-brand-slate hover:text-brand-navy transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <div className="rounded-3xl border border-brand-lavender/40 bg-white p-6 sm:p-7 shadow-sm">
          {/* Main Auth Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setAuthTab('customer');
                setRegisteredSuccess(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authTab === 'customer'
                  ? 'bg-white text-brand-navy shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pemesan PO
            </button>
            <button
              onClick={() => {
                setAuthTab('login');
                setRegisteredSuccess(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authTab === 'login'
                  ? 'bg-white text-brand-navy shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Login Crew
            </button>
            <button
              onClick={() => {
                setAuthTab('register_crew');
                setRegisteredSuccess(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authTab === 'register_crew'
                  ? 'bg-white text-brand-navy shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daftar Crew
            </button>
          </div>

          {/* ================= 1. CUSTOMER AUTH ================= */}
          {authTab === 'customer' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4 text-xs">
              <div className="text-center mb-4">
                <h3 className="font-serif text-xl font-bold text-brand-navy">
                  Akun Pelanggan (Pre-Order)
                </h3>
                <p className="text-slate-500 mt-1">
                  Masuk untuk melanjutkan pemesanan tas tumbler rajut Rovella.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Nama Lengkap Pemesan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama Anda"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-full bg-brand-slate py-3 font-bold text-white shadow-md hover:bg-brand-navy transition-all"
              >
                Lanjut ke Checkout Pesanan
              </button>
            </form>
          )}

          {/* ================= 2. INTERNAL LOGIN (OWNER & CREW) ================= */}
          {authTab === 'login' && (
            <form onSubmit={handleInternalLogin} className="space-y-4 text-xs">
              <div className="text-center mb-4">
                <div className="h-11 w-11 rounded-2xl bg-brand-surface text-brand-slate flex items-center justify-center mx-auto mb-2 border border-brand-lavender/30">
                  <KeyRound size={20} />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-navy">
                  Masuk Portal Internal
                </h3>
                <p className="text-slate-500 mt-1">
                  Gunakan email dan kata sandi akun Anda.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Masukkan email Anda"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan sandi Anda"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-full bg-brand-slate py-3 font-bold text-white shadow-md hover:bg-brand-navy transition-all flex items-center justify-center gap-2"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuthTab('register_crew')}
                  className="text-brand-slate hover:text-brand-navy font-semibold hover:underline"
                >
                  Belum punya akun Crew? Daftar di sini →
                </button>
              </div>
            </form>
          )}

          {/* ================= 3. CREW REGISTRATION ================= */}
          {authTab === 'register_crew' && (
            <div>
              {registeredSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-navy">
                      Pendaftaran Crew Berhasil Diajukan!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
                      Akun Anda terdaftar dengan status <strong className="text-amber-700">Pending Approval</strong>.
                      Pemegang kendali akan menetapkan divisi dan hak akses resmi Anda.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-block rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-navy transition-all"
                    >
                      Buka Dashboard Anda
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleStaffRegister} className="space-y-3.5 text-xs">
                  <div className="text-center mb-3">
                    <h3 className="font-serif text-xl font-bold text-brand-navy">
                      Daftar Akun Crew ORVAXIA
                    </h3>
                    <p className="text-slate-500 mt-0.5">
                      Gunakan email pribadi masing-masing untuk mendaftar.
                    </p>
                  </div>

                  {/* Invitation Code Field */}
                  <div className="rounded-2xl border-2 border-brand-slate/80 bg-brand-surface/50 p-3.5 space-y-1.5">
                    <label className="font-bold text-brand-navy block text-xs flex items-center gap-1.5">
                      <KeyRound size={14} className="text-brand-slate" />
                      <span>Kode Undangan *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan kode undangan"
                      value={staffCode}
                      onChange={(e) => setStaffCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold tracking-wider uppercase text-brand-navy focus:border-brand-slate focus:outline-none bg-white shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nama Lengkap Anda *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap sesuai data tim"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Email Pribadi *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="emailpribadi@gmail.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Kata Sandi Baru *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Pilihan Minat Divisi
                    </label>
                    <select
                      value={staffDivision}
                      onChange={(e) => setStaffDivision(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    >
                      <option value="Produksi">Divisi Produksi (Rajutan & Manufaktur)</option>
                      <option value="Sales">Divisi Sales (Distribusi & Kurir)</option>
                      <option value="Finance">Divisi Finance (Arus Kas & Pembukuan)</option>
                      <option value="Marketing">Divisi Marketing (Display & Konten)</option>
                      <option value="HRD">Divisi HRD (Manajemen Anggota)</option>
                      <option value="Public Relations">Divisi Public Relations (PR / Humas)</option>
                      <option value="Kesekretariatan">Kesekretariatan / Administrasi</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pengalaman merajut / siap bertugas kurir"
                      value={staffNotes}
                      onChange={(e) => setStaffNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 rounded-full bg-brand-slate py-3 font-bold text-white shadow-md hover:bg-brand-navy transition-all"
                  >
                    Ajukan Pendaftaran Crew
                  </button>

                  <div className="text-center pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className="text-brand-slate hover:text-brand-navy font-semibold hover:underline"
                    >
                      Sudah punya akun? Masuk di sini →
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <MagicNavigation />
    </main>
  );
}
