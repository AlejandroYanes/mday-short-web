export interface ShortLink {
  id: string;
  url: string;
  slug: string;
  password: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export type NewShortLink = Omit<ShortLink, 'id' | 'createdAt'>;
