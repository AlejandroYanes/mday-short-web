import { AppBanner, Button, InputWithLabel } from 'ui';
import { signin } from './action';

interface Props {
  searchParams: {
    error?: string;
  };
}

export default function SignInPage(props: Props) {
  const { searchParams } = props;
  const { error } = searchParams;

  return (
    <section className="flex min-h-screen flex-col">
      <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16 h-screen">
        <AppBanner />
        <form action={signin}>
          <section className="flex flex-col gap-10 w-[380px]">
            <InputWithLabel name="password" label="Password" type="password"/>
            {error === 'invalid' ? <span>Invalid password</span> : null}
            {error === 'not-found' ? <span>Error: user not found</span> : null}
            <Button variant="black" type="submit">Sign In</Button>
          </section>
        </form>
      </main>
    </section>
  );
}
