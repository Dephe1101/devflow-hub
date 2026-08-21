'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Loader2, LogOut, Menu, Settings, User, X } from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';

import { FadeIn } from '@/components/animations/fade-in';
import { AddResourceModal } from '@/features/workspace/components/modals/add-resource-modal';
import { CreateWorkspaceModal } from '@/features/workspace/components/modals/create-workspace-modal';
import { EditResourceModal } from '@/features/workspace/components/modals/edit-resource-modal';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { isAuthenticated, isLoading, checkAuth, user, logout } = useAuthStore();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <FadeIn
            duration={0.2}
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => {
              setIsSidebarOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border justify-between">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              DevFlow Hub
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => {
                setIsSidebarOpen(false);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-4 space-y-2">
              <Link href="/dashboard" passHref>
                <Button variant="secondary" className="w-full justify-start font-medium">
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto p-2">
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase shrink-0">
                      {user ? user.name[0] : 'U'}
                    </div>
                    <div className="flex flex-col items-start truncate">
                      <span className="font-medium">{user ? user.name : ''}</span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user ? user.email : ''}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void logout()}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header (Mobile) */}
        <header className="bg-card shadow-sm border-b border-border lg:hidden shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSidebarOpen(true);
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              DevFlow Hub
            </span>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8 bg-background/50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <CreateWorkspaceModal />
      <AddResourceModal />
      <EditResourceModal />
    </div>
  );
}
