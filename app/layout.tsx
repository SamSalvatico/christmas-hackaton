import type { Metadata } from 'next';
import { Playwrite_NO, Roboto } from 'next/font/google';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { Providers } from '@/components/providers';
import './globals.css';

const playwriteNO = Playwrite_NO({
  weight: ['100', '400'],
  display: 'swap',
  variable: '--font-christmas',
});

const roboto = Roboto({
  weight: ['100', '400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-card',
});

export const metadata: Metadata = {
  title: "Santa's Global Feast Finder",
  description: 'Discover Christmas traditions from around the world',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playwriteNO.variable} ${roboto.variable}`}>
      <body>
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}

