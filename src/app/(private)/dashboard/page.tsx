import { AppBanner } from 'ui';
import LinksTable from './_components/links-table';
import TokenButton from './_components/token-button';

export default function DashboardPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center gap-12 px-4 py-16">
        <AppBanner />
        <section className="flex flex-col gap-10 w-[1200px]">
          <div className="flex justify-end mb-6">
            <TokenButton />
          </div>
          <LinksTable />
        </section>
      </main>
    </section>
  );
}
