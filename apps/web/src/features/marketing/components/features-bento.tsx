'use client';

import { motion } from 'framer-motion';
import { GripVertical, Layers, Link2, MonitorSmartphone, Rocket, Settings } from 'lucide-react';

const features = [
  {
    title: 'Khởi chạy 1 Click',
    description:
      'Mở đồng loạt 15+ tabs và ứng dụng native. Tích hợp sẵn cơ chế chống spam và chống giật lag (throttling).',
    icon: <Rocket className="w-6 h-6 text-emerald-500" />,
    colSpan: 'md:col-span-2',
    delay: 0.1,
    gradient: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    title: 'Workspaces Theo Mạch',
    description: 'Nhóm các công cụ theo ngữ cảnh dự án. Không bao giờ thất lạc link nữa.',
    icon: <Layers className="w-6 h-6 text-blue-500" />,
    colSpan: 'md:col-span-1',
    delay: 0.2,
    gradient: 'from-blue-500/10 to-cyan-500/10',
  },
  {
    title: 'Kéo Thả Trực Quan',
    description: 'Sắp xếp luồng công việc bằng thao tác kéo thả cực kỳ dễ dàng.',
    icon: <GripVertical className="w-6 h-6 text-purple-500" />,
    colSpan: 'md:col-span-1',
    delay: 0.3,
    gradient: 'from-purple-500/10 to-fuchsia-500/10',
  },
  {
    title: 'Desktop Agent (Phase 2)',
    description:
      'Khởi chạy các ứng dụng hệ điều hành như VSCode, Slack và Docker qua engine Tauri.',
    icon: <MonitorSmartphone className="w-6 h-6 text-amber-500" />,
    colSpan: 'md:col-span-2',
    delay: 0.4,
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
  {
    title: 'Liên Kết Đa Năng',
    description: 'Hỗ trợ Web URLs, Local Paths, App URIs, và Shell Commands.',
    icon: <Link2 className="w-6 h-6 text-rose-500" />,
    colSpan: 'md:col-span-2',
    delay: 0.5,
    gradient: 'from-rose-500/10 to-pink-500/10',
  },
  {
    title: 'Ưu Tiên Lưu Nội Bộ (Local First)',
    description:
      'Cấu hình của bạn được bảo mật tuyệt đối và thực thi trực tiếp ngay trên máy tính của bạn.',
    icon: <Settings className="w-6 h-6 text-slate-500" />,
    colSpan: 'md:col-span-1',
    delay: 0.6,
    gradient: 'from-slate-500/10 to-gray-500/10',
  },
];

export function FeaturesBento(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: feature.delay }}
          className={`
            relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 shadow-sm 
            transition-all hover:shadow-md hover:border-primary/30 group
            ${feature.colSpan}
          `}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border/50 shadow-sm">
              {feature.icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
