import Image from 'next/image';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { KEBAB_CASE_REGEX } from 'utils/strings';
import { EXCLUDED_DOMAINS } from 'utils/domains';
import { AppBanner, Input } from 'ui';
import { validatePassword } from './action';

interface Props {
  searchParams: {
    wslug?: string;
    slug?: string;
    access?: string;
  };
}

const validator = z.object({
  wslug: z.string().min(1).regex(KEBAB_CASE_REGEX),
  slug: z.string().min(1).regex(KEBAB_CASE_REGEX),
});

const customDomainValidator = z.object({
  slug: z.string().min(1).regex(KEBAB_CASE_REGEX),
});

function resolveCustomDomain() {
  const host = headers().get('host');
  if (!host) return;

  if (host.includes(':')) {
    return host.split(':')[0];
  }

  return !EXCLUDED_DOMAINS.includes(host) ? host : undefined;
}

export default function AccessCheckPage(props: Props) {
  const { searchParams } = props;
  const { wslug, slug, access } = searchParams;
  const customDomain = resolveCustomDomain();

  if (customDomain && !slug) {
    redirect('/link/not-found');
  } else if (!wslug || !slug) {
    redirect('/link/not-found');
  }

  const input = (customDomain ? customDomainValidator :validator).safeParse(searchParams);

  if (!input.success) {
    redirect('/link/not-found');
  }

  return (
    <section className="min-h-screen flex flex-col justify-center items-center">
      <main className="container flex flex-col items-center px-4 py-4">
        <AppBanner />
        <section className="flex flex-col items-center justify-center">
          <div className="rounded-full w-[300px] h-[340px] bg-white">
            <Image
              width={300}
              height={340}
              alt="welcoming illustration"
              src="/illustrations/cute-dog.svg"
              className="w-[300px] h-[340px]"
              priority
            />
          </div>
          <form action={validatePassword}>
            <div className="mt-4 flex flex-col items-center w-[400px]">
              <h2 className="text-3xl text-center mb-1">Almost there</h2>
              <p className="text-base">
                Please enter the password to access this link.
              </p>
              <div className="flex flex-col gap-3 w-full mt-4">
                <input name="domain" type="hidden" value={customDomain}/>
                <input name="wslug" type="hidden" value={wslug}/>
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
