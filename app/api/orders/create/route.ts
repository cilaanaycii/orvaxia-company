import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_SITE_SETTINGS } from '@/lib/data/initial-data';
import { Order, OrderItem } from '@/lib/types';

type OrderRequest = Omit<Order, 'id' | 'referenceCode' | 'createdAt' | 'updatedAt' | 'auditTrail'> & {
  idempotencyKey?: string;
};

const isText = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;

function getCustomerImageUrl(value: unknown, supabaseUrl: string) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    const expectedOrigin = new URL(supabaseUrl).origin;
    if (
      url.origin === expectedOrigin &&
      url.pathname.startsWith('/storage/v1/object/public/orvaxia-images/customer/')
    ) {
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return NextResponse.json({ error: 'Penyimpanan pesanan belum dikonfigurasi.' }, { status: 503 });
  }
  if (!token) {
    return NextResponse.json({ error: 'Silakan masuk dengan akun customer sebelum melakukan checkout.' }, { status: 401 });
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
  if (typeof payload.idempotencyKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.idempotencyKey)) {
    return NextResponse.json({ error: 'Kunci transaksi tidak valid. Muat ulang checkout dan coba lagi.' }, { status: 400 });
  }

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
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user || !authData.user.phone) {
    return NextResponse.json({ error: 'Sesi customer tidak valid. Silakan masuk kembali.' }, { status: 401 });
  }

  const { data: customer, error: customerError } = await supabase
    .from('profiles')
    .select('id,role,status,full_name,phone')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (customerError) {
    console.error('Order customer profile lookup failed', customerError);
    return NextResponse.json({ error: 'Profil customer gagal diverifikasi.' }, { status: 500 });
  }
  if (!customer || customer.role !== 'customer' || customer.status !== 'active') {
    return NextResponse.json({ error: 'Hanya akun customer aktif yang dapat membuat pesanan.' }, { status: 403 });
  }

  const normalizedProfilePhone = String(customer.phone || '').replace(/\D/g, '');
  const normalizedAuthPhone = authData.user.phone.replace(/\D/g, '');
  const normalizedRequestPhone = typeof payload.customerPhone === 'string'
    ? payload.customerPhone.replace(/\D/g, '')
    : '';
  if (
    !normalizedProfilePhone ||
    normalizedProfilePhone !== normalizedAuthPhone ||
    normalizedProfilePhone !== normalizedRequestPhone
  ) {
    return NextResponse.json({ error: 'Nomor pesanan harus sama dengan nomor terverifikasi akun.' }, { status: 403 });
  }

  const { data: priorOrder, error: priorOrderError } = await supabase
    .from('company_orders')
    .select('id,details')
    .eq('customer_id', customer.id)
    .eq('idempotency_key', payload.idempotencyKey)
    .maybeSingle();
  if (priorOrderError) {
    console.error('Order idempotency lookup failed', priorOrderError);
    return NextResponse.json({ error: 'Penerapan migrasi akun/pesanan belum lengkap.' }, { status: 503 });
  }
  if (priorOrder) {
    return NextResponse.json({ ...(priorOrder.details as Order), id: priorOrder.id }, { status: 200 });
  }

  if (typeof payload.poPeriodId !== 'string') {
    return NextResponse.json({ error: 'Periode PO belum dipilih.' }, { status: 400 });
  }
  const { data: poPeriod, error: poError } = await supabase
    .from('po_periods')
    .select('id,status,starts_at,ends_at')
    .eq('id', payload.poPeriodId)
    .maybeSingle();
  if (poError) {
    console.error('Order PO period lookup failed', poError);
    return NextResponse.json({ error: 'Periode PO gagal diverifikasi di database.' }, { status: 500 });
  }
  const nowDate = new Date();
  if (
    !poPeriod ||
    poPeriod.status !== 'open' ||
    new Date(poPeriod.starts_at) > nowDate ||
    new Date(poPeriod.ends_at) <= nowDate
  ) {
    return NextResponse.json({ error: 'Periode pre-order tidak tersedia atau sudah ditutup.' }, { status: 400 });
  }
  for (const [index, item] of payload.items.entries()) {
    if (!item || typeof item !== 'object') {
      return NextResponse.json({ error: `Item pesanan nomor ${index + 1} tidak valid.` }, { status: 400 });
    }
    const product = INITIAL_PRODUCTS.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.name === item.variantName);
    const size = product?.sizes.find((candidate) => candidate.name === item.sizeName);
    const quantity = Number(item.quantity);
    if (
      !product ||
      !variant ||
      !isText(item.sizeName, 120) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      return NextResponse.json({ error: `Item pesanan nomor ${index + 1} tidak valid.` }, { status: 400 });
    }
    const { data: databaseProduct, error: productError } = await supabase
      .from('products')
      .select('id,price,status,is_available_for_po')
      .eq('slug', product.slug)
      .maybeSingle();
    if (productError) {
      console.error('Order catalog lookup failed', productError);
      return NextResponse.json({ error: 'Katalog gagal diverifikasi. Coba lagi.' }, { status: 500 });
    }
    if (!databaseProduct || databaseProduct.status !== 'published' || !databaseProduct.is_available_for_po) {
      return NextResponse.json({ error: `Produk ${product.name} tidak tersedia untuk pre-order.` }, { status: 400 });
    }
    if (databaseProduct.price === null || Number(databaseProduct.price) <= 0) {
      return NextResponse.json({ error: `Harga produk ${product.name} belum tersedia.` }, { status: 400 });
    }

    let sizeAdjustment = 0;
    if (size) {
      const { data: databaseSize, error: sizeError } = await supabase
        .from('product_sizes')
        .select('price_adjustment')
        .eq('product_id', databaseProduct.id)
        .eq('name', size.name)
        .eq('is_available', true)
        .maybeSingle();
      if (sizeError) {
        console.error('Order size lookup failed', sizeError);
        return NextResponse.json({ error: 'Ukuran produk gagal diverifikasi.' }, { status: 500 });
      }
      if (!databaseSize) {
        return NextResponse.json({ error: `Ukuran produk ${product.name} tidak tersedia.` }, { status: 400 });
      }
      sizeAdjustment = Number(databaseSize.price_adjustment);
    } else if (product.id !== INITIAL_PRODUCTS[0].id) {
      return NextResponse.json({ error: `Ukuran produk ${product.name} tidak valid.` }, { status: 400 });
    }

    const { data: databaseVariant, error: variantError } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', databaseProduct.id)
      .eq('name', variant.name)
      .eq('is_available', true)
      .maybeSingle();
    if (variantError) {
      console.error('Order variant lookup failed', variantError);
      return NextResponse.json({ error: 'Varian produk gagal diverifikasi.' }, { status: 500 });
    }
    if (!databaseVariant) {
      return NextResponse.json({ error: `Varian ${variant.name} tidak tersedia.` }, { status: 400 });
    }
    const customImageRefUrl = getCustomerImageUrl(item.customization?.customImageRefUrl, supabaseUrl);
    if (customImageRefUrl === null) {
      return NextResponse.json({ error: `Tautan gambar referensi item nomor ${index + 1} tidak valid.` }, { status: 400 });
    }

    const unitPrice = Number(databaseProduct.price) + sizeAdjustment;
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return NextResponse.json(
        { error: `Harga produk ${product.name} belum tersedia untuk pemesanan.` },
        { status: 400 },
      );
    }
    validatedItems.push({
      id: randomBytes(8).toString('hex'),
      productId: product.id,
      productName: product.name,
      variantName: variant.name,
      sizeName: item.sizeName.trim(),
      customCharm: typeof item.customCharm === 'string' ? item.customCharm.slice(0, 100) : undefined,
      unitPrice,
      quantity,
      subtotal: unitPrice * quantity,
      customization: {
        bottleSize: item.sizeName.trim(),
        variantColor: variant.name,
        customCharm: typeof item.customCharm === 'string' ? item.customCharm.slice(0, 100) : undefined,
        customNotes: typeof item.customization?.customNotes === 'string'
          ? item.customization.customNotes.slice(0, 500)
          : undefined,
        customImageRefName: typeof item.customization?.customImageRefName === 'string'
          ? item.customization.customImageRefName.slice(0, 120)
          : undefined,
        customImageRefUrl,
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
    customerName: customer.full_name,
    customerEmail: typeof authData.user.email === 'string' ? authData.user.email : '',
    customerPhone: authData.user.phone,
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

  const { data, error } = await supabase
    .from('company_orders')
    .insert({
      id: order.id,
      reference_code: referenceCode,
      customer_id: customer.id,
      idempotency_key: payload.idempotencyKey,
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
