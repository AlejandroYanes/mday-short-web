import Image from 'next/image';

import { AppBanner } from 'ui';

export default function LinkExpiredPage() {
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
              src="/illustrations/surreal-hourglass.svg"
              className="w-[380px] h-[400px]"
              priority
            />
          </div>
          <div className="mt-10">
            <h2 className="text-3xl text-center mb-1">Link expired</h2>
            <p className="text-base">
              The link you are trying to access has expired. Please contact the link owner to get a new one.
            </p>
          </div>
        </section>
      </main>
    </section>
  );
}
