import Image from 'next/image';
import { redirect } from 'next/navigation';

import { AppBanner, Input } from 'ui';
import { validatePassword } from './action';

interface Props {
  searchParams: {
    slug?: string;
    access?: string;
  };
}

export default function AccessCheckPage(props: Props) {
  const { searchParams } = props;
  const { slug, access } = searchParams;

  if (!slug) {
    redirect('/link/not-found');
  }

  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center gap-12 px-4 py-16">
        <AppBanner />
        <section className="flex flex-col items-center justify-center">
          <div className="rounded-full w-[380px] h-[400px] bg-white">
            <Image
              width={380}
              height={400}
              alt="welcoming illustration"
              src="/illustrations/cute-dog.svg"
              className="w-[380px] h-[400px]"
              priority
            />
          </div>
          <form action={validatePassword}>
            <div className="mt-10 flex flex-col items-center w-[400px]">
              <h2 className="text-3xl text-center mb-1">Almost there</h2>
              <p className="text-base">
                Please enter the password to access this link.
              </p>
              <div className="flex flex-col gap-3 w-full mt-4">
                <input name="slug" type="hidden" value={slug}/>
                <Input name="password" type="password" placeholder="Password" className="w-full" />
                {access === 'denied' ? <span>Error: this is not the correct password, please try again</span> : null}
              </div>
            </div>
          </form>
        </section>
      </main>
    </section>
  );
}
