'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { Loader2 } from 'lucide-react';

import { Button } from '@repo/ui';

import { useAuthStore } from '@/stores/auth.store';

export function HeaderActions(): React.ReactElement {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex h-9 w-24 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Link href="/dashboard">
        <Button className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-shadow">
          Mở Ứng dụng
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Link href="/login">
        <Button variant="ghost" className="hidden sm:flex">
          Đăng nhập
        </Button>
      </Link>
      <Link href="/register">
        <Button className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-shadow">
          Dùng thử miễn phí
        </Button>
      </Link>
    </>
  );
}
