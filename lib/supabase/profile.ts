import { AccountStatus, UserProfile, UserRole } from '@/lib/types';

export interface SupabaseProfileRow {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  division: string | null;
  position: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function mapSupabaseProfile(profile: SupabaseProfileRow): UserProfile {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role,
    status: profile.status,
    division: profile.division || undefined,
    position: profile.position || undefined,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}
