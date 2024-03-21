import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

import { MONDAY_APP_SESSION_COOKIE } from './cookies';
import { MondaySession } from '../models/session';

const secretKey = 'secret';
const key = new TextEncoder().encode(secretKey);

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

export async function initiateSession(workspace: number, user: number) {
  // Verify credentials && get the user

  const content = { user, workspace };

  // Create the session
  const expires = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)); // 7 days
  const sessionToken = await encrypt(content);

  // Save the session in a cookie
  cookies().set(MONDAY_APP_SESSION_COOKIE, sessionToken, { expires, httpOnly: true });
}

export async function resolveSession() {
  const sessionToken = cookies().get(MONDAY_APP_SESSION_COOKIE)?.value;
  if (!sessionToken) return null;
  return (await decrypt(sessionToken)) as MondaySession;
}

export async function updateSession(request: NextRequest) {
  const sessionToken = request.cookies.get(MONDAY_APP_SESSION_COOKIE)?.value;
  if (!sessionToken) return;

  // Refresh the session so it doesn't expire
  const session = await decrypt(sessionToken);
  const expires = new Date(Date.now() + (60 * 60 * 24 * 7 * 1000)); // 7 days
  const res = NextResponse.next();
  res.cookies.set({
    name: MONDAY_APP_SESSION_COOKIE,
    value: await encrypt(session),
    httpOnly: true,
    expires,
  });
  return res;
}
