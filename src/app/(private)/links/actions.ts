'use server'
import { signJWT, resolveSessionFromCookies } from 'utils/auth';

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
export async function resolveToken() {
  const session = await resolveSessionFromCookies();

  if (!session) {
    return null;
  }

  return signJWT(fakeToken);
}
