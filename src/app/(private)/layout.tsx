import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { MONDAY_WEB_SESSION_COOKIE } from 'utils/cookies';

interface Props {
  children: any;
}

export default function PrivateLayout(props: Props) {
  const authCookie = cookies().get(MONDAY_WEB_SESSION_COOKIE);

  if (!authCookie) {
    redirect('/signin');
  }

  return props.children;
}
