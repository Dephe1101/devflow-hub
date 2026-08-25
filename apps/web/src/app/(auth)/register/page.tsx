'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2, UserPlus } from 'lucide-react';

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
import type { RegisterInput } from '@repo/validation';
import { registerSchema } from '@repo/validation';

import { SlideUp } from '@/components/animations/slide-up';
import { useAuthStore } from '@/stores/auth.store';

export default function RegisterPage(): React.ReactNode {
  const [error, setError] = useState('');

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const authRegister = useAuthStore((state) => state.register);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const router = useRouter();

  const onSubmit = async (data: RegisterInput): Promise<void> => {
    setError('');
    try {
      await authRegister(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Đăng ký thất bại';
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
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Tạo tài khoản</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Tham gia DevFlow Hub và quản lý workspace của bạn
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Họ và Tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...formRegister('name')}
                className="bg-background/50 focus-visible:ring-primary/50"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...formRegister('email')}
                className="bg-background/50 focus-visible:ring-primary/50"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...formRegister('password')}
                className="bg-background/50 focus-visible:ring-primary/50"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
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
                  Đang tạo tài khoản...
                </>
              ) : (
                'Đăng ký'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </SlideUp>
  );
}
