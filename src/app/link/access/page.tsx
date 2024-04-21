import Image from 'next/image';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { KEBAB_CASE_REGEX } from 'utils/strings';
import { EXCLUDED_DOMAINS } from 'utils/domains';
import { AppBanner, Input } from 'ui';
import { validatePassword } from './action';
import PasswordForm from './password-form';

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
  let host = headers().get('host');
  if (!host) return;

  if (host.includes(':')) {
    host = host.split(':')[0]!;
  }

  return !EXCLUDED_DOMAINS.includes(host) ? host : undefined;
}

export default function AccessCheckPage(props: Props) {
  const { searchParams } = props;
  const { wslug, slug } = searchParams;
  const customDomain = resolveCustomDomain();

  if (customDomain) {
    if (!slug) {
      redirect('/link/not-found');
    }
  } else if (!wslug || !slug) {
    redirect('/link/not-found');
  }

  const input = (customDomain ? customDomainValidator :validator).safeParse(searchParams);

  if (!input.success) {
    redirect('/link/not-found');
  }

  return (
    <section className="min-h-screen flex flex-col md:justify-center items-center">
      <main className="container flex flex-col items-center px-4 pb-8">
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
          <PasswordForm slug={slug} wslug={wslug} domain={customDomain} />
        </section>
      </main>
    </section>
  );
}
