import type { NextRequest } from 'next/server';

import { signJWT } from 'utils/auth';

const fakeToken = {
  dat: {
    client_id: '1',
    user_id: 1,
    account_id: 1,
    slug: 'alejandroyanes94s-team',
    app_id: 1,
    app_version_id: 1,
    install_id: -2,
    is_admin: true,
    is_view_only: false,
    is_guest: false,
    user_kind: 'admin'
  },
  exp: 1,
};

export async function GET(req: NextRequest) {
  const isLocal = req.nextUrl.origin === 'http://localhost:3000';

  if (!isLocal) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
  }

  return new Response(await signJWT(fakeToken), { status: 200 });

}
