import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, role, division, position, approvedBy } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Data persetujuan tidak lengkap' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${userId} telah disetujui dengan peran ${role}`,
      approvedAt: new Date().toISOString(),
      role,
      division,
      position,
    });
  } catch {
    return NextResponse.json({ error: 'Gagal memproses persetujuan akun' }, { status: 500 });
  }
}
