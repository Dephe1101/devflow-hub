import { Folder, Plus, Rocket, Settings2 } from 'lucide-react';

import type { Workspace, WorkspaceResource } from '@repo/types';
import { Button } from '@repo/ui';

interface WorkspaceHeaderProps {
  workspace: Workspace;
  resources: WorkspaceResource[];
  isLocked: boolean;
  isLaunching: boolean;
  lockCountdown: number;
  onAddResource: () => void;
  onLaunch: () => void;
}

export function WorkspaceHeader({
  workspace,
  resources,
  isLocked,
  isLaunching,
  lockCountdown,
  onAddResource,
  onLaunch,
}: WorkspaceHeaderProps): React.ReactElement {
  return (
    <div className="sm:flex sm:items-start sm:justify-between border-b border-border/50 pb-6">
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-border/50"
          style={{ backgroundColor: `${workspace.color ?? 'hsl(var(--primary))'}15` }}
        >
          {workspace.icon ? (
            <span className="text-3xl">{workspace.icon}</span>
          ) : (
            <Folder
              className="w-8 h-8"
              style={{ color: workspace.color ?? 'hsl(var(--primary))' }}
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
            {workspace.name}
          </h1>
          {workspace.description && (
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              {workspace.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <Settings2 className="w-3.5 h-3.5" /> {resources.length} resources
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button variant="outline" onClick={onAddResource} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
        <Button
          onClick={onLaunch}
          disabled={isLocked || isLaunching || resources.length === 0}
          className="shadow-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
        >
          <Rocket className={`mr-2 h-4 w-4 ${isLaunching ? 'animate-pulse' : ''}`} />
          {isLocked ? `Wait (${lockCountdown.toString()}s)` : 'Launch Workspace'}
        </Button>
      </div>
    </div>
  );
}
