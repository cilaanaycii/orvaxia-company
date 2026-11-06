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

async function authorizeEditor(request: Request) {
  const clients = getClients();
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!clients || !token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Sesi editor diperlukan.' }, { status: clients ? 401 : 503 }),
    };
  }

  const authClient = createClient(clients.supabaseUrl, clients.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 }) };
  }

  const { data: profile, error } = await clients.admin
    .from('profiles')
    .select('role,status,full_name')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (error) {
    console.error('Content editor authorization lookup failed', error);
    return { ok: false as const, response: NextResponse.json({ error: 'Hak akses gagal diverifikasi.' }, { status: 500 }) };
  }
  if (!profile || profile.status !== 'active' || !['owner', 'ceo', 'pr'].includes(profile.role)) {
    return { ok: false as const, response: NextResponse.json({ error: 'Akses CMS hanya untuk PR, CEO, dan Owner aktif.' }, { status: 403 }) };
  }

  return { ok: true as const, clients, editorId: authData.user.id, editorName: profile.full_name as string };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const manage = url.searchParams.get('manage') === '1';
  const clients = getClients();
  if (!clients) {
    return NextResponse.json({ error: 'CMS belum dikonfigurasi di server.' }, { status: 503 });
  }

  if (manage) {
    const authorization = await authorizeEditor(request);
    if (!authorization.ok) return authorization.response;
  }

  const category = url.searchParams.get('category');
  let query = clients.admin
    .from('site_content')
    .select('id,slug,category,title,body,status,published_at,updated_at,updated_by')
    .order('updated_at', { ascending: false });
  if (!manage) query = query.eq('status', 'published');
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.error('Public content query failed', error);
    return NextResponse.json({ error: 'Konten gagal dimuat.' }, { status: 500 });
  }
  let editorNames = new Map<string, string>();
  if (manage) {
    const editorIds = [...new Set((data || []).map((item) => item.updated_by).filter((id): id is string => Boolean(id)))];
    if (editorIds.length) {
      const { data: editors, error: editorsError } = await clients.admin
        .from('profiles')
        .select('id,full_name')
        .in('id', editorIds);
      if (editorsError) {
        console.error('Content editor name lookup failed', editorsError);
        return NextResponse.json({ error: 'Identitas editor gagal dimuat.' }, { status: 500 });
      }
      editorNames = new Map((editors || []).map((editor) => [editor.id, editor.full_name]));
    }
  }
  return NextResponse.json({
    content: (data || []).map((item) => ({
      ...item,
      editor_name: item.updated_by ? editorNames.get(item.updated_by) || item.updated_by : null,
    })),
  });
}

function validateContentInput(body: unknown) {
  const input = body as Record<string, unknown>;
  const allowedCategories = ['home', 'about', 'contact', 'shop', 'announcement'];
  const status = input.status;
  if (
    typeof input.slug !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{1,79}$/.test(input.slug) ||
    typeof input.category !== 'string' ||
    !allowedCategories.includes(input.category) ||
    typeof input.title !== 'string' ||
    !input.title.trim() ||
    input.title.length > 160 ||
    typeof input.body !== 'string' ||
    input.body.length > 10000 ||
    (status !== 'draft' && status !== 'published')
  ) {
    return { ok: false as const, error: NextResponse.json({ error: 'Data konten tidak memenuhi ketentuan.' }, { status: 400 }) };
  }
  return { ok: true as const, input };
}

export async function POST(request: Request) {
  const authorization = await authorizeEditor(request);
  if (!authorization.ok) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format konten tidak valid.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Format konten tidak valid.' }, { status: 400 });
  }

  const validation = validateContentInput(body);
  if (!validation.ok) return validation.error;
  const input = validation.input as {
    slug: string;
    category: string;
    title: string;
    body: string;
    status: 'draft' | 'published';
  };
  const status = input.status;

  const { data: existing, error: lookupError } = await authorization.clients.admin
    .from('site_content')
    .select('id,created_by,published_at')
    .eq('slug', input.slug)
    .maybeSingle();
  if (lookupError) {
    console.error('Content lookup failed', lookupError);
    return NextResponse.json({ error: 'Konten gagal diperiksa.' }, { status: 500 });
  }

  const publishedAt = status === 'published'
    ? existing?.published_at || new Date().toISOString()
    : null;
  const values = {
    slug: input.slug,
    content_key: input.slug,
    category: input.category,
    title: input.title.trim(),
    body: input.body,
    content_value: input.body,
    status,
    is_public: status === 'published',
    published_at: publishedAt,
    updated_by: authorization.editorId,
    updated_at: new Date().toISOString(),
    ...(existing ? {} : { created_by: authorization.editorId }),
  };
  const query = existing
    ? authorization.clients.admin.from('site_content').update(values).eq('id', existing.id)
    : authorization.clients.admin.from('site_content').insert(values);
  const { data, error } = await query
    .select('id,slug,category,title,body,status,published_at,updated_at,updated_by')
    .single();
  if (error || !data) {
    console.error('Content save failed', error);
    return NextResponse.json({ error: 'Konten gagal disimpan.' }, { status: 500 });
  }

  return NextResponse.json({ content: { ...data, editor_name: authorization.editorName } });
}

