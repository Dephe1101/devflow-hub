'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

import { Button } from '@repo/ui';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { FeaturesBento, Hero3DScene } from '@/features/marketing';

export default function MarketingPage(): React.ReactElement {
  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex flex-col items-center justify-center">
        {/* 3D Background */}
        <Hero3DScene />

        {/* Content Overlay */}
        <div className="container z-10 px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Tái định nghĩa luồng công việc Lập trình</span>
          </motion.div>

          <SlideUp duration={0.6} delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Làm chủ Luồng công việc.
              <br />
              <span className="text-primary">Chỉ với Một Cú Click.</span>
            </h1>
          </SlideUp>

          <SlideUp duration={0.6} delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Chấm dứt thảm họa &quot;tab-hell&quot; và mất tập trung. Tổ chức công cụ, dự án và tài
              nguyên của bạn vào các Workspaces thông minh. Khởi chạy tất cả tức thì chỉ bằng một cú
              click.
            </p>
          </SlideUp>

          <SlideUp
            duration={0.6}
            delay={0.3}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105"
              >
                Bắt đầu miễn phí <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base h-12 px-8 bg-background/50 backdrop-blur-md border-border/50 hover:bg-muted/50"
              >
                Khám phá Tính năng
              </Button>
            </Link>
          </SlideUp>
        </div>

        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Problem vs Solution Section */}
      <section className="w-full py-24 bg-background">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Vấn đề của sự Phân tâm (Context Switching)
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Các lập trình viên mất 20% thời gian mỗi ngày chỉ để tìm kiếm link, mở các app dự án
              và lấy lại mạch tập trung. DevFlow Hub sẽ loại bỏ hoàn toàn sự ma sát này.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="w-full py-12 pb-32 relative">
        <div className="absolute inset-0 bg-secondary/30 skew-y-3 -z-10" />
        <div className="container px-4 mx-auto mb-16 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Mọi thứ bạn cần.
              <br />
              Không có gì dư thừa.
            </h2>
          </FadeIn>
        </div>
        <FeaturesBento />
      </section>

      {/* Architecture Showcase (Phase 2 Teaser) */}
      <section id="architecture" className="w-full py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        <div className="container px-4 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-500 font-medium text-sm">
                  <Terminal className="w-4 h-4" /> Sắp ra mắt ở Phase 2
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  Sức mạnh từ Tauri & Rust
                </h2>
                <p className="text-lg text-muted-foreground">
                  Trong khi Phase 1 làm chủ các đường dẫn Web, Phase 2 mang tới một Desktop Agent
                  siêu nhẹ. Nó kết nối Web Dashboard với thẳng hệ điều hành của bạn.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Mở trực tiếp VSCode, IntelliJ
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Mở Figma desktop, Slack, Discord
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Thực thi các lệnh Shell tùy biến
                  </li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="relative">
              <div className="aspect-square rounded-full bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl absolute inset-0 animate-pulse" />
              <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 shadow-2xl">
                <div className="flex flex-col gap-6">
                  <div className="p-4 rounded-xl bg-background border border-border/50 flex items-center justify-between">
                    <span className="font-mono text-sm">Web Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-primary">
                    <span className="font-mono text-sm">DevFlow App URI Protocol</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border/50 flex items-center justify-between">
                    <span className="font-mono text-sm">Tauri Desktop Agent</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-center font-mono text-xs">
                      VSCode
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-center font-mono text-xs">
                      Shell Script
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container px-4 max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Bạn đã sẵn sàng bước vào Flow State?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Gia nhập cùng các lập trình viên đã lấy lại được sự tập trung và hiệu suất.
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-transform hover:scale-105"
              >
                Bắt đầu dùng DevFlow Hub
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
