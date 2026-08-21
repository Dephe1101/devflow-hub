import { create } from 'zustand';

import type { WorkspaceResource } from '@repo/types';

interface UIState {
  isCreateWorkspaceOpen: boolean;
  isAddResourceOpen: boolean;
  isEditResourceOpen: boolean;
  selectedWorkspaceIdForResource: string | null;
  selectedResourceForEdit: WorkspaceResource | null;
  openCreateWorkspace: () => void;
  closeCreateWorkspace: () => void;
  openAddResource: (workspaceId: string) => void;
  closeAddResource: () => void;
  openEditResource: (resource: WorkspaceResource) => void;
  closeEditResource: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateWorkspaceOpen: false,
  isAddResourceOpen: false,
  isEditResourceOpen: false,
  selectedWorkspaceIdForResource: null,
  selectedResourceForEdit: null,
  openCreateWorkspace: () => {
    set({ isCreateWorkspaceOpen: true });
  },
  closeCreateWorkspace: () => {
    set({ isCreateWorkspaceOpen: false });
  },
  openAddResource: (workspaceId) => {
    set({ isAddResourceOpen: true, selectedWorkspaceIdForResource: workspaceId });
  },
  closeAddResource: () => {
    set({ isAddResourceOpen: false, selectedWorkspaceIdForResource: null });
  },
  openEditResource: (resource) => {
    set({ isEditResourceOpen: true, selectedResourceForEdit: resource });
  },
  closeEditResource: () => {
    set({ isEditResourceOpen: false, selectedResourceForEdit: null });
  },
}));
