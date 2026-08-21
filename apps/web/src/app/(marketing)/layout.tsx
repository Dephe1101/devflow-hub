import Link from 'next/link';

import { Rocket } from 'lucide-react';

import { Button } from '@repo/ui';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">DevFlow Hub</span>
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

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 py-12 bg-card/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">DevFlow Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Được tạo ra với ❤️ dành cho các lập trình viên quý trọng thời gian.
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
