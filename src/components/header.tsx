'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconUserCircle } from '@tabler/icons-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Logo,
} from 'ui';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="text-base font-medium flex flex-row items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold mr-10"
        >
          <Logo className="h-12 w-12"/>
        </Link>
        <Link
          href="/links"
          data-active={pathname === '/links'}
          className="text-muted-foreground data-[active=true]:text-foreground transition-colors hover:text-foreground"
        >
          Links
        </Link>
        <Link
          href="/users"
          data-active={pathname === '/users'}
          className="text-muted-foreground data-[active=true]:text-foreground transition-colors hover:text-foreground"
        >
          Users
        </Link>
      </nav>
      <div className="flex items-center gap-4 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <IconUserCircle className="h-5 w-5"/>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
