import { NextResponse } from 'next/server';

const CLOUD_BIN_URL = 'https://extendsclass.com/api/json-storage/bin/bfafbaa';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Cloud connection error', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const incomingData = await request.json();

    // 1. Fetch current cloud state first to merge safely
    let currentData: any = { users: [], orders: [] };
    try {
      const getRes = await fetch(CLOUD_BIN_URL, { cache: 'no-store' });
      if (getRes.ok) {
        currentData = await getRes.json();
      }
    } catch {}

    // Merge users: keep existing + update/add incoming
    let mergedUsers = Array.isArray(currentData.users) ? [...currentData.users] : [];
    if (Array.isArray(incomingData.users)) {
      incomingData.users.forEach((inUser: any) => {
        const idx = mergedUsers.findIndex(
          (u: any) => u.id === inUser.id || (u.email && inUser.email && u.email.toLowerCase() === inUser.email.toLowerCase())
        );
        if (idx >= 0) {
          mergedUsers[idx] = { ...mergedUsers[idx], ...inUser };
        } else {
          mergedUsers.push(inUser);
        }
      });
    }

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

    const payloadToSave = {
      app: 'orvaxia_company_official',
      users: mergedUsers,
      orders: mergedOrders,
      siteSettings: incomingData.siteSettings || currentData.siteSettings || { crewInvitationCode: 'ORVAXIA2026' },
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
