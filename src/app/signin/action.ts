'use server'
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { env } from 'env';
import { MONDAY_WEB_SESSION_COOKIE } from 'utils/cookies';

export async function signin(formData: FormData) {
  const password = formData.get('password');
  const isPasswordValid = password === env.PLATFORM_PASSWORD;

  if (!isPasswordValid) {
    return { success: false, message: 'Invalid password' };
  }
  cookies().set(MONDAY_WEB_SESSION_COOKIE, 'true');
  redirect('/dashboard');
}
