import { env } from 'env';
import type { DataSource, LinkEvent } from 'models/tiny-bird';

const TINY_BIRD_URL = 'https://api.tinybird.co/v0/events';

export async function sendTinyBirdEvent(event: DataSource, data: any) {
  return fetch(`${TINY_BIRD_URL}?name=${event}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.TINY_BIRD_TOKEN}`
    },
    body: JSON.stringify(data),
  });
}

export interface LinkEventData {
  event: LinkEvent;
  visitor_id: string;
  slug: string;
  wslug?: string;
  domain?: string;
  user_agent: string | null;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  device?: {
    type?: string;
    vendor?: string;
    model?: string;
  };
}

export function sendTinyBirdLinkHitEvent(event: LinkEventData) {
  return sendTinyBirdEvent('link_events', {
    ...event,
    timestamp: new Date().toISOString(),
    location: JSON.stringify(event.location),
    device: JSON.stringify(event.device),
  });
}
