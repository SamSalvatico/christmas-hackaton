import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'Christmas Hackathon App',
  description: 'SSR Web Application with AI Integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}

