'use client';

import { useState } from 'react';

import { api } from 'trpc/react';
import { formatDate } from 'utils/dates';
import { useDebounce } from 'utils/hooks/use-debounce';
import {
  Input,
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
import NewLink from './new-link';
import EditLink from './edit-link';
import DeleteLink from './delete-link';

type Filter = 'mine' | 'all';

export default function LinksTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { debounceCall } = useDebounce(250);

  const { data: { results, count, wslug } = { results: [], count: 0 }, refetch } = api.link.list.useQuery(
    { query, page, pageSize },
    { keepPreviousData: true },
  );

  const handleSearch = (value: string) => {
    debounceCall(() => setQuery(value));
  }

  const handleFilterChange = (value: string) => {
    setFilter(value as Filter);
    setPage(1);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search"
          className="w-[280px]"
          onChange={(e) => handleSearch(e.target.value)}
        />
        <span className="ml-10">{wslug}</span>
        <div className="flex flex-row ml-auto gap-4">
          <Select onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue className="capitalize">Filter: {filter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="mine">Mine</SelectItem>
            </SelectContent>
          </Select>
          <NewLink onSuccess={refetch} />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead style={{ width: '170px' }}>Short name</TableHead>
            <TableHead className="text-center" style={{ width: '150px' }}>Password</TableHead>
            <TableHead className="text-center" style={{ width: '150px' }}>Expires On</TableHead>
            <TableHead className="text-center" style={{ width: '80px' }}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((link) => (
            <TableRow key={link.id}>
              <TableCell>
                {link.url}
              </TableCell>

              <TableCell>
                <a href={`/${link.wslug}/${link.slug}`} target="_blank" rel="noreferrer">
                  <span className="hover:text-emerald-500 underline">
                    {link.slug}
                  </span>
                </a>
              </TableCell>

              <TableCell className="text-center">{link.password || '-'}</TableCell>

              <TableCell className="text-center">{link.expiresAt ? formatDate(link.expiresAt) : '-'}</TableCell>

              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <EditLink link={link} onSuccess={refetch} />
                  <DeleteLink link={link} onSuccess={refetch} />
                </div>
              </TableCell>
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
