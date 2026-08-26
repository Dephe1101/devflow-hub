'use client';

import React, { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import {
  CheckCircle2,
  Code,
  Command,
  Database,
  FileText,
  Folder,
  GitBranch,
  Globe,
  LayoutDashboard,
  Link as LinkIcon,
  MousePointer2,
  PenTool,
  Server,
  Terminal,
} from 'lucide-react';

const workspaces = [
  {
    name: 'Dự án Marketing',
    icon: Globe,
    color: 'text-blue-500',
    content: {
      card1Title: 'Tài nguyên & Thiết kế',
      card1Icon: PenTool,
      items1: ['Figma: Landing Page V2', 'Google Drive: Assets Q3', 'Miro: User Flow'],
      card2Title: 'Nhiệm vụ tuần',
      card2Icon: CheckCircle2,
      items2: ['Duyệt ngân sách Ads', 'Viết content Social', 'Lên lịch email'],
      bottomTitle: 'Hoạt động gần đây',
      bottomLines: [
        '[System] Connected to Google Analytics',
        '[User] Đã tải lên banner_v2.png',
        '[User] Đã tạo campaign mới trên Facebook',
      ],
    },
  },
  {
    name: 'Phát triển App',
    icon: Code,
    color: 'text-purple-500',
    content: {
      card1Title: 'Kho mã nguồn',
      card1Icon: GitBranch,
      items1: ['github.com/org/web-app', 'github.com/org/api-server', 'Tài liệu API (Swagger)'],
      card2Title: 'Môi trường (Envs)',
      card2Icon: Server,
      items2: ['Production: Vercel', 'Staging: Railway', 'Local: localhost:3000'],
      bottomTitle: 'Terminal Local',
      bottomLines: [
        '> pnpm run dev',
        'ready - started server on 0.0.0.0:3000, url: http://localhost:3000',
        'event - compiled client and server successfully in 1250 ms',
      ],
    },
  },
  {
    name: 'Kế hoạch Quý 3',
    icon: FileText,
    color: 'text-green-500',
    content: {
      card1Title: 'Tài liệu OKRs',
      card1Icon: FileText,
      items1: ['Notion: Company OKRs', 'Google Sheets: Báo cáo tài chính', 'Slide: Pitch Deck'],
      card2Title: 'Mục tiêu (KPIs)',
      card2Icon: LayoutDashboard,
      items2: ['Tăng 20% doanh thu', 'Mở rộng thị trường', 'Tuyển 5 nhân sự mới'],
      bottomTitle: 'Ghi chú cuộc họp',
      bottomLines: [
        '- Tuần 1: Cần tập trung vào retention rate.',
        '- Tuần 2: Rà soát lại chi phí marketing.',
        '- Đừng quên check email đối tác.',
      ],
    },
  },
  {
    name: 'Cơ sở dữ liệu',
    icon: Database,
    color: 'text-orange-500',
    content: {
      card1Title: 'Kết nối DB',
      card1Icon: Database,
      items1: ['PostgreSQL (Primary)', 'Redis Cache', 'MongoDB (Logs)'],
      card2Title: 'Trạng thái',
      card2Icon: Server,
      items2: ['CPU Usage: 45%', 'Memory: 2.1GB / 4GB', 'Active Connections: 12'],
      bottomTitle: 'Query Logs',
      bottomLines: [
        '[INFO] SELECT * FROM users WHERE active = true;',
        '[WARN] Slow query detected on orders table (1.2s)',
        '[INFO] VACUUM ANALYZE completed successfully.',
      ],
    },
  },
];

export function AppMockup(): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const cursorControls = useAnimationControls();

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const runSequence = async (): Promise<void> => {
      let currentIndex = 0;

      cursorControls.set({ x: 300, y: 300, opacity: 0 });
      await cursorControls.start({ opacity: 1, transition: { duration: 0.5 } });

      while (isMounted.current) {
        // Wait on current workspace
        await new Promise((r) => setTimeout(r, 3500));
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!isMounted.current) {
          break;
        }

        const nextIndex = (currentIndex + 1) % workspaces.length;

        // Move to sidebar item
        const targetY = 125 + nextIndex * 40;
        await cursorControls.start({
          x: 60,
          y: targetY,
          transition: { duration: 0.8, ease: 'easeInOut' },
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!isMounted.current) {
          break;
        }

        // Click
        await cursorControls.start({
          scale: [1, 0.7, 1],
          transition: { duration: 0.2 },
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!isMounted.current) {
          break;
        }

        currentIndex = nextIndex;
        setActiveIndex(currentIndex);

        // Move into content to read
        await cursorControls.start({
          x: 350 + Math.random() * 100,
          y: 200 + Math.random() * 50,
          transition: { duration: 1, ease: 'easeOut', delay: 0.2 },
        });
      }
    };

    void runSequence();

    return () => {
      isMounted.current = false;
    };
  }, [cursorControls]);

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-20">
      <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />

      <motion.div
        animate={cursorControls}
        className="absolute z-50 pointer-events-none drop-shadow-2xl hidden md:block"
        style={{ transformOrigin: 'top left' }}
      >
        <MousePointer2 className="w-6 h-6 text-foreground fill-foreground/90 -rotate-12" />
      </motion.div>

      <div className="relative w-full aspect-[16/10] sm:aspect-video bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] shadow-2xl overflow-hidden flex dark:ring-1 dark:ring-white/10 text-left">
        {/* Sidebar */}
        <div className="w-64 border-r border-border/50 bg-muted/10 flex-col p-4 hidden md:flex">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <LayoutDashboard className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">WorkFlow Hub</span>
          </div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Workspaces
          </div>
          <div className="flex flex-col gap-1 relative">
            {workspaces.map((item, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={item.name}
                  className={`relative px-2 py-2 rounded-md text-sm flex items-center gap-2 transition-colors duration-500 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary/10 rounded-md"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Folder className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Topbar */}
          <div className="h-14 border-b border-border/50 flex items-center px-6 justify-between bg-muted/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="font-medium text-sm flex items-center gap-2"
              >
                Workspace: <span className="text-foreground">{workspaces[activeIndex]?.name}</span>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                <Command className="w-3 h-3" /> Chạy ứng dụng
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),1)]"
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex-1 flex flex-col gap-4 absolute inset-0 p-6"
              >
                <div className="flex gap-4 flex-col sm:flex-row h-[140px]">
                  {/* Card 1 */}
                  <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div
                      className={`flex items-center gap-2 mb-3 text-sm font-medium ${workspaces[activeIndex]?.color ?? ''}`}
                    >
                      {React.createElement(workspaces[activeIndex]?.content.card1Icon ?? Globe, {
                        className: 'w-4 h-4',
                      })}
                      {workspaces[activeIndex]?.content.card1Title}
                    </div>
                    <div className="flex flex-col gap-2">
                      {workspaces[activeIndex]?.content.items1.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.1 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <LinkIcon className="w-3 h-3 opacity-50" />
                          <span className="truncate">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
                      {React.createElement(
                        workspaces[activeIndex]?.content.card2Icon ?? LayoutDashboard,
                        { className: 'w-4 h-4' },
                      )}
                      {workspaces[activeIndex]?.content.card2Title}
                    </div>
                    <div className="flex flex-col gap-2">
                      {workspaces[activeIndex]?.content.items2.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                          <span className="truncate">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Terminal / Logs / Activity Area */}
                <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-medium mb-3 flex items-center gap-2 text-foreground"
                  >
                    <Terminal className="w-4 h-4 text-muted-foreground" />
                    {workspaces[activeIndex]?.content.bottomTitle}
                  </motion.div>
                  <div className="flex-1 border border-border/50 rounded-lg bg-black/5 dark:bg-black/40 p-4 font-mono text-xs overflow-hidden relative group">
                    {/* Fake scroll effect */}
                    <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-black/40 z-10" />
                    <div className="space-y-2 flex flex-col relative z-0">
                      {workspaces[activeIndex]?.content.bottomLines.map((line, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + idx * 0.2, duration: 0.3 }}
                          className={
                            line.includes('ERR') || line.includes('WARN')
                              ? 'text-red-500 dark:text-red-400'
                              : line.includes('>')
                                ? 'text-blue-500 dark:text-blue-400 font-semibold'
                                : 'text-gray-600 dark:text-gray-400'
                          }
                        >
                          {line}
                        </motion.div>
                      ))}
                      <motion.div
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-3 bg-muted-foreground mt-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
