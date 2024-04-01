import { redirect } from 'next/navigation';

import { resolveSessionFromCookies } from 'utils/auth';
import Header from 'components/header';

interface Props {
  children: any;
}

export default async function PrivateLayout(props: Props) {
  const session = await resolveSessionFromCookies();

  if (!session) {
    redirect('/signin');
  }

  return (
    <section>
      <Header />
      <main>
        {props.children}
      </main>
    </section>
  );
}
