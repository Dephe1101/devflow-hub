'use client';

import Link from 'next/link';

import { AlertCircle, ArrowRight, Layers, Sparkles } from 'lucide-react';

import { Button } from '@repo/ui';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { AppMockup, DistractionVisual, FeaturesBento } from '@/features/marketing';
import { useAuthStore } from '@/stores/auth.store';

export default function MarketingPage(): React.ReactElement {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="flex flex-col items-center w-full min-h-screen relative overflow-hidden bg-background">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 dark:from-primary/5 to-transparent -z-10" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-primary/20 dark:bg-primary/10 blur-[150px] -z-10" />

      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-20 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="container px-4 flex flex-col items-center text-center">
          <SlideUp duration={0.6} delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Tái định nghĩa Không gian làm việc</span>
            </div>
          </SlideUp>

          <SlideUp duration={0.6} delay={0.2}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">
                Làm chủ Luồng công việc.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary">
                Chỉ với Một Cú Click.
              </span>
            </h1>
          </SlideUp>

          <SlideUp duration={0.6} delay={0.3}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Chấm dứt thảm họa &quot;tab-hell&quot; và sự mất tập trung. Tổ chức công cụ, dự án và
              tài nguyên của bạn vào các Workspaces thông minh.
            </p>
          </SlideUp>

          <SlideUp
            duration={0.6}
            delay={0.4}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                size="lg"
                className="group w-full sm:w-auto text-base h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105"
              >
                {isAuthenticated ? 'Mở Ứng dụng' : 'Bắt đầu dùng thử miễn phí'}{' '}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </SlideUp>

          <SlideUp duration={0.8} delay={0.5} className="w-full relative z-10">
            <AppMockup />
          </SlideUp>
        </div>
      </section>

      {/* Problem Section */}
      <section className="w-full py-32 flex items-center justify-center relative border-t border-border/30 dark:border-border/10 bg-muted/20 dark:bg-black/10 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-destructive/5 to-transparent -z-10" />

        <div className="container px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="flex flex-col items-start text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mb-6 ring-1 ring-destructive/20 shadow-lg dark:shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-heading tracking-tight mb-6 text-foreground">
                  Vấn đề của sự <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-orange-500">
                    Phân tâm
                  </span>
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  Các nghiên cứu chỉ ra rằng chúng ta mất{' '}
                  <strong className="text-foreground">20% thời gian</strong> mỗi ngày chỉ để tìm
                  kiếm link, tài liệu, mở các app dự án và cố gắng lấy lại mạch tập trung.
                </p>

                <div className="inline-flex items-center gap-3 text-sm font-semibold text-foreground bg-background dark:bg-white/5 px-5 py-3 rounded-full border border-border shadow-sm">
                  <Layers className="w-5 h-5 text-orange-500" />
                  WorkFlow Hub loại bỏ hoàn toàn sự lãng phí thời gian này.
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <DistractionVisual />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section
        id="features"
        className="w-full py-32 flex flex-col items-center justify-center relative bg-background"
      >
        <div className="container px-4 mx-auto mb-16 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-4 text-foreground">
              Mọi thứ bạn cần. Không có gì dư thừa.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Được thiết kế để giữ bạn luôn ở trong trạng thái Flow.
            </p>
          </FadeIn>
        </div>
        <div className="w-full relative z-10">
          <FeaturesBento />
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-32 flex items-center justify-center relative overflow-hidden border-t border-border/30 bg-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)] -z-10" />
        <div className="container px-4 max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-6 text-foreground">
              Sẵn sàng bước vào Flow State?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Gia nhập cùng hàng ngàn người dùng đã lấy lại được sự tập trung và hiệu suất.
            </p>
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                size="lg"
                className="h-16 px-12 text-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-transform hover:scale-105"
              >
                {isAuthenticated ? 'Mở WorkFlow Hub Ngay' : 'Bắt đầu dùng thử ngay'}
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
