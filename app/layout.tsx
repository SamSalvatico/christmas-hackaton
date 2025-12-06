import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}

