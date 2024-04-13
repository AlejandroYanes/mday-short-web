import { jwtVerify, SignJWT, CompactSign, compactVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { env } from 'env';
import type { MondaySession } from 'models/session';
import { MONDAY_WEB_SESSION_COOKIE } from './cookies';

const key = new TextEncoder().encode(env.MONDAY_CLIENT_SECRET);

export async function encryptMessage(message: string) {
  if (!message) return null;

  try {
    return new CompactSign(new TextEncoder().encode(message))
      .setProtectedHeader({ alg: 'HS256' })
      .sign(key);
  } catch (error) {
    console.error('❌ Error encrypting message:', error);
    return null;
  }
}

export async function decryptMessage(encrypted: string) {
  if (!encrypted) return null;

  try {
    const { payload } = await compactVerify(encrypted, key);
    return new TextDecoder().decode(payload);
  } catch (error) {
    console.error('❌ Error decrypting message:', error);
    return null;
  }
}

export async function signJWT(payload: any, expires: string = '7 days from now') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);
}

export async function openJWT(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('❌ Error decrypting token:', error);
    return null;
  }
}

export async function initiateSession(params: {  user: number; workspace: number; wslug: string; role: string }) {
  const expires = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)); // 7 days
  return await signJWT({ ...params, expires: expires.getTime() });
}

export async function resolveSession(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const sessionToken = authHeader.replace('Bearer ', '');

  return (await openJWT(sessionToken)) as MondaySession;
}

export async function resolveSessionFromCookies() {
  const sessionToken = cookies().get(MONDAY_WEB_SESSION_COOKIE);
  if (!sessionToken) return null;

  return (await openJWT(sessionToken.value)) as MondaySession;
}

export async function updateSession(req: NextRequest) {
  const sessionToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!sessionToken) return;

  // Refresh the session so it doesn't expire
  const session = await openJWT(sessionToken);
  const expires = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)); // 7 days
  const res = NextResponse.next();
  res.cookies.set({
    name: 'failed',
    value: await signJWT(session),
    httpOnly: true,
    sameSite: 'none',
    expires: expires.getTime(),
  });
  return res;
}
