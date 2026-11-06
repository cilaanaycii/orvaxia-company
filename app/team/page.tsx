'use client';

import { TeamRoster } from '@/components/team/TeamRoster';
import { TopNav } from '@/components/navigation/TopNav';

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] pb-32 text-brand-navy">
      <TopNav />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-brand">Our Team</span>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
            OUR PEOPLE, OUR STRENGTH.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Meet the people behind ORVAXIA COMPANY.
          </p>
        </div>
        <TeamRoster />
      </div>

    </main>
  );
}
