'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { Loader2, LogIn } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  toast,
} from '@repo/ui';

import { SlideUp } from '@/components/animations/slide-up';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage(): React.ReactNode {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Đăng nhập thất bại';
      if (axios.isAxiosError<{ message?: string }>(err)) {
        errorMessage = err.response?.data.message ?? errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <SlideUp duration={0.6}>
      <Card className="w-full bg-card/60 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Chào mừng trở lại</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Nhập thông tin đăng nhập để truy cập DevFlow Hub
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                }}
                className="bg-background/50 focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                }}
                className="bg-background/50 focus-visible:ring-primary/50"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Tạo mới ngay
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </SlideUp>
  );
}
