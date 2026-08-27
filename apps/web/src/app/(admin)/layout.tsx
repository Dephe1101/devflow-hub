import { SidebarProvider } from '@repo/ui';

import { AppSidebar } from '@/components/layout/app-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col w-full bg-background overflow-hidden">{children}</main>
    </SidebarProvider>
  );
}
