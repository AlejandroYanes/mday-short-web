export interface ShortLink {
  id: number;
  url: string;
  slug: string;
  wslug: string;
  password: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export type NewShortLink = Omit<ShortLink, 'id' | 'createdAt' | 'wslug'>;
