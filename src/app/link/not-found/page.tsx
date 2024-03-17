import Image from 'next/image';

export default function LinkNotFoundPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-red-500 mr-4">Monday.com </span>
          <span className="text-amber-500 mr-4">Link </span>
          <span className="text-emerald-500">Shortener</span>
        </h1>
        <section className="flex flex-col items-center justify-center">
          <div className="rounded-full w-[380px] h-[400px] bg-white">
            <Image
              width={380}
              height={400}
              alt="welcoming illustration"
              src="/illustrations/question-mark.svg"
              className="w-[380px] h-[400px]"
              priority
            />
          </div>
          <div className="mt-10">
            <h2 className="text-3xl text-center mb-1">Link not found</h2>
            <p className="text-base">
              The link you are trying to access does not exist. Please check the URL and try again.
            </p>
          </div>
        </section>
      </main>
    </section>
  );
}
