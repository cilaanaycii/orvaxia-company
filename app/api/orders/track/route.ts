import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function hashPhone(phone: string) {
  const normalized = phone.replace(/\D/g, '');
  return createHash('sha256').update(normalized).digest();
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Pelacakan pesanan belum dikonfigurasi.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const referenceCode = searchParams.get('referenceCode')?.trim().toUpperCase();
  const phone = searchParams.get('phone')?.trim();
  if (!referenceCode || referenceCode.length > 40 || !phone || phone.length > 30) {
    return NextResponse.json({ error: 'Masukkan kode pesanan dan nomor WhatsApp.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: order, error } = await supabase
    .from('company_orders')
    .select('id,reference_code,phone_hash,order_status,tracking_number,created_at,updated_at')
    .eq('reference_code', referenceCode)
    .maybeSingle();

  if (error) {
    console.error('Customer order lookup failed', error);
    return NextResponse.json({ error: 'Pelacakan pesanan gagal. Coba lagi nanti.' }, { status: 500 });
  }

  const suppliedHash = hashPhone(phone);
  const storedHash = order?.phone_hash ? Buffer.from(order.phone_hash, 'hex') : Buffer.alloc(0);
  if (!order || storedHash.length !== suppliedHash.length || !timingSafeEqual(storedHash, suppliedHash)) {
    return NextResponse.json({ error: 'Kode pesanan atau nomor WhatsApp tidak cocok.' }, { status: 404 });
  }

  const { data: events, error: eventsError } = await supabase
    .from('company_order_events')
    .select('order_status,tracking_number,created_at')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true });

  if (eventsError) {
    console.error('Customer order history lookup failed', eventsError);
    return NextResponse.json({ error: 'Riwayat pesanan gagal dimuat.' }, { status: 500 });
  }

  return NextResponse.json({
    referenceCode: order.reference_code,
    status: order.order_status,
    trackingNumber: order.tracking_number,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    events: events || [],
  });
}
