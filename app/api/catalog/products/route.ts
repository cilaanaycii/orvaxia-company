import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getClients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return null;

  return {
    supabaseUrl,
    anonKey,
    admin: createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
  };
}

export async function PATCH(request: Request) {
  const clients = getClients();
  if (!clients) {
    return NextResponse.json({ error: 'Penyimpanan katalog belum dikonfigurasi.' }, { status: 503 });
  }

  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return NextResponse.json({ error: 'Sesi crew diperlukan untuk mengubah harga.' }, { status: 401 });
  }

  const authClient = createClient(clients.supabaseUrl, clients.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Sesi crew tidak valid. Silakan masuk kembali.' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await clients.admin
    .from('profiles')
    .select('role,status')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profileError) {
    console.error('Catalog price profile check failed', profileError);
    return NextResponse.json({ error: 'Hak akses crew gagal diverifikasi.' }, { status: 500 });
  }
  if (!profile || profile.status !== 'active' || !['owner', 'ceo', 'marketing'].includes(profile.role)) {
    return NextResponse.json({ error: 'Hanya Owner, CEO, atau Marketing aktif yang dapat mengubah harga.' }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format harga tidak valid.' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Format harga tidak valid.' }, { status: 400 });
  }

  const { slug, price } = payload as { slug?: unknown; price?: unknown };
  if (
    typeof slug !== 'string' ||
    slug.length > 120 ||
    typeof price !== 'number' ||
    !Number.isSafeInteger(price) ||
    price < 1 ||
    price > 100_000_000
  ) {
    return NextResponse.json({ error: 'Harga harus berupa bilangan bulat lebih besar dari Rp0.' }, { status: 400 });
  }

  const { data, error } = await clients.admin
    .from('products')
    .update({ price, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select('slug,price')
    .maybeSingle();
  if (error) {
    console.error('Catalog price update failed', error);
    return NextResponse.json({ error: 'Harga gagal disimpan ke database.' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Produk katalog belum terdaftar. Terapkan migrasi katalog terlebih dahulu.' }, { status: 404 });
  }

  return NextResponse.json({ slug: data.slug, price: Number(data.price) });
}
