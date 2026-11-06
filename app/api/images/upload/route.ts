import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const BUCKET = 'orvaxia-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = {
  'image/jpeg': { extension: 'jpg', signature: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  'image/png': { extension: 'png', signature: (bytes: Uint8Array) => Buffer.from(bytes.slice(0, 8)).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/webp': { extension: 'webp', signature: (bytes: Uint8Array) => Buffer.from(bytes.slice(0, 4)).toString() === 'RIFF' && Buffer.from(bytes.slice(8, 12)).toString() === 'WEBP' },
} as const;

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Penyimpanan gambar belum dikonfigurasi.' }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Format unggahan gambar tidak valid.' }, { status: 400 });
  }

  const purpose = formData.get('purpose');
  const file = formData.get('file');
  if ((purpose !== 'crew' && purpose !== 'catalog') || !(file instanceof File)) {
    return NextResponse.json({ error: 'Pilih file gambar dari perangkat Anda.' }, { status: 400 });
  }
  if (file.size < 1 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Ukuran gambar maksimal 5MB.' }, { status: 400 });
  }

  const imageType = IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES];
  if (!imageType) {
    return NextResponse.json({ error: 'Format gambar harus JPG, PNG, atau WEBP.' }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!imageType.signature(bytes)) {
    return NextResponse.json({ error: 'Isi file tidak sesuai dengan format gambar.' }, { status: 400 });
  }

  if (purpose === 'crew' || purpose === 'catalog') {
    const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Sesi crew diperlukan untuk mengunggah foto model.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sesi crew tidak valid. Silakan masuk kembali.' }, { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role,status')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError) {
      console.error('Image upload profile check failed', profileError);
      return NextResponse.json({ error: 'Hak akses crew gagal diverifikasi.' }, { status: 500 });
    }
    const allowedRoles = purpose === 'crew' ? ['owner', 'ceo'] : ['owner', 'ceo', 'marketing'];
    if (!profile || profile.status !== 'active' || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: 'Role akun tidak memiliki izin untuk mengunggah gambar ini.' }, { status: 403 });
    }
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const path = `${purpose}/${randomUUID()}.${imageType.extension}`;
  const { error: uploadError } = await adminClient.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
  if (uploadError) {
    console.error('Image upload failed', uploadError);
    return NextResponse.json({ error: 'Gambar gagal disimpan. Coba lagi nanti.' }, { status: 500 });
  }

  const { data } = adminClient.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
