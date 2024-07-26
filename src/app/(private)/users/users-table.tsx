'use client';
import { useState } from 'react';

import { api } from 'trpc/react';
import { formatDate } from 'utils/dates';
import {
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from 'ui';

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filter, setFilter] = useState<string>('all');

  const { data: { results, count } = { results: [], count: 0 } } = api.users.list.useQuery(
    { page, pageSize, wslug: filter },
    { keepPreviousData: true },
  );

  const { data: workspaces = [] } = api.workspaces.list.useQuery();

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex items-center mb-4 gap-4">
        <Select onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[260px]">
            <SelectValue>{`Workspace: ${filter}`}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[400px]">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="dland">Devland</SelectItem>
            {workspaces.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.slug}>
                {workspace.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Workspace</TableHead>
            <TableHead className="text-center">Joined On</TableHead>
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
