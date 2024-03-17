import Monday from '../components/monday';

function NumberedStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex flex-col mb-10">
      <span className="text-xl font-bold">{number}.{' '}{title}</span>
      <div className="h-0.5 w-8 bg-slate-900" />
      <p className="text-base mt-4">{description}</p>
    </div>
  );
}

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-red-500">Monday.com </span>
          <span className="text-amber-500">Link </span>
          <span className="text-emerald-500">Shortener</span>
        </h1>
        <div className="grid grid-cols-2 gap-4">
          <section data-el="how-it-works" className="flex flex-col max-w-[700px] mx-auto pr-4">
            <NumberedStep
              number={1}
              title="Nice readable links"
              description="Create links that are easy to read and remember. No more long and confusing URLs."
            />
            <NumberedStep
              number={2}
              title="Monitor your links"
              description="Keep track of your links and see how many times they have been clicked."
            />
            <NumberedStep
              number={3}
              title="Lots of customization"
              description="
          Customize your links with your own domain. Add UTM parameters to track your campaigns.
          Add time limits to your links and much more.
          "
            />
          </section>
          <Monday/>
        </div>
      </div>
    </main>
  );
}
