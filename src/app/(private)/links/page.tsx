import { resolveSessionFromCookies } from 'utils/auth';
import LinksTable from './_components/links-table';

export default async function LinksPage() {
  const session = await resolveSessionFromCookies();

  return (
    <section className="flex flex-col gap-10 w-[1200px] pt-10 mx-auto">
      <LinksTable session={session!}/>
    </section>
  );
}
