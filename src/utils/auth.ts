import { jwtVerify, SignJWT } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { env } from 'env';
import type { MondaySession } from 'models/session';
import { MONDAY_WEB_SESSION_COOKIE } from './cookies';

const key = new TextEncoder().encode(env.MONDAY_CLIENT_SECRET);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7 days from now')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function initiateSession(params: {  user: number; workspace: number; wslug: string; role: string }) {
  const expires = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)); // 7 days
  return await encrypt({ ...params, expires });
}

export async function resolveSession(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const sessionToken = authHeader.replace('Bearer ', '');

  return (await decrypt(sessionToken)) as MondaySession;
}

export async function resolveSessionFromCookies() {
  const sessionToken = cookies().get(MONDAY_WEB_SESSION_COOKIE);
  if (!sessionToken) return null;

  return (await decrypt(sessionToken.value)) as MondaySession;
}

export async function updateSession(req: NextRequest) {
  const sessionToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!sessionToken) return;

  // Refresh the session so it doesn't expire
  const session = await decrypt(sessionToken);
  const expires = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)); // 7 days
  const res = NextResponse.next();
  res.cookies.set({
    name: 'failed',
    value: await encrypt(session),
    httpOnly: true,
    sameSite: 'none',
    expires,
  });
  return res;
}
