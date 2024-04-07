'use server'
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

import { env } from 'env';
import { MONDAY_WEB_SESSION_COOKIE } from 'utils/cookies';
import { encryptMessage, initiateSession } from 'utils/auth';

export async function signin(formData: FormData) {
  const password = formData.get('password');
  const isPasswordValid = password === env.PLATFORM_PASSWORD;

  if (!isPasswordValid) {
    redirect('/signin?error=invalid');
  }

  const query = await sql<{ userId: number; workspaceId: number; wslug: string; role: string }>`
    SELECT U.id as "userId", W.id as "workspaceId", W.slug as wslug, UIW.role as role
    FROM "User" U INNER JOIN "UserInWorkspace" UIW on U.id = UIW."userId" INNER JOIN "Workspace" W on UIW."workspaceId" = W.mid
    WHERE U.name = ${await encryptMessage('devland')};
  `;

  if (!query.rowCount) {
    redirect('/signin?error=not-found');
  }

  const { userId, workspaceId, wslug, role } = query.rows[0]!;

  const sessionToken = await initiateSession({
    user: userId,
    workspace: workspaceId,
    wslug,
    role,
  });

  console.log('sessionToken:', sessionToken);

  cookies().set(MONDAY_WEB_SESSION_COOKIE, sessionToken);
  redirect('/links');
}
