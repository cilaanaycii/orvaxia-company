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

## 🔑 Akun Uji Coba Cepat (Multi-Role Switcher)

Anda dapat langsung menguji setiap dashboard melalui menu dropdown **"Ganti Peran Divisi"** di bilah navigasi kiri dashboard, atau login menggunakan profil berikut:

| Peran (Role) | Akses Fitur Utama |
| :--- | :--- |
| **Owner / Super Admin** | Menyetujui pendaftaran anggota, mengubah role, konfigurasi WA/bank/ongkir. |
| **CEO Executive** | Mengawasi laba bersih, omset terverifikasi, status PO, dan perkembangan divisi. |
| **Produksi** | Antrean pesanan rajut, catatan kustomisasi ukuran botol, kontrol stok benang. |
| **Sales** | Penugasan kurir antarkelas, input nomor resi ekspedisi, konfirmasi serah terima. |
| **Marketing** | Pengaturan harga dasar, varian warna, foto produk, dan banner promo. |
| **HRD** | Penilaian berkala 31 anggota dengan 7 indikator resmi & ekspor cetak PDF. |
| **Finance** | Verifikasi pembayaran tunai/online & buku kas arus masuk/keluar. |
| **Public Relations (PR)** | Pengumuman publik, pemeliharaan media sosial (@orvaxia.company), FAQ. |
| **General Member** | Checklist tugas pribadi dengan tenggat waktu dan catatan bimbingan HRD. |

---

## 🎨 Identitas Visual Resmi ORVAXIA
* **Bru Slate**: `#606C8D`
* **Lavender**: `#A99AB3`
* **Pastel Yellow**: `#FDF5AE`
* **Dusty Peach**: `#D0A9A0`
* **Slogan**: *"A world connected by truth"*
* **Alamat**: Jl. Jenggolo No.2 A, Bedrek, Siwalanpanji, Kec. Buduran, Kabupaten Sidoarjo (SMKN 2 Buduran).
