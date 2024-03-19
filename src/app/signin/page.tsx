import { AppBanner, Button, InputWithLabel } from 'ui';
import { signin } from './action';

export default function SignInPage() {
  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16 h-screen">
        <AppBanner />
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
