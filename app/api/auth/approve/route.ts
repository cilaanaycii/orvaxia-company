import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PROFILE_COLUMNS =
  'id,email,full_name,phone,role,status,division,position,avatar_url,created_at,updated_at';

const allowedRoles = new Set([
  'owner',
  'ceo',
  'production',
  'sales',
  'marketing',
  'hrd',
  'finance',
  'pr',
  'member',
  'customer',
]);

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (
    !supabaseUrl ||
    supabaseUrl.includes('placeholder') ||
    !supabaseAnonKey ||
    supabaseAnonKey.includes('placeholder')
  ) {
    return NextResponse.json(
      { error: 'Supabase belum dikonfigurasi. Hubungi administrator.' },
      { status: 503 }
    );
  }

  const authorization = request.headers.get('authorization');
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) {
    return NextResponse.json({ error: 'Sesi Owner/CEO tidak ditemukan.' }, { status: 401 });
  }

  let body: {
    action?: string;
    userId?: string;
    role?: string;
    division?: string;
    position?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const action = body.action || 'approve';
  if (
    !body.userId ||
    (action !== 'approve' && action !== 'resend') ||
    (action === 'approve' &&
      (!body.role ||
        !allowedRoles.has(body.role) ||
        !body.division?.trim() ||
        !body.position?.trim() ||
        body.division.length > 80 ||
        body.position.length > 120))
  ) {
    return NextResponse.json({ error: 'Data persetujuan tidak valid.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Sesi tidak valid atau sudah berakhir.' }, { status: 401 });
  }

  const { data: actor, error: actorError } = await supabase
    .from('profiles')
    .select('role,status')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (
    actorError ||
    !actor ||
    actor.status !== 'active' ||
    (actor.role !== 'owner' && actor.role !== 'ceo')
  ) {
    return NextResponse.json({ error: 'Hanya Owner atau CEO aktif yang dapat melakukan tindakan ini.' }, { status: 403 });
  }

  const { data: target, error: targetError } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', body.userId)
    .maybeSingle();

  if (targetError || !target) {
    return NextResponse.json({ error: 'Profil crew tidak ditemukan atau tidak dapat diakses.' }, { status: 404 });
  }

  if (
    (action === 'approve' && target.status !== 'pending_approval') ||
    (action === 'resend' && target.status !== 'active')
  ) {
    return NextResponse.json(
      { error: action === 'approve' ? 'Akun ini bukan lagi menunggu persetujuan.' : 'Email hanya dapat dikirim ulang untuk akun aktif.' },
      { status: 409 }
    );
  }

  if (!resendApiKey?.trim() || !emailFrom?.trim()) {
    if (action === 'resend') {
      return NextResponse.json(
        { error: 'Email belum dikonfigurasi. Hubungi administrator untuk mengatur Resend.' },
        { status: 503 }
      );
    }

    const { data: approvedProfile, error } = await supabase
      .from('profiles')
      .update({
        role: body.role,
        division: body.division!.trim(),
        position: body.position!.trim(),
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.userId)
      .eq('status', 'pending_approval')
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (error || !approvedProfile) {
      return NextResponse.json(
        { error: 'Persetujuan gagal disimpan. Periksa izin akun dan coba lagi.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      approved: true,
      emailSent: false,
      profile: approvedProfile,
    });
  }

  let approvedProfile = target;
  if (action === 'approve') {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: body.role,
        division: body.division!.trim(),
        position: body.position!.trim(),
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.userId)
      .eq('status', 'pending_approval')
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Persetujuan gagal disimpan. Periksa izin akun dan coba lagi.' },
        { status: 409 }
      );
    }
    approvedProfile = data;
  }

  const name = escapeHtml(approvedProfile.full_name || 'Crew ORVAXIA');
  const role = escapeHtml(approvedProfile.position || approvedProfile.role);
  const division = escapeHtml(approvedProfile.division || '-');
  let emailResponse: Response;
  try {
    emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom.trim(),
        to: [approvedProfile.email],
        subject: 'Akun crew ORVAXIA COMPANY telah disetujui',
        text: `Halo ${approvedProfile.full_name || 'Crew ORVAXIA'}, akun Anda telah disetujui dan sekarang aktif.\n\nDivisi: ${approvedProfile.division || '-'}\nJabatan: ${approvedProfile.position || approvedProfile.role}\n\nSilakan masuk menggunakan email dan kata sandi yang Anda daftarkan. Jika Supabase meminta konfirmasi email, selesaikan konfirmasi tersebut terlebih dahulu.`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#26324b"><h2>Akun Anda telah disetujui</h2><p>Halo ${name}, akun crew ORVAXIA COMPANY Anda sekarang aktif.</p><p><strong>Divisi:</strong> ${division}<br><strong>Jabatan:</strong> ${role}</p><p>Silakan masuk menggunakan email dan kata sandi yang Anda daftarkan. Jika Supabase meminta konfirmasi email, selesaikan konfirmasi tersebut terlebih dahulu.</p></div>`,
      }),
    });
  } catch (error) {
    console.error('Resend approval email request failed', error);
    return NextResponse.json(
      {
        error: 'Akun sudah aktif, tetapi server email tidak dapat dijangkau. Coba kirim ulang dari daftar crew.',
        approved: action === 'approve',
        profile: approvedProfile,
      },
      { status: 502 }
    );
  }

  if (!emailResponse.ok) {
    console.error('Resend approval email failed', { status: emailResponse.status });
    return NextResponse.json(
      {
        error: 'Akun sudah aktif, tetapi email persetujuan gagal dikirim. Coba kirim ulang dari daftar crew.',
        approved: action === 'approve',
        profile: approvedProfile,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    approved: action === 'approve',
    emailSent: true,
    profile: approvedProfile,
  });
}
