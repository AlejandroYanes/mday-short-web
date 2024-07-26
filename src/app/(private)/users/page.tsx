import UsersTable from './users-table';

export default function UsersPage() {
  return (
    <section className="flex flex-col gap-10 max-w-[1280px] px-6 pt-10 mx-auto">
      <UsersTable/>
    </section>
  );
}
