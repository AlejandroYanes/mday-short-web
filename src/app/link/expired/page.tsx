import Image from 'next/image';

import { AppBanner } from 'ui';

export default function LinkExpiredPage() {
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
              src="/illustrations/surreal-hourglass.svg"
              className="w-[300px] h-[340px]"
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
