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
  Phone,
  User,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type AuthTab = 'customer' | 'login' | 'register_crew';

export default function AuthPage() {
  const router = useRouter();
  const { login, registerStaff } = useCompanyStore();
  const [authTab, setAuthTab] = useState<AuthTab>('customer');

  // Customer Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Crew Register Form
  const [staffCode, setStaffCode] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffDivision, setStaffDivision] = useState('Produksi');
  const [staffNotes, setStaffNotes] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/checkout');
  };

  const handleInternalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Mohon isi email dan kata sandi');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(loginEmail.trim(), loginPassword);
      if (result.success && result.user) {
        if (result.user.role === 'owner') {
          router.push('/dashboard/owner');
        } else if (result.user.role === 'ceo') {
          router.push('/dashboard/ceo');
        } else if (result.user.status === 'pending_approval') {
          router.push('/dashboard');
        } else {
          router.push(`/dashboard/${result.user.role}`);
        }
      }
    } catch {
      toast.error('Login gagal diproses. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    const inputCode = staffCode.trim().toUpperCase();

    if (!staffName || !staffEmail || !staffPhone || !staffPassword) {
      toast.error('Mohon lengkapi seluruh formulir pendaftaran');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerStaff({
        fullName: staffName,
        email: staffEmail,
        phone: staffPhone,
        password: staffPassword,
        invitationCode: inputCode,
        division: staffDivision,
        position: staffNotes ? `Calon ${staffDivision} (${staffNotes})` : `Calon ${staffDivision}`,
      });

      if (result.success) {
        setRegisteredSuccess(true);
      } else {
        setRegError(result.message);
      }
    } catch {
      const message = 'Pendaftaran gagal diproses. Periksa koneksi lalu coba lagi.';
      setRegError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy flex flex-col justify-between">
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
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-3xl border border-brand-lavender/40 bg-white p-6 sm:p-8 shadow-sm">
          {/* Main Auth Tabs Pill */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setAuthTab('customer');
                setRegisteredSuccess(false);
                setRegError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
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
                setRegError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
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
                setRegError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                authTab === 'register_crew'
                  ? 'bg-white text-brand-navy shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daftar Crew
            </button>
          </div>

          {/* ================= 1. PEMESAN PO ================= */}
          {authTab === 'customer' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4 text-xs">
              <div className="text-center mb-4">
                <h2 className="font-serif text-2xl font-bold text-brand-navy">
                  Akun Pemesan PO
                </h2>
                <p className="text-slate-500 mt-1">
                  Masukkan nama & WhatsApp untuk memesan tas tumbler rajut Rovella.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Pemesan
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nama kamu"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-3 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-3 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-800 leading-relaxed">
                ✨ <strong>Pre-Order Gratis!</strong> Produk tas rajut Rovella tidak dipungut biaya produk. Kamu hanya membayar ongkos kirim saat pesanan dikirim.
              </div>

              <button
                type="submit"
                className="w-full mt-2 rounded-2xl bg-brand-navy py-3.5 font-bold text-white shadow-md hover:bg-brand-slate transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Pemesanan</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* ================= 2. LOGIN CREW / OWNER ================= */}
          {authTab === 'login' && (
            <form onSubmit={handleInternalLogin} className="space-y-4 text-xs">
              <div className="text-center mb-4">
                <div className="h-10 w-10 rounded-2xl bg-brand-surface text-brand-slate flex items-center justify-center mx-auto mb-2 border border-brand-lavender/30">
                  <KeyRound size={18} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-brand-navy">
                  Masuk Portal
                </h2>
                <p className="text-slate-500 mt-1">
                  Gunakan email dan kata sandi akun kamu.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Masukkan email kamu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-3 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan kata sandi"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-3 focus:border-brand-slate focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-2xl bg-brand-navy py-3.5 font-bold text-white shadow-md hover:bg-brand-slate transition-all flex items-center justify-center gap-2"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={15} />
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

          {/* ================= 3. DAFTAR CREW ================= */}
          {authTab === 'register_crew' && (
            <div>
              {registeredSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-navy">
                      Pendaftaran Berhasil Dikirim!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto mt-2 leading-relaxed">
                      Akun kamu telah masuk ke sistem operasional internal dengan status <strong>Menunggu Persetujuan</strong>. Silakan hubungi Owner untuk penetapan peran dan divisi.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className="rounded-2xl bg-brand-navy px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-brand-slate transition-all"
                    >
                      Buka Form Login
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleStaffRegister} className="space-y-3.5 text-xs">
                  <div className="text-center mb-3">
                    <h2 className="font-serif text-2xl font-bold text-brand-navy">
                      Daftar Akun Crew
                    </h2>
                    <p className="text-slate-500 mt-0.5">
                      Gunakan email pribadi dan kode undangan resmi.
                    </p>
                  </div>

                  {/* Kode Undangan */}
                  <div className="rounded-2xl border-2 border-brand-slate/40 bg-brand-surface/40 p-3.5 space-y-1.5">
                    <label className="font-bold text-brand-navy text-xs flex items-center gap-1.5">
                      <KeyRound size={14} className="text-brand-slate" />
                      <span>Kode Undangan *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan kode undangan resmi"
                      value={staffCode}
                      onChange={(e) => {
                        setStaffCode(e.target.value.toUpperCase());
                        setRegError(null);
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold tracking-wider uppercase text-brand-navy focus:border-brand-slate focus:outline-none bg-white"
                    />
                    {regError && (
                      <p className="text-[11px] text-red-600 flex items-center gap-1 font-semibold pt-1">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{regError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap kamu"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
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
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Kata Sandi *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Minat Divisi
                    </label>
                    <select
                      value={staffDivision}
                      onChange={(e) => setStaffDivision(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none bg-white"
                    >
                      <option value="Produksi">Divisi Produksi</option>
                      <option value="Sales">Divisi Sales</option>
                      <option value="Finance">Divisi Finance</option>
                      <option value="Marketing">Divisi Marketing</option>
                      <option value="HRD">Divisi HRD</option>
                      <option value="Public Relations">Divisi Public Relations</option>
                      <option value="Kesekretariatan">Kesekretariatan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Pengalaman atau keahlian"
                      value={staffNotes}
                      onChange={(e) => setStaffNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 rounded-2xl bg-brand-navy py-3.5 font-bold text-white shadow-md hover:bg-brand-slate transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Daftar Akun Crew
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
