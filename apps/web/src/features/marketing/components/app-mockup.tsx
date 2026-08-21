'use client';

import React from 'react';

import { Folder, Globe, LayoutDashboard, Terminal } from 'lucide-react';

export function AppMockup(): React.ReactElement {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-20">
      {/* Glow Behind Mockup */}
      <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />

      {/* Mockup Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-video bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] shadow-2xl overflow-hidden flex dark:ring-1 dark:ring-white/10 text-left">
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
          <div className="flex flex-col gap-1">
            {['Dự án Marketing', 'Kế hoạch Quý 3', 'Tài liệu Nghiên cứu', 'Cá nhân'].map(
              (item, i) => (
                <div
                  key={item}
                  className={`px-2 py-2 rounded-md text-sm flex items-center gap-2 cursor-pointer ${i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  <Folder className="w-4 h-4" /> {item}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <div className="h-14 border-b border-border/50 flex items-center px-6 justify-between bg-background/50">
            <div className="font-medium text-sm">Workspace: Dự án Marketing</div>
            <div className="flex gap-3 items-center">
              <div className="w-20 h-6 bg-muted/50 rounded-full" />
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),1)]" />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 bg-muted/5 flex flex-col gap-6 overflow-hidden">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 h-32 bg-card border border-border/50 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-2 text-blue-500 mb-1 text-sm font-medium">
                  <Globe className="w-4 h-4" /> Liên kết & Tài nguyên
                </div>
                <div className="h-2 w-3/4 bg-muted rounded" />
                <div className="h-2 w-1/2 bg-muted rounded" />
                <div className="h-2 w-5/6 bg-muted rounded" />
              </div>
              <div className="flex-1 h-32 bg-card border border-border/50 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-2 text-green-500 mb-1 text-sm font-medium">
                  <Terminal className="w-4 h-4" /> Công cụ & Ghi chú
                </div>
                <div className="h-2 w-2/4 bg-muted rounded" />
                <div className="h-2 w-3/4 bg-muted rounded" />
                <div className="h-2 w-1/3 bg-muted rounded" />
              </div>
            </div>

            <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col">
              <div className="h-2 w-32 bg-muted rounded mb-4" />
              <div className="flex-1 border border-border/50 rounded-lg bg-muted/20 p-4">
                <div className="space-y-3">
                  <div className="h-2 w-full bg-muted rounded" />
                  <div className="h-2 w-5/6 bg-muted rounded" />
                  <div className="h-2 w-4/6 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
