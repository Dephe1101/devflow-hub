'use client';

import * as React from 'react';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from './button';

interface SidebarContextValue {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div className="flex h-screen w-full overflow-hidden bg-background">{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactNode {
  const { isOpen } = useSidebar();

  return (
    <aside
      className={cn(
        'group relative flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-[70px]',
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactNode {
  return <div className={cn('flex items-center h-14 px-4 border-b', className)}>{children}</div>;
}

export function SidebarContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactNode {
  return <div className={cn('flex-1 overflow-auto py-4', className)}>{children}</div>;
}

export function SidebarFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactNode {
  return <div className={cn('p-4 border-t', className)}>{children}</div>;
}

export function SidebarTrigger({ className }: { className?: string }): React.ReactNode {
  const { isOpen, toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', className)}
      onClick={toggle}
      title={isOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
    >
      {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
