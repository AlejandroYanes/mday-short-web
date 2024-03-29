import { redirect } from 'next/navigation';

import { resolveSessionFromCookies } from 'utils/auth';

interface Props {
  children: any;
}

export default async function PrivateLayout(props: Props) {
  const session = await resolveSessionFromCookies();

  if (!session) {
    redirect('/signin');
  }

  return props.children;
}
