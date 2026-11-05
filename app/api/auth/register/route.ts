import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function getSignupErrorMessage(code: string | undefined) {
  switch (code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'Email ini sudah terdaftar. Silakan masuk atau gunakan fitur lupa kata sandi.';
    case 'email_address_invalid':
      return 'Format email tidak valid. Periksa kembali alamat email yang dimasukkan.';
    case 'weak_password':
    case 'password_too_short':
      return 'Kata sandi terlalu lemah. Gunakan kata sandi yang lebih kuat.';
    case 'over_email_send_rate_limit':
    case 'email_send_rate_limit_exceeded':
      return 'Terlalu banyak permintaan konfirmasi email. Tunggu beberapa saat sebelum mencoba lagi.';
    case 'signup_disabled':
      return 'Pendaftaran akun sedang dinonaktifkan. Hubungi administrator.';
    case 'email_provider_disabled':
      return 'Pendaftaran melalui email belum tersedia. Hubungi administrator.';
    default:
      return 'Sistem autentikasi gagal memproses pendaftaran. Coba lagi nanti atau hubungi administrator.';
  }
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const invitationCode = process.env.CREW_INVITATION_CODE;

  if (
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    !supabaseAnonKey ||
    supabaseAnonKey.includes('placeholder') ||
    !invitationCode?.trim()
  ) {
    return NextResponse.json(
      { error: 'Pendaftaran crew belum dikonfigurasi oleh administrator.' },
      { status: 503 }
    );
  }

  let body: {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    invitationCode?: string;
    division?: string;
    position?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format data pendaftaran tidak valid.' }, { status: 400 });
  }

  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone?.trim();
  const password = body.password;

  if (!fullName || !email || !phone || !password || !body.invitationCode) {
    return NextResponse.json({ error: 'Mohon lengkapi seluruh formulir pendaftaran.' }, { status: 400 });
  }

  const expectedCode = Buffer.from(invitationCode.trim().toUpperCase());
  const providedCode = Buffer.from(body.invitationCode.trim().toUpperCase());
  if (expectedCode.length !== providedCode.length || !timingSafeEqual(expectedCode, providedCode)) {
    return NextResponse.json(
      { error: 'Kode undangan tidak cocok. Minta administrator memeriksa CREW_INVITATION_CODE di konfigurasi server dan menerapkan ulang aplikasinya.' },
      { status: 403 }
    );
  }

  if (
    fullName.length > 120 ||
    email.length > 254 ||
    phone.length > 30 ||
    (body.division?.length || 0) > 80 ||
    (body.position?.length || 0) > 120 ||
    password.length < 6 ||
    password.length > 128
  ) {
    return NextResponse.json({ error: 'Data pendaftaran tidak memenuhi ketentuan.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        division: body.division?.trim() || 'Menunggu Arahan',
        position: body.position?.trim() || 'Crew Baru (Pending)',
      },
    },
  });

  if (error) {
    console.error('Crew sign-up failed:', { code: error.code, status: error.status });
    return NextResponse.json(
      { error: getSignupErrorMessage(error.code) },
      { status: 400 }
    );
  }

  if (!data.user) {
    return NextResponse.json({ error: 'Supabase tidak mengembalikan akun crew.' }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    userId: data.user.id,
    requiresEmailConfirmation: !data.session,
  });
}
