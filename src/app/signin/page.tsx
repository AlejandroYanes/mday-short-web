import { Button, InputWithLabel } from 'ui';
import { signin } from './action';

export default function SignInPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16 h-screen">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-red-500 mr-4">Monday.com </span>
          <span className="text-amber-500 mr-4">Link </span>
          <span className="text-emerald-500">Shortener</span>
        </h1>
        <form action={signin}>
          <section className="flex flex-col gap-10 w-[380px]">
            <InputWithLabel name="password" label="Password" type="password"/>
            <Button variant="black" type="submit">Sign In</Button>
          </section>
        </form>
      </main>
    </section>
  );
}
