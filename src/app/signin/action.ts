'use server'
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { env } from 'env';

export async function signin(formData: FormData) {
  const password = formData.get('password');
  const isPasswordValid = password === env.PLATFORM_PASSWORD;

  if (!isPasswordValid) {
    return { success: false, message: 'Invalid password' };
  }
  cookies().set('mls_authenticated', 'true');
  redirect('/dashboard');
}
