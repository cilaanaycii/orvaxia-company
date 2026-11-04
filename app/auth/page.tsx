'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/company-store';
import { OrvaxiaLogo } from '@/components/brand/OrvaxiaLogo';
import { MagicNavigation } from '@/components/navigation/MagicNavigation';
import { ShieldCheck, User, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
  const { registerStaff, loginAs, currentUser } = useCompanyStore();
  const [authType, setAuthType] = useState<'customer' | 'staff'>('customer');

  // Customer Form
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Staff Form
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDivision, setStaffDivision] = useState('Produksi');
  const [staffPosition, setStaffPosition] = useState('Staff Perajut');
  const [staffRegistered, setStaffRegistered] = useState(false);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs('customer');
    router.push('/checkout');
  };

  const handleStaffRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPhone) {
      toast.error('Mohon lengkapi seluruh formulir pendaftaran');
      return;
    }

    registerStaff({
      fullName: staffName,
      email: staffEmail,
      phone: staffPhone,
      division: staffDivision,
      position: staffPosition,
    });
    setStaffRegistered(true);
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
            className="text-xs font-semibold text-brand-slate hover:text-brand-navy"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <div className="rounded-3xl border border-brand-lavender/40 bg-white p-7 shadow-sm">
          {/* Auth Type Switcher */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setAuthType('customer');
                setStaffRegistered(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authType === 'customer'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Akun Pelanggan (Checkout)
            </button>
            <button
              onClick={() => setAuthType('staff')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authType === 'staff'
                  ? 'bg-white text-brand-navy shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Akun Anggota Internal
            </button>
          </div>

          {/* ================= CUSTOMER AUTH ================= */}
          {authType === 'customer' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4 text-xs">
              <div className="text-center mb-4">
                <h3 className="font-serif text-xl font-bold text-brand-navy">
                  Masuk Akun Pelanggan
                </h3>
                <p className="text-slate-500 mt-1">
                  Masuk untuk melanjutkan pre-order tas tumbler rajut Rovella.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Nama Lengkap
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
                Masuk & Lanjut ke Checkout
              </button>
            </form>
          )}

          {/* ================= STAFF AUTH ================= */}
          {authType === 'staff' && (
            <div>
              {staffRegistered ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-navy">
                      Pendaftaran Terkirim!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                      Status akun Anda saat ini adalah <strong className="text-amber-700">Pending Approval</strong>. Pemilik perusahaan (Owner) akan memeriksa dan menetapkan jabatan Anda sebelum dashboard dapat dibuka.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-block rounded-full bg-brand-slate px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-navy"
                  >
                    Buka Dashboard (Mode Uji Role)
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleStaffRegister} className="space-y-4 text-xs">
                  <div className="text-center mb-4">
                    <h3 className="font-serif text-xl font-bold text-brand-navy">
                      Pendaftaran Anggota ORVAXIA
                    </h3>
                    <p className="text-slate-500 mt-1">
                      Khusus 31 anggota dan staf operasional ORVAXIA COMPANY.
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
                    Sistem multi-role ORVAXIA mewajibkan verifikasi manual dari Owner sebelum akses dashboard diberikan.
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nama Lengkap Anggota *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap sesuai struktur"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Email Internal *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@orvaxia.com"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">Divisi</label>
                      <select
                        value={staffDivision}
                        onChange={(e) => setStaffDivision(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                      >
                        <option value="Produksi">Produksi</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="HRD">HRD</option>
                        <option value="Public Relations">PR</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">Posisi Jabatan</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Manager / Staff"
                        value={staffPosition}
                        onChange={(e) => setStaffPosition(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-brand-slate focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 rounded-full bg-brand-slate py-3 font-bold text-white shadow-md hover:bg-brand-navy transition-all"
                  >
                    Ajukan Pendaftaran Anggota
                  </button>
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
