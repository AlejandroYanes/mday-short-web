import { AppBanner, Button } from 'ui';

export default function PricingPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16 h-screen">
        <AppBanner/>
        <section className="flex flex-col items-center gap-6 max-w-[700px]">
          <h2 className="text-3xl">Pricing</h2>
          <p className="text-center">
            We are currently in beta and all features are free. We will be introducing paid plans soon.
            <br/>
            Please let us know if you have any feedback or feature requests.
          </p>
          <a href="mailto:contact@mndy.link">
            <Button variant="outline-ghost">
              Contact Us
            </Button>
          </a>
        </section>
      </main>
    </section>
  );
};
