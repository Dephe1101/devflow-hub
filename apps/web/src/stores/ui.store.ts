import { create } from 'zustand';

interface UIState {
  isCreateWorkspaceOpen: boolean;
  isAddResourceOpen: boolean;
  selectedWorkspaceIdForResource: string | null;
  openCreateWorkspace: () => void;
  closeCreateWorkspace: () => void;
  openAddResource: (workspaceId: string) => void;
  closeAddResource: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateWorkspaceOpen: false,
  isAddResourceOpen: false,
  selectedWorkspaceIdForResource: null,
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
}));
