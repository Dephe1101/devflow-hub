import Link from 'next/link';

import { Rocket } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { HeaderActions } from '@/features/marketing/components/header-actions';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">WorkFlow Hub</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <HeaderActions />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">{children}</main>

      <footer className="relative z-50 border-t border-border/40 py-12 bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">WorkFlow Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Được tạo ra với ❤️ dành cho những người đang loay hoay với việc tìm kiếm tài liệu.
          </p>
          <div className="flex gap-4">
            <Link
              href="https://github.com/Dephe1101/devflow-hub"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
