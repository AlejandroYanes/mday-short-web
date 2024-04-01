'use client';
import { useState } from 'react';

import { api } from 'trpc/react';
import { formatDate } from 'utils/dates';
import { useDebounce } from 'utils/hooks/use-debounce';
import { Input, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui';

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [query, setQuery] = useState('');

  const { debounceCall } = useDebounce(250);

  const { data: { results, count } = { results: [], count: 0 } } = api.users.list.useQuery(
    { query, page, pageSize },
    { keepPreviousData: true },
  );

  const handleSearch = (value: string) => {
    debounceCall(() => setQuery(value));
  }

  return (
    <>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search"
          className="w-[280px]"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead style={{ width: '170px' }}>Workspace</TableHead>
            <TableHead className="text-center" style={{ width: '150px' }}>Joined On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {user.name ?? 'Anonymous'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {user.email ?? 'no email'}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                {user.workspace}
              </TableCell>

              <TableCell className="text-center">{formatDate(user.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between py-6 sticky bottom-0 bg-background">
        <span className="text-sm font-medium">{`Total: ${count}`}</span>
        <Pagination
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          total={count}
        />
      </div>
    </>
  );
}
