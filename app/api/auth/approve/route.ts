import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Gunakan pembaruan profiles yang dilindungi Supabase RLS.' },
    { status: 410 }
  );
}
