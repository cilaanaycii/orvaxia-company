import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS } from '@/lib/data/initial-data';
import { Order, OrderItem } from '@/lib/types';

type OrderRequest = Omit<Order, 'id' | 'referenceCode' | 'createdAt' | 'updatedAt' | 'auditTrail'>;

const isText = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Penyimpanan pesanan belum dikonfigurasi.' }, { status: 503 });
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Format pesanan tidak valid.' }, { status: 400 });
  }
  if (!requestBody || typeof requestBody !== 'object' || Array.isArray(requestBody)) {
    return NextResponse.json({ error: 'Format pesanan tidak valid.' }, { status: 400 });
  }
  const payload = requestBody as OrderRequest;

  if (
    !isText(payload.customerName, 120) ||
    !isText(payload.customerPhone, 30) ||
    !isText(payload.schoolName, 160) ||
    !isText(payload.className, 80) ||
    !isText(payload.shippingAddress, 500) ||
    !['school', 'home', 'pickup'].includes(payload.deliveryType) ||
    !['cash_school', 'qris', 'bank_transfer', 'midtrans'].includes(payload.paymentMethod) ||
    !Array.isArray(payload.items) ||
    payload.items.length < 1 ||
    payload.items.length > 20
  ) {
    return NextResponse.json({ error: 'Data pemesan atau item pesanan tidak valid.' }, { status: 400 });
  }

  const validatedItems: OrderItem[] = [];
  for (const [index, item] of payload.items.entries()) {
    if (!item || typeof item !== 'object') {
      return NextResponse.json({ error: `Item pesanan nomor ${index + 1} tidak valid.` }, { status: 400 });
    }
    const product = INITIAL_PRODUCTS.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.name === item.variantName);
    const size = product?.sizes.find((candidate) => candidate.name === item.sizeName);
    const quantity = Number(item.quantity);
    if (!product || !variant || !size || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json({ error: `Item pesanan nomor ${index + 1} tidak valid.` }, { status: 400 });
    }

    const unitPrice = product.basePrice + size.priceAdjustment;
    validatedItems.push({
      id: randomBytes(8).toString('hex'),
      productId: product.id,
      productName: product.name,
      variantName: variant.name,
      sizeName: size.name,
      customCharm: typeof item.customCharm === 'string' ? item.customCharm.slice(0, 100) : undefined,
      unitPrice,
      quantity,
      subtotal: unitPrice * quantity,
      customization: {
        bottleSize: size.name,
        variantColor: variant.name,
        customCharm: typeof item.customCharm === 'string' ? item.customCharm.slice(0, 100) : undefined,
        customNotes: typeof item.customization?.customNotes === 'string'
          ? item.customization.customNotes.slice(0, 500)
          : undefined,
        customImageRefName: typeof item.customization?.customImageRefName === 'string'
          ? item.customization.customImageRefName.slice(0, 120)
          : undefined,
      },
    });
  }

  const distanceKm = Math.max(0, Math.min(500, Number(payload.distanceKm) || 0));
  const shippingCost = payload.deliveryType === 'home'
    ? distanceKm <= 2
      ? INITIAL_SITE_SETTINGS.shippingRules.range1To2Km
      : distanceKm <= 5
        ? INITIAL_SITE_SETTINGS.shippingRules.range3To5Km
        : distanceKm <= 7
          ? INITIAL_SITE_SETTINGS.shippingRules.range6To7Km
          : INITIAL_SITE_SETTINGS.shippingRules.rangeAbove7Km
    : 0;
  const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const now = new Date().toISOString();
  const dayCode = now.slice(0, 10).replace(/-/g, '');
  const referenceCode = `ORV-${dayCode}-${randomBytes(4).toString('hex').toUpperCase()}`;
  const normalizedPhone = payload.customerPhone.replace(/\D/g, '');
  if (normalizedPhone.length < 8 || normalizedPhone.length > 20) {
    return NextResponse.json({ error: 'Nomor WhatsApp tidak valid.' }, { status: 400 });
  }

  const order: Order = {
    id: randomUUID(),
    referenceCode,
    customerName: payload.customerName.trim(),
    customerEmail: typeof payload.customerEmail === 'string' ? payload.customerEmail.trim().slice(0, 254) : '',
    customerPhone: payload.customerPhone.trim(),
    schoolName: payload.schoolName.trim(),
    className: payload.className.trim(),
    deliveryType: payload.deliveryType,
    shippingAddress: payload.shippingAddress.trim(),
    distanceKm,
    shippingCost,
    subtotal,
    totalAmount: subtotal + shippingCost,
    paymentMethod: payload.paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'pending_confirmation',
    poPeriodId: typeof payload.poPeriodId === 'string' ? payload.poPeriodId.slice(0, 80) : '',
    items: validatedItems,
    notes: typeof payload.notes === 'string' ? payload.notes.trim().slice(0, 1000) : '',
    createdAt: now,
    updatedAt: now,
    auditTrail: [{ timestamp: now, changedBy: `${payload.customerName.trim()} (Customer)`, action: 'Pemesanan berhasil disimpan' }],
  };

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from('company_orders')
    .insert({
      reference_code: referenceCode,
      phone_hash: createHash('sha256').update(normalizedPhone).digest('hex'),
      details: order,
      order_status: order.orderStatus,
      payment_status: order.paymentStatus,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Order persistence failed', error);
    return NextResponse.json({ error: 'Pesanan gagal disimpan. Coba lagi.' }, { status: 500 });
  }

  return NextResponse.json({ ...order, id: data.id }, { status: 201 });
}
