import LinksTable from './_components/links-table';

export default function DashboardPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-red-500 mr-4">Monday.com </span>
          <span className="text-amber-500 mr-4">Link </span>
          <span className="text-emerald-500">Shortener</span>
        </h1>
        <section className="flex flex-col gap-10 w-[1024px]">
          <h2 className="text-3xl">Links</h2>
          <LinksTable />
        </section>
      </main>
    </section>
  );
}
