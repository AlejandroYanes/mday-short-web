import type { NextRequest } from 'next/server';

import { env } from 'env';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const response = await fetch('https://auth.monday.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
	      code,
        client_id: env.MONDAY_CLIENT_ID,
        client_secret: env.MONDAY_CLIENT_SECRET,
        redirect_uri: `${env.PLATFORM_URL}/api/oauth/callback/monday`,
      })
    });
    const data: { access_token: string; token_type: string; scope: string } = await response.json();

    const headers = new Headers();
    headers.append('Set-Cookie', `access_token=${data.access_token}`);
    headers.append('Set-Cookie', `token_type=${data.token_type}`);
    headers.append('Set-Cookie', `scope=${data.scope}`);

    return new Response(JSON.stringify(data), { headers });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
