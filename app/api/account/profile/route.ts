import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Penyimpanan profil belum dikonfigurasi.' }, { status: 503 });
  }
  if (!token) return NextResponse.json({ error: 'Sesi customer diperlukan.' }, { status: 401 });

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Sesi customer tidak valid.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format profil tidak valid.' }, { status: 400 });
  }
  const fullName = payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as { fullName?: unknown }).fullName
    : null;
  if (typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 120) {
    return NextResponse.json({ error: 'Nama lengkap wajib diisi (maksimal 120 karakter).' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role,status')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profileError) {
    console.error('Customer profile authorization failed', profileError);
    return NextResponse.json({ error: 'Profil gagal diverifikasi.' }, { status: 500 });
  }
  if (!profile || profile.role !== 'customer' || profile.status !== 'active') {
    return NextResponse.json({ error: 'Akses hanya untuk customer aktif.' }, { status: 403 });
  }

  const { data, error } = await admin
    .from('profiles')
    .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
    .eq('id', authData.user.id)
    .select('id,full_name,phone,updated_at')
    .single();
  if (error || !data) {
    console.error('Customer profile update failed', error);
    return NextResponse.json({ error: 'Profil gagal disimpan.' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
