import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

import { env } from 'env';
import type { DataSource, LinkEvent } from 'models/tiny-bird';
import { VISITOR_ID_COOKIE } from './cookies';

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
  slug: string;
  wslug?: string;
  domain?: string;
  payload?: {
    user_agent?: string;
    country?: string;
    city?: string;
    region?: string;
    device?: {
      type?: string;
      vendor?: string;
      model?: string;
    };
  };
}

export function sendTinyBirdLinkHitEvent(event: LinkEventData) {
  const visitorCookie = cookies().get(VISITOR_ID_COOKIE);
  const visitorId = visitorCookie?.value || nanoid();

  return sendTinyBirdEvent('link_events', {
    ...event,
    visitor_id: visitorId,
    time_stamp: new Date().toISOString(),
    payload: JSON.stringify(event.payload),
  });
}
