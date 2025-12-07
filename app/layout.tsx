import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { Providers } from '@/components/providers';
import './globals.css';

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
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}

