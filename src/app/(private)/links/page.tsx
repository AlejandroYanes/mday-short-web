import { resolveSessionFromCookies } from 'utils/auth';
import LinksTable from './_components/links-table';

export default async function LinksPage() {
  const session = await resolveSessionFromCookies();

  return (
    <section className="flex flex-col gap-10 max-w-[1280px] px-6 pt-10 mx-auto">
      <LinksTable session={session!}/>
    </section>
  );
}
