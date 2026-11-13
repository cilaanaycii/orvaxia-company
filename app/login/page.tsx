'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const next = params.get('next');
    const target = next
      ? `/auth?tab=login&next=${encodeURIComponent(next)}`
      : '/auth?tab=login';
    router.replace(target);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F5] p-6 text-brand-navy">
      <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-brand-lavender/30 bg-white px-8 py-6 shadow-sm">
        <Loader2 className="animate-spin text-brand-slate" size={28} />
        <p className="text-sm font-semibold text-slate-600">Mengalihkan ke halaman login...</p>
      </div>
    </main>
  );
}
