// import "monday-ui-react-core/tokens";
// import "monday-ui-react-core/dist/main.css";
import 'styles/globals.css';

import { Inter } from 'next/font/google';

import { TRPCReactProvider } from 'trpc/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Monday Link Shortener',
  description: 'Create short links for your Monday.com boards and items',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
