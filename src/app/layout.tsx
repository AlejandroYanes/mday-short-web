import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';

import { TRPCReactProvider } from 'trpc/react';
import { ThemeProvider } from 'ui';
import 'styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Short Links for monday.com',
  description: 'Create short links for your monday.com boards and forms',
};

interface Props {
  children: any;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
