'use client';

import { useState } from 'react';

import { api } from 'trpc/react';
import { formatDate } from 'utils/dates';
import { useDebounce } from 'utils/hooks/use-debounce';
import {
  Input,
  Pagination,
  RenderIf,
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
import type { MondaySession } from 'models/session';
import NewLink from './new-link';
import EditLink from './edit-link';
import DeleteLink from './delete-link';

interface Props {
  session: MondaySession;
}

export default function LinksTable(props: Props) {
  const { session } = props;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const { debounceCall } = useDebounce(250);

  const { data: { results, count } = { results: [], count: 0 }, refetch } = api.link.list.useQuery(
    { page, pageSize, wslug: filter, search: query },
    { keepPreviousData: true },
  );

  const { data: workspaces = [] } = api.workspaces.list.useQuery();

  const handleSearch = (value: string) => {
    debounceCall(() => setQuery(value));
  }

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-row gap-4">
          <Select onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[260px]">
              <SelectValue>Workspace: {filter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="dland">Devland</SelectItem>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.slug}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search"
            className="w-[280px]"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <NewLink onSuccess={refetch} />
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
                <RenderIf condition={filter === session.wslug}>
                  <div className="flex items-center justify-center gap-2">
                    <EditLink link={link} onSuccess={refetch}/>
                    <DeleteLink link={link} onSuccess={refetch}/>
                  </div>
                </RenderIf>
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
