import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import Script from 'next/script';

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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16550360967"
        />
        <Script id="google-analytics">
          {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'AW-16550360967');
          `}
        </Script>
      </head>
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
