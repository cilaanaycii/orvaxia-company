import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS } from '@/lib/data/initial-data';
import { ProductVariant } from '@/lib/types';

const BUCKET = 'orvaxia-images';
const CATALOG_PATH = 'catalog/variants.json';

function isProductVariant(value: unknown): value is ProductVariant {
  if (!value || typeof value !== 'object') return false;
  const variant = value as Record<string, unknown>;
  if (
    typeof variant.id !== 'string' ||
    variant.id.length > 100 ||
    typeof variant.name !== 'string' ||
    !variant.name.trim() ||
    variant.name.length > 120 ||
    typeof variant.description !== 'string' ||
    variant.description.length > 500 ||
    typeof variant.colorHex !== 'string' ||
    variant.colorHex.length > 20
  ) return false;
  if (variant.image === undefined || variant.image === '') return true;
  if (typeof variant.image !== 'string' || variant.image.length > 2048) return false;
  try {
    const imageUrl = new URL(variant.image);
    return imageUrl.protocol === 'https:' || imageUrl.protocol === 'http:';
  } catch {
    return false;
  }
}

function isProductVariantArray(value: unknown): value is ProductVariant[] {
  return Array.isArray(value) && value.every(isProductVariant);
}

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

function isMissingStorageObject(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const storageError = error as {
    status?: unknown;
    statusCode?: unknown;
    originalError?: unknown;
  };
  if (storageError.status === 404 || storageError.statusCode === '404') return true;

  const response = storageError.originalError;
  return response instanceof Response && [400, 404].includes(response.status);
}

export async function GET() {
  const clients = getClients();
  if (!clients) {
    return NextResponse.json({ error: 'Penyimpanan katalog belum dikonfigurasi.' }, { status: 503 });
  }

  const { error: bucketError } = await clients.admin.storage.getBucket(BUCKET);
  if (bucketError) {
    console.error('Shared product catalog bucket unavailable', bucketError);
    return NextResponse.json({ error: 'Penyimpanan katalog tidak tersedia.' }, { status: 503 });
  }

  const { data: file, error } = await clients.admin.storage.from(BUCKET).download(CATALOG_PATH);
  if (error) {
    if (isMissingStorageObject(error)) return NextResponse.json({ variants: null });
    console.error('Shared product variants download failed', error);
    return NextResponse.json({ error: 'Katalog bersama gagal dimuat.' }, { status: 500 });
  }

  try {
    const catalog: unknown = JSON.parse(await file.text());
    if (
      !catalog ||
      typeof catalog !== 'object' ||
      !('productId' in catalog) ||
      catalog.productId !== INITIAL_PRODUCTS[0].id ||
      !('variants' in catalog) ||
      !isProductVariantArray(catalog.variants)
    ) {
      return NextResponse.json({ error: 'Data katalog bersama tidak valid.' }, { status: 500 });
    }
    return NextResponse.json({ variants: catalog.variants });
  } catch (parseError) {
    console.error('Shared product variants JSON is invalid', parseError);
    return NextResponse.json({ error: 'Data katalog bersama tidak dapat dibaca.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const clients = getClients();
  if (!clients) {
    return NextResponse.json({ error: 'Penyimpanan katalog belum dikonfigurasi.' }, { status: 503 });
  }

  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return NextResponse.json({ error: 'Sesi crew diperlukan untuk memperbarui katalog.' }, { status: 401 });
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
    console.error('Catalog update profile check failed', profileError);
    return NextResponse.json({ error: 'Hak akses crew gagal diverifikasi.' }, { status: 500 });
  }
  if (!profile || profile.status !== 'active' || !['owner', 'ceo', 'marketing'].includes(profile.role)) {
    return NextResponse.json({ error: 'Hanya crew Marketing, CEO, dan Owner yang dapat mengubah katalog.' }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format data katalog tidak valid.' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ error: 'Format data katalog tidak valid.' }, { status: 400 });
  }
  const catalogPayload = payload as { productId?: unknown; variants?: unknown };
  if (
    catalogPayload.productId !== INITIAL_PRODUCTS[0].id ||
    !Array.isArray(catalogPayload.variants) ||
    catalogPayload.variants.length < 1 ||
    catalogPayload.variants.length > 50 ||
    !isProductVariantArray(catalogPayload.variants)
  ) {
    return NextResponse.json({ error: 'Data varian produk tidak valid.' }, { status: 400 });
  }

  const { error: saveError } = await clients.admin.storage.from(BUCKET).upload(
    CATALOG_PATH,
    new Blob([JSON.stringify({ productId: catalogPayload.productId, variants: catalogPayload.variants })], {
      type: 'application/json',
    }),
    { contentType: 'application/json', upsert: true, cacheControl: '60' }
  );
  if (saveError) {
    console.error('Shared product variants save failed', saveError);
    return NextResponse.json({ error: 'Perubahan katalog gagal disimpan.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
