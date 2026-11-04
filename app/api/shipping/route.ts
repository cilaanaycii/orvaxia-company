import { NextResponse } from 'next/server';
import { INITIAL_SITE_SETTINGS } from '@/lib/data/initial-data';

export async function POST(request: Request) {
  try {
    const { distanceKm, deliveryType } = await request.json();

    if (deliveryType === 'school' || deliveryType === 'pickup') {
      return NextResponse.json({ shippingCost: 0, distanceKm: 0 });
    }

    const km = Number(distanceKm) || 0;
    let shippingCost = 0;

    if (km <= 2) {
      shippingCost = INITIAL_SITE_SETTINGS.shippingRules.range1To2Km; // 0
    } else if (km <= 5) {
      shippingCost = INITIAL_SITE_SETTINGS.shippingRules.range3To5Km; // 3000
    } else if (km <= 7) {
      shippingCost = INITIAL_SITE_SETTINGS.shippingRules.range6To7Km; // 4000
    } else {
      shippingCost = INITIAL_SITE_SETTINGS.shippingRules.rangeAbove7Km; // 5000
    }

    return NextResponse.json({
      distanceKm: km,
      shippingCost,
      referencePoint: INITIAL_SITE_SETTINGS.referencePoint,
    });
  } catch {
    return NextResponse.json({ error: 'Gagal menghitung tarif ongkir' }, { status: 400 });
  }
}
