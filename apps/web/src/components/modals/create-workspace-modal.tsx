'use client';

import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, X } from 'lucide-react';

import { API_ROUTES } from '@repo/constants';
import { Button, Input, Label, Textarea } from '@repo/ui';
import type { CreateWorkspaceInput } from '@repo/validation';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { api } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';
import { useUIStore } from '@/stores/ui.store';

export default function CreateWorkspaceModal(): React.ReactElement | null {
  const { isCreateWorkspaceOpen, closeCreateWorkspace } = useUIStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateWorkspaceInput) => {
      const res = await api.post(`/${API_ROUTES.WORKSPACES.BASE}`, data);
      return res.data as unknown;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces.all });
      closeModal();
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data.message ?? 'Failed to create workspace');
      } else {
        setError('Failed to create workspace');
      }
    },
  });

  const closeModal = (): void => {
    setName('');
    setDescription('');
    setColor('#3B82F6');
    setError('');
    closeCreateWorkspace();
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError('');
    mutation.mutate({ name, description, color });
  };

  if (!isCreateWorkspaceOpen) {
    return null;
  }

  return (
    <FadeIn
      duration={0.2}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <SlideUp duration={0.3} className="w-full max-w-md">
        <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-border/50">
          <div className="flex justify-between items-center px-6 py-4 border-b border-border/50">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                New Workspace
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new workspace to organize your resources.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="text-muted-foreground hover:text-foreground transition-colors self-start mt-1 rounded-sm opacity-70 hover:opacity-100 w-6 h-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            className="p-6 space-y-4"
          >
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                type="text"
                required
                placeholder="e.g. Frontend Project"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value);
                }}
                className="flex w-full bg-background/50 border-input/60 transition-all duration-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none shadow-sm backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Theme Color</Label>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                  }}
                  className="h-8 w-12 rounded cursor-pointer border-0 p-1 bg-transparent hover:bg-transparent shadow-none focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground font-mono">{color}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </div>
          </form>
        </div>
      </SlideUp>
    </FadeIn>
  );
}
