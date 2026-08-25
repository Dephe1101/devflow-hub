import { CalendarDays, Folder, LayoutGrid, Pin, PinOff } from 'lucide-react';

import type { Workspace } from '@repo/types';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, toast } from '@repo/ui';

import { useUpdateWorkspace } from '@/features/workspace/hooks/use-workspaces';
import { extractErrorMessage } from '@/lib/api-helpers';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

export function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps): React.ReactElement {
  const updateMutation = useUpdateWorkspace();

  const handleTogglePin = (e: React.MouseEvent | React.KeyboardEvent): void => {
    e.stopPropagation();
    updateMutation.mutate(
      { id: workspace.id, data: { isPinned: !workspace.isPinned } },
      {
        onSuccess: () => {
          toast.success(workspace.isPinned ? 'Đã bỏ ghim workspace' : 'Đã ghim workspace');
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err, 'Lỗi cập nhật ghim'));
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-border/50 hover:border-primary/50 h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Mở workspace ${workspace.name}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100"
        style={{ backgroundColor: workspace.color ?? 'hsl(var(--primary))' }}
      />
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTogglePin}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTogglePin(e);
            }
          }}
          disabled={updateMutation.isPending}
          className={`h-8 w-8 rounded-full shadow-sm border backdrop-blur-md transition-colors ${workspace.isPinned ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : 'bg-background/80 border-border/50 text-muted-foreground hover:bg-background hover:text-foreground'}`}
          title={workspace.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
          aria-label={workspace.isPinned ? 'Bỏ ghim workspace' : 'Ghim workspace'}
        >
          {workspace.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </Button>
      </div>
      <CardHeader className="pb-3 flex-1">
        <CardTitle className="text-lg flex items-center gap-2.5">
          {workspace.icon ? (
            <span className="text-xl shrink-0">{workspace.icon}</span>
          ) : (
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center shrink-0 opacity-80"
              style={{ backgroundColor: `${workspace.color ?? 'hsl(var(--primary))'}15` }}
            >
              <Folder
                className="h-4 w-4"
                style={{ color: workspace.color ?? 'hsl(var(--primary))' }}
              />
            </div>
          )}
          <span className="truncate">{workspace.name}</span>
        </CardTitle>
        {workspace.description && (
          <CardDescription className="line-clamp-2 mt-2">{workspace.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 mt-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 font-medium">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{workspace.resourceCount} tài nguyên</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
