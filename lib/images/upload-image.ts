import { supabase } from '@/lib/supabase/client';

export async function uploadImage(file: File, purpose: 'crew' | 'catalog' = 'crew'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  const headers: Record<string, string> = {};
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error('Sesi crew gagal diperiksa.');
  if (!data.session?.access_token) throw new Error('Silakan masuk ke akun crew terlebih dahulu.');
  headers.Authorization = `Bearer ${data.session.access_token}`;

  const response = await fetch('/api/images/upload', {
    method: 'POST',
    headers,
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Gambar gagal diunggah.');
  }
  if (typeof result.url !== 'string') {
    throw new Error('Server tidak mengembalikan tautan gambar.');
  }
  return result.url;
}
