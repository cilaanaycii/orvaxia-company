'use client';

import { useState } from 'react';
import { ImagePlus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useCompanyStore } from '@/lib/store/company-store';
import { uploadImage } from '@/lib/images/upload-image';

export function TeamProfileManager() {
  const { currentUser, teamMembers, updateTeamMember } = useCompanyStore();
  const [selectedId, setSelectedId] = useState(teamMembers[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const member = teamMembers.find((item) => item.id === selectedId);

  if (currentUser?.role !== 'owner') {
    return <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Hanya Owner yang dapat mengelola profil direktori publik.</p>;
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Pilih JPG, PNG, atau WEBP maksimal 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const avatarUrl = await uploadImage(file);
      if (!member || !(await updateTeamMember(member.id, { avatarUrl }))) {
        toast.error('Foto terunggah, tetapi profil belum berhasil diperbarui.');
        return;
      }
      toast.success('Foto profil anggota diperbarui.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Foto gagal diunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!member) return;

    const formData = new FormData(event.currentTarget);
    const instagramInput = String(formData.get('instagramUrl') || '').trim();
    if (instagramInput) {
      try {
        const url = new URL(instagramInput);
        if (url.protocol !== 'https:' || !['www.instagram.com', 'instagram.com'].includes(url.hostname)) {
          toast.error('Masukkan URL HTTPS profil Instagram yang valid.');
          return;
        }
      } catch {
        toast.error('Masukkan URL HTTPS profil Instagram yang valid.');
        return;
      }
    }

    await updateTeamMember(member.id, {
      name: String(formData.get('name') || '').trim(),
      position: String(formData.get('position') || '').trim(),
      division: String(formData.get('division') || '').trim(),
      className: String(formData.get('className') || '').trim() || undefined,
      instagramUrl: instagramInput || undefined,
      bio: String(formData.get('bio') || '').trim(),
      status: formData.get('status') === 'active' ? 'Aktif' : 'Non-aktif',
      profileVisible: formData.get('profileVisible') === 'on',
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <h3 className="font-serif text-2xl font-bold text-brand-navy">Member Directory</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Edit profil publik tanpa mengubah UUID atau akun autentikasi anggota.
        </p>
      </div>

      {teamMembers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">Data roster belum tersedia.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(14rem,0.7fr)_1.3fr]">
          <div>
            <label htmlFor="team-member-select" className="mb-2 block text-xs font-semibold text-slate-700">Pilih anggota</label>
            <select
              id="team-member-select"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-brand-navy focus:border-brand-slate focus:outline-none"
            >
              {teamMembers.map((item) => (
                <option key={item.id} value={item.id}>{item.name} — {item.division}</option>
              ))}
            </select>
            <div className="mt-4 rounded-2xl bg-brand-surface p-4 text-xs leading-5 text-slate-600">
              Member ID: <code className="break-all">{member?.id || '-'}</code>
            </div>
          </div>

          {member && (
            <form key={member.id} onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">
                Nama lengkap
                <input name="name" required defaultValue={member.name} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Jabatan
                <input name="position" required defaultValue={member.position} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Divisi
                <input name="division" required defaultValue={member.division} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Kelas
                <input name="className" defaultValue={member.className || ''} placeholder="Belum tersedia" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                Instagram URL
                <input name="instagramUrl" type="url" defaultValue={member.instagramUrl || ''} placeholder="https://www.instagram.com/username/" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                Deskripsi singkat
                <textarea name="bio" rows={3} defaultValue={member.bio} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input name="status" type="checkbox" value="active" defaultChecked={member.status === 'Aktif'} className="accent-brand-slate" />
                  Keanggotaan aktif
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input name="profileVisible" type="checkbox" defaultChecked={member.profileVisible !== false} className="accent-brand-slate" />
                  Tampilkan di direktori publik
                </label>
              </div>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-brand-slate hover:border-brand-slate ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                  <ImagePlus size={15} /> {isUploading ? 'Mengunggah...' : 'Unggah foto'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handlePhotoUpload(event)} className="sr-only" />
                </label>
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-slate">
                  <Save size={14} /> Simpan profil
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
