import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Serif_Display } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CompanyProvider } from '@/lib/store/company-store';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serifFont = Noto_Serif_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ORVAXIA COMPANY — Kerajinan Rajut Multifungsi & Platform Digital Terpadu',
  description:
    'ORVAXIA COMPANY — Berkomitmen menghadirkan kerajinan rajutan berupa tempat botol minum praktis, fungsional, menarik, dan multifungsi yang dapat dilipat menjadi gantungan kunci.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sansFont.variable} ${serifFont.variable}`}>
      <body className="font-sans antialiased bg-[#FAF8F5] text-brand-navy min-h-screen selection:bg-brand-lavender/30 selection:text-brand-navy">
        <CompanyProvider>
          {children}
          <Toaster position="top-right" richColors />
        </CompanyProvider>
      </body>
    </html>
  );
}
