import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CLOUD_BIN_URL = 'https://extendsclass.com/api/json-storage/bin/bfafbaa';

export const dynamic = 'force-dynamic';

async function authorizeExecutive(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!supabaseUrl || !supabaseAnonKey || !token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Sesi eksekutif diperlukan.' }, { status: 401 }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Sesi Supabase tidak valid.' }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role,status')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Hak akses akun gagal diverifikasi.' }, { status: 500 }),
    };
  }
  if (
    !profile ||
    profile.status !== 'active' ||
    (profile.role !== 'owner' && profile.role !== 'ceo')
  ) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Akses cloud dibatasi untuk CEO dan Owner.' }, { status: 403 }),
    };
  }

  return { ok: true as const, supabase };
}

export async function GET(request: Request) {
  const authorization = await authorizeExecutive(request);
  if (!authorization.ok) return authorization.response;

  try {
    const res = await fetch(CLOUD_BIN_URL, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from cloud storage' }, { status: 500 });
    }

    const data = await res.json();
    const publicData = { ...data };
    delete publicData.users;
    if (publicData.siteSettings) {
      publicData.siteSettings = { ...publicData.siteSettings, crewInvitationCode: '' };
    }
    return NextResponse.json(publicData);
  } catch (error) {
    return NextResponse.json({ error: 'Cloud connection error', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeExecutive(request);
  if (!authorization.ok) return authorization.response;

  try {
    const incomingData = await request.json();
    if (!incomingData || typeof incomingData !== 'object' || Array.isArray(incomingData)) {
      return NextResponse.json({ error: 'Invalid sync payload' }, { status: 400 });
    }
    if (Object.prototype.hasOwnProperty.call(incomingData, 'users')) {
      return NextResponse.json(
        { error: 'Crew profiles dikelola melalui Supabase Auth.' },
        { status: 403 }
      );
    }

    // 1. Fetch current cloud state first to merge safely
    let currentData: any = { orders: [] };
    try {
      const getRes = await fetch(CLOUD_BIN_URL, { cache: 'no-store' });
      if (getRes.ok) {
        currentData = await getRes.json();
      }
    } catch {}

    // Merge users: keep existing + update/add incoming
    // Merge orders if present
    let mergedOrders = Array.isArray(currentData.orders) ? [...currentData.orders] : [];
    if (Array.isArray(incomingData.orders)) {
      incomingData.orders.forEach((inOrder: any) => {
        const idx = mergedOrders.findIndex((o: any) => o.id === inOrder.id || o.referenceCode === inOrder.referenceCode);
        if (idx >= 0) {
          mergedOrders[idx] = { ...mergedOrders[idx], ...inOrder };
        } else {
          mergedOrders.push(inOrder);
        }
      });
    }

    const siteSettings = {
      ...(incomingData.siteSettings || currentData.siteSettings || {}),
      crewInvitationCode: '',
    };
    const payloadToSave = {
      app: 'orvaxia_company_official',
      orders: mergedOrders,
      siteSettings,
      lastSyncedAt: new Date().toISOString(),
    };

    const putRes = await fetch(CLOUD_BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadToSave),
    });

    if (!putRes.ok) {
      return NextResponse.json({ error: 'Failed to save to cloud storage' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: payloadToSave,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Cloud write error', details: String(error) }, { status: 500 });
  }
}
