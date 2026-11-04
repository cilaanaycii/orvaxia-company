import { NextResponse } from 'next/server';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS, INITIAL_PO_PERIOD } from '@/lib/data/initial-data';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const {
      customerName,
      customerPhone,
      schoolName,
      className,
      deliveryType,
      distanceKm,
      items,
      poPeriodId,
      paymentMethod,
    } = payload;

    // 1. Validate customer input
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'Nama pelanggan tidak valid' }, { status: 400 });
    }
    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 8) {
      return NextResponse.json({ error: 'Nomor WhatsApp tidak valid' }, { status: 400 });
    }

    // 2. Validate PO period window
    const now = new Date();
    const poEnd = new Date(INITIAL_PO_PERIOD.endsAt);
    if (now > poEnd || INITIAL_PO_PERIOD.status === 'closed') {
      return NextResponse.json(
        { error: 'Periode Pre-Order telah berakhir atau ditutup oleh admin' },
        { status: 400 }
      );
    }

    // 3. Server-side recalculation of order items and pricing
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang belanja tidak boleh kosong' }, { status: 400 });
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Produk ${item.productId} tidak ditemukan` }, { status: 400 });
      }

      const variant = product.variants.find((v) => v.name === item.variantName);
      if (!variant) {
        return NextResponse.json({ error: `Varian ${item.variantName} tidak valid` }, { status: 400 });
      }

      const size = product.sizes.find((s) => s.name === item.sizeName);
      const sizeAdjustment = size ? size.priceAdjustment : 0;

      let charmPrice = 0;
      if (item.customCharm?.includes('+Rp3.000')) charmPrice = 3000;
      else if (item.customCharm?.includes('+Rp2.500')) charmPrice = 2500;

      const serverUnitPrice = product.basePrice + sizeAdjustment + charmPrice;
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
      const lineSubtotal = serverUnitPrice * quantity;

      calculatedSubtotal += lineSubtotal;

      validatedItems.push({
        ...item,
        unitPrice: serverUnitPrice,
        quantity,
        subtotal: lineSubtotal,
      });
    }

    // 4. Server-side shipping calculation from SMKN 2 Buduran
    let serverShippingCost = 0;
    const km = Number(distanceKm) || 0;

    if (deliveryType === 'home') {
      if (km <= 2) {
        serverShippingCost = INITIAL_SITE_SETTINGS.shippingRules.range1To2Km;
      } else if (km <= 5) {
        serverShippingCost = INITIAL_SITE_SETTINGS.shippingRules.range3To5Km;
      } else if (km <= 7) {
        serverShippingCost = INITIAL_SITE_SETTINGS.shippingRules.range6To7Km;
      } else {
        serverShippingCost = INITIAL_SITE_SETTINGS.shippingRules.rangeAbove7Km;
      }
    }

    const calculatedTotal = calculatedSubtotal + serverShippingCost;

    // Generate unique order reference code
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `ORV-${dateCode}-${randomSuffix}`;

    return NextResponse.json(
      {
        success: true,
        referenceCode,
        subtotal: calculatedSubtotal,
        shippingCost: serverShippingCost,
        totalAmount: calculatedTotal,
        items: validatedItems,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal pada server order' },
      { status: 500 }
    );
  }
}
