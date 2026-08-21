import Link from 'next/link';

import { Rocket } from 'lucide-react';

import { Button } from '@repo/ui';

import { ThemeToggle } from '@/components/theme-toggle';

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

          <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Tính năng
            </Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">
              Cách hoạt động
            </Link>
            <Link href="#architecture" className="hover:text-foreground transition-colors">
              Kiến trúc
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-shadow">
                Mở Ứng dụng
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">{children}</main>

      <footer className="relative z-50 border-t border-border/40 py-12 bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">DevFlow Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Được tạo ra với ❤️ dành cho các lập trình viên.
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
