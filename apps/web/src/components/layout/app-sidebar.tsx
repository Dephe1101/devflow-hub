'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Activity, ChevronLeft, LayoutDashboard, Server, Settings, Users } from 'lucide-react';

import { Button, cn } from '@repo/ui';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from '@repo/ui';

const ADMIN_NAV_ITEMS = [
  {
    title: 'Tổng quan',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Background Jobs',
    href: '/admin/jobs',
    icon: Activity,
  },
  {
    title: 'Người dùng',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Máy chủ Agent',
    href: '/admin/agents',
    icon: Server,
  },
  {
    title: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AppSidebar(): React.ReactNode {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="justify-between">
        <div
          className={cn(
            'flex items-center gap-2 overflow-hidden transition-opacity',
            !isOpen && 'opacity-0 hidden',
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Server className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight whitespace-nowrap">
            DevFlow Admin
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 ml-auto shrink-0">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', !isOpen && 'rotate-180')} />
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2 space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start transition-all',
                  isOpen ? 'px-3' : 'px-0 justify-center',
                )}
                title={!isOpen ? item.title : undefined}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', isOpen && 'mr-3')} />
                {isOpen && <span className="truncate">{item.title}</span>}
              </Button>
            </Link>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <Link href="/dashboard" className="block">
          <Button
            variant="outline"
            className={cn('w-full', isOpen ? 'px-3' : 'px-0 justify-center')}
          >
            <ChevronLeft className={cn('h-4 w-4 shrink-0', isOpen && 'mr-2')} />
            {isOpen && <span className="truncate">Về Dashboard</span>}
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