export async function PATCH(request: Request) {
  const authorization = await authorizeEditor(request);
  if (!authorization.ok) return authorization.response;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'ID konten tidak valid.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format konten tidak valid.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Format konten tidak valid.' }, { status: 400 });
  }

  const existing = await authorization.clients.admin
    .from('site_content')
    .select('id,slug,published_at')
    .eq('id', id)
    .maybeSingle();
  if (existing.error || !existing.data) {
    return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
  }

  const input = body as Record<string, unknown>;
  const updates: Record<string, unknown> = {
    updated_by: authorization.editorId,
    updated_at: new Date().toISOString(),
  };

  if (typeof input.title === 'string') {
    if (!input.title.trim() || input.title.length > 160) {
      return NextResponse.json({ error: 'Judul wajib diisi (maksimal 160 karakter).' }, { status: 400 });
    }
    updates.title = input.title.trim();
  }
  if (typeof input.body === 'string') {
    if (input.body.length > 10000) {
      return NextResponse.json({ error: 'Isi konten terlalu panjang.' }, { status: 400 });
    }
    updates.body = input.body;
    updates.content_value = input.body;
  }
  if (typeof input.category === 'string') {
    const allowedCategories = ['home', 'about', 'contact', 'shop', 'announcement'];
    if (!allowedCategories.includes(input.category)) {
      return NextResponse.json({ error: 'Kategori tidak valid.' }, { status: 400 });
    }
    updates.category = input.category;
  }
  if (typeof input.slug === 'string') {
    if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(input.slug)) {
      return NextResponse.json({ error: 'Slug tidak valid.' }, { status: 400 });
    }
    const clash = await authorization.clients.admin
      .from('site_content')
      .select('id')
      .eq('slug', input.slug)
      .neq('id', id)
      .maybeSingle();
    if (!clash.error && clash.data) {
      return NextResponse.json({ error: 'Slug sudah digunakan oleh konten lain.' }, { status: 409 });
    }
    updates.slug = input.slug;
    updates.content_key = input.slug;
  }
  if (typeof input.status === 'string') {
    if (input.status !== 'draft' && input.status !== 'published') {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }
    updates.status = input.status;
    updates.is_public = input.status === 'published';
    updates.published_at = input.status === 'published'
      ? (existing.data.published_at || new Date().toISOString())
      : null;
  }

  const { data, error } = await authorization.clients.admin
    .from('site_content')
    .update(updates)
    .eq('id', id)
    .select('id,slug,category,title,body,status,published_at,updated_at,updated_by')
    .single();
  if (error || !data) {
    console.error('Content update failed', error);
    return NextResponse.json({ error: 'Konten gagal diperbarui.' }, { status: 500 });
  }

  return NextResponse.json({ content: { ...data, editor_name: authorization.editorName } });
}

export async function DELETE(request: Request) {
  const authorization = await authorizeEditor(request);
  if (!authorization.ok) return authorization.response;

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'ID konten tidak valid.' }, { status: 400 });
  }

  const { data: existing, error: lookupError } = await authorization.clients.admin
    .from('site_content')
    .select('id,slug')
    .eq('id', id)
    .maybeSingle();
  if (lookupError || !existing) {
    return NextResponse.json({ error: 'Konten tidak ditemukan.' }, { status: 404 });
  }

  const { error } = await authorization.clients.admin
    .from('site_content')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Content delete failed', error);
    return NextResponse.json({ error: 'Konten gagal dihapus.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: existing.slug });
}
