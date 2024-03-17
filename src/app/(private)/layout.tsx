import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface Props {
  children: any;
}

export default function PrivateLayout(props: Props) {
  const authCookie = cookies().get('mls_authenticated');

  if (!authCookie) {
    redirect('/signin');
  }

  return props.children;
}
