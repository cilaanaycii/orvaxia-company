'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/lib/store/company-store';

export default function DashboardRootPage() {
  const router = useRouter();
  const { currentUser } = useCompanyStore();

  useEffect(() => {
    if (currentUser?.role && currentUser.role !== 'customer') {
      router.replace(`/dashboard/${currentUser.role}`);
    } else {
      router.replace('/dashboard/owner');
    }
  }, [currentUser, router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-slate border-t-transparent" />
    </div>
  );
}
