import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import Providers from '@/components/providers';

import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin', 'vietnamese'],
});

export const metadata: Metadata = {
  title: 'WorkFlow Hub - Tối ưu hóa luồng công việc',
  description: 'Nền tảng quản lý và tối ưu hóa luồng công việc số cho cá nhân và đội nhóm.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
