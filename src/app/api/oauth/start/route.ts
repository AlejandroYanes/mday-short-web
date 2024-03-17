import { redirect } from 'next/navigation';

import { env } from 'env';

export async function GET() {
  try {
    const redirectUrl = `${env.PLATFORM_URL}/api/oauth/callback/monday`;
    redirect(`https://auth.monday.com/oauth2/authorize?client_id=${env.MONDAY_CLIENT_ID}&redirect_uri=${redirectUrl}`);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
