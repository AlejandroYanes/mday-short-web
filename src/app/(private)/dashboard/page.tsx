import { AppBanner } from 'ui';
import LinksTable from './_components/links-table';

export default function DashboardPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center gap-12 px-4 py-16">
        <AppBanner />
        <section className="flex flex-col gap-10 w-[1024px]">
          <h2 className="text-3xl">Links</h2>
          <LinksTable />
        </section>
      </main>
    </section>
  );
}
