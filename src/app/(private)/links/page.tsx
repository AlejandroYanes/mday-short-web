import LinksTable from './_components/links-table';
import TokenButton from './_components/token-button';

export default function LinksPage() {
  return (
    <section className="flex flex-col gap-10 w-[1200px] pt-10 mx-auto">
      <div className="flex justify-end mb-6">
        <TokenButton/>
      </div>
      <LinksTable/>
    </section>
  );
}
