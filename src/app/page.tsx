/* eslint-disable max-len */
import Link from 'next/link';

import { AppBanner, Button } from 'ui';

function NumberedStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex flex-col mb-10">
      <span className="text-xl font-bold">{number}.{' '}{title}</span>
      <div className="h-0.5 w-8 bg-slate-900 dark:bg-neutral-100" />
      <p className="text-base mt-4">{description}</p>
    </div>
  );
}

export default async function Home() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16 h-screen">
        <AppBanner />
        <section data-el="how-it-works" className="flex flex-col max-w-[700px] mx-auto pr-4">
          <NumberedStep
            number={1}
            title="Nice readable links"
            description="Create links that are easy to read and remember from within monday.com. No more long and confusing URLs."
          />
          <NumberedStep
            number={2}
            title="Monitor your links"
            description="Keep track of your links and see how many times they have been clicked."
          />
          <NumberedStep
            number={3}
            title="Lots of customization"
            description="Customize your links with your own domain. Add time limits and passwords to your links."
          />
        </section>

        <section className="flex flex-col items-center justify-center gap-10">
          <a
            href="https://auth.monday.com/oauth2/authorize?client_id=514781cd0f0fc5309eb59f13577cb981&response_type=install"
          >
            <img
              alt="Add to monday.com"
              height="40"
              className="h-[40px]"
              src="https://dapulse-res.cloudinary.com/image/upload/f_auto,q_auto/remote_mondaycom_static/uploads/Tal/4b5d9548-0598-436e-a5b6-9bc5f29ee1d9_Group12441.png"
            />
          </a>
          <div className="flex flex-row items-center gap-4 w-full">
            <div className="h-[1px] flex-1 bg-neutral-200" />
            <p>Or check out our other pages</p>
            <div className="h-[1px] flex-1 bg-neutral-200" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="outline-ghost">Pricing</Button>
            </Link>
            <Link href="/terms-of-service">
              <Button variant="outline-ghost">Terms of Service</Button>
            </Link>
            <Link href="/privacy-policy">
              <Button variant="outline-ghost">Privacy Policy</Button>
            </Link>
          </div>
        </section>
      </main>
    </section>
  );
}
