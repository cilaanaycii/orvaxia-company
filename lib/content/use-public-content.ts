'use client';

import { useEffect, useState } from 'react';

export interface PublicSiteContent {
  id: string;
  slug: string;
  category: 'home' | 'about' | 'contact' | 'shop' | 'announcement';
  title: string;
  body: string;
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
}

export function usePublicContent(category: PublicSiteContent['category']) {
  const [content, setContent] = useState<PublicSiteContent[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    void fetch(`/api/content?category=${encodeURIComponent(category)}`, { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Konten publik gagal dimuat.');
        return result.content as PublicSiteContent[];
      })
      .then((items) => {
        if (active) setContent(items);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Public site content failed to load', error);
        setLoadError(error instanceof Error ? error.message : 'Konten publik gagal dimuat.');
      });
    return () => {
      active = false;
    };
  }, [category]);

  return {
    content,
    loadError,
    bySlug: Object.fromEntries(content.map((item) => [item.slug, item])) as Record<string, PublicSiteContent>,
  };
}
