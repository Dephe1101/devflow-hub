import { CalendarDays, Folder, LayoutGrid } from 'lucide-react';

import type { Workspace } from '@repo/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

export function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps): React.ReactNode {
  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-border/50 hover:border-primary/50 h-full flex flex-col"
      onClick={onClick}
    >
      <div
        className="absolute top-0 left-0 w-full h-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100"
        style={{ backgroundColor: workspace.color ?? 'hsl(var(--primary))' }}
      />
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
            <span>{workspace.resourceCount} resources</span>
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
