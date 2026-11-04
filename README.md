# 🌟 ORVAXIA COMPANY — Official Platform Website

Platform digital resmi **ORVAXIA COMPANY** yang menggabungkan:
1. **Company Profile**: Identitas resmi, filosofi Orbis & Axiom, visi & misi, nilai perusahaan, direktori 31 anggota resmi, bagan struktur organisasi interaktif, dan galeri dokumentasi.
2. **E-Commerce Pre-Order (PO)**: Showcase produk unggulan **Rovella by Orvaxia** (3-in-1 tas tumbler rajut, pouch serbaguna, dan gantungan kunci lipat), kalkulasi ongkos kirim berbasis jarak dari SMKN 2 Buduran, dan checkout 6 langkah terintegrasi WhatsApp Gateway.
3. **Internal Company Management System**: Dashboard operasional multi-peran untuk Owner, CEO, Produksi, Sales, Marketing, HRD (penilaian 7 indikator kinerja untuk 31 anggota), Finance (buku kas & verifikasi pembayaran), PR, dan Anggota Umum.

---

## 🚀 Cara Menjalankan di VS Code

Proyek ini sudah dilengkapi dengan seluruh dependensi (`node_modules`) yang siap pakai.

1. Buka Terminal terintegrasi di VS Code:
   * Tekan tombol **``Ctrl + ` ``** (Ctrl + Backtick) atau pilih menu **Terminal** → **New Terminal**.
2. Jalankan perintah server pengembangan:
   ```bash
   npm run dev
   ```
3. Buka browser di alamat:
   ```
   http://localhost:3000
   ```

---

## 📁 Struktur Folder Rapi & Terorganisir

```text
orvaxia/
├── app/
│   ├── api/                     # Server-side validation & order routes
│   │   ├── auth/approve/        # Owner approval endpoint
│   │   ├── orders/              # Server-side price & PO recalculation
│   │   └── shipping/            # Shipping tariff calculator (SMKN 2 Buduran)
│   ├── auth/                    # Customer login & Staff registration (Pending Approval)
│   ├── checkout/                # 6-Step interactive Checkout flow & WhatsApp generator
│   ├── dashboard/               # Multi-role operational dashboards
│   │   ├── ceo/                 # CEO Executive monitoring & KPI
│   │   ├── finance/             # Ledger cashflow & Payment verification
│   │   ├── hrd/                 # 31 Members & 7-indicator performance evaluation
│   │   ├── marketing/           # Product catalog manager & campaigns
│   │   ├── member/              # Personal member tasks & feedback
│   │   ├── owner/               # Super Admin approval, roles & platform settings
│   │   ├── pr/                  # Public announcements, FAQs & socials
│   │   ├── production/          # Knit queue, custom bottle notes & raw materials
│   │   └── sales/               # Shipping logistics, courier assignment & resi
│   ├── globals.css              # Official brand styling & floating dock classes
│   ├── layout.tsx               # Root provider & typography setup
│   └── page.tsx                 # Main Company Profile with Magic Navigation
├── components/
│   ├── brand/                   # Official Orvaxia SVG vector logo
│   ├── navigation/              # Magic Navigation floating dock with ScrollSpy
│   ├── shop/                    # Rovella 3-in-1 showcase & active PO countdown banner
│   ├── team/                    # 31 Members roster & interactive Org Structure tree
│   └── ui/                      # Reusable UI primitives (buttons, modals, dialogs)
├── lib/
│   ├── data/                    # Official initial seed data (31 members, Rovella, etc.)
│   ├── store/                   # Reactive state store with localStorage & Supabase bridge
│   ├── supabase/                # Safe Supabase client & environment validator
│   ├── types/                   # Strict TypeScript definitions
│   └── utils.ts                 # Styling & utility helpers
└── supabase/
    └── migrations/              # Production database migrations & RLS policies
```

---

## 🔐 Supabase Auth & Crew Access

Internal login and crew profiles require Supabase Auth. Crew registration creates a
`member` profile with `pending_approval` status. Only active CEO and Owner profiles
can read or manage other profiles; these rules are enforced by Supabase Row Level
Security (RLS), not just by dashboard navigation.

1. Copy `.env.example` to `.env.local` and set your Supabase project URL, anon key,
   and a long, private `CREW_INVITATION_CODE`. Never use the anon key as a secret.
2. In Supabase Authentication → URL Configuration, add the production URL
   `https://<your-production-domain>/auth/reset-password` to the Redirect URLs list
   so password recovery can return to the reset-password page.
3. Apply the migrations in `supabase/migrations` to the Supabase project.
4. Create the initial Owner and CEO identities through Supabase Auth. Then promote
   them from the Supabase SQL editor using their verified email addresses:

   ```sql
   UPDATE public.profiles
   SET role = 'owner', status = 'active', division = 'Executive',
       position = 'Owner', updated_at = now()
   WHERE lower(email) = lower('owner@example.com');

   UPDATE public.profiles
   SET role = 'ceo', status = 'active', division = 'Executive',
       position = 'CEO', updated_at = now()
   WHERE lower(email) = lower('ceo@example.com');
   ```

5. Restart the Next.js server after changing environment variables. Set the same
   server-only invitation code in the production hosting environment.

Legacy local/cloud crew accounts are not automatically trusted or imported.
Recreate identities in Supabase Auth and assign privileged roles only through the
Supabase SQL editor. Passwords from the legacy account store must not be reused;
reset them in Supabase Auth.

Regular crew can only open their assigned dashboard. Owner and CEO can access all
dashboards. Profile visibility and management, plus crew performance-review access,
are additionally enforced by database RLS.

Crew tasks are stored in Supabase: crew can read and update only tasks assigned to
their account, while CEO and Owner can access all tasks. Task ownership and allowed
updates are enforced by database RLS and table privileges.

The legacy cloud-sync endpoint also requires an active CEO or Owner session. Before
deploying, remove the old cloud-bin contents and rotate its access if it may contain
legacy account data. Some operational dashboard data is still stored in browser
`localStorage`; those areas need database-backed RLS before they can be considered
secure across devices or against someone with access to the same browser profile.

---

## 🎨 Identitas Visual Resmi ORVAXIA
* **Bru Slate**: `#606C8D`
* **Lavender**: `#A99AB3`
* **Pastel Yellow**: `#FDF5AE`
* **Dusty Peach**: `#D0A9A0`
* **Slogan**: *"A world connected by truth"*
* **Alamat**: Jl. Jenggolo No.2 A, Bedrek, Siwalanpanji, Kec. Buduran, Kabupaten Sidoarjo (SMKN 2 Buduran).
