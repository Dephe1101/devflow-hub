'use client';

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';

import { API_ROUTES } from '@repo/constants';
import { Button, Input, Label, Textarea, toast } from '@repo/ui';
import type { CreateWorkspaceInput } from '@repo/validation';
import { createWorkspaceSchema } from '@repo/validation';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { api } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import { QUERY_KEYS } from '@/lib/query-keys';
import { useUIStore } from '@/stores/ui.store';

export function CreateWorkspaceModal(): React.ReactElement | null {
  const { isCreateWorkspaceOpen, closeCreateWorkspace } = useUIStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateWorkspaceInput) => {
      const res = await api.post(`/${API_ROUTES.WORKSPACES.BASE}`, data);
      return res.data as unknown;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces.all });
      toast.success('Tạo workspace thành công');
      closeModal();
    },
    onError: (err: unknown) => {
      const errorMessage = extractErrorMessage(err, 'Tạo workspace thất bại');
      toast.error(errorMessage);
    },
  });

  const closeModal = useCallback((): void => {
    reset();
    closeCreateWorkspace();
  }, [reset, closeCreateWorkspace]);

  const onSubmit = (data: CreateWorkspaceInput): void => {
    mutation.mutate(data);
  };

  // Keyboard navigation support: Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isCreateWorkspaceOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCreateWorkspaceOpen, closeModal]);

  if (!isCreateWorkspaceOpen) {
    return null;
  }

  return (
    <FadeIn
      duration={0.2}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <SlideUp duration={0.3} className="w-full max-w-md">
        <div
          className="bg-card/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-border/50 focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-workspace-title"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-border/50">
            <div>
              <h2
                id="create-workspace-title"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                Workspace Mới
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tạo một workspace mới để tổ chức các tài nguyên của bạn.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              disabled={mutation.isPending}
              className="text-muted-foreground hover:text-foreground transition-colors self-start mt-1 rounded-sm opacity-70 hover:opacity-100 w-6 h-6 focus-visible:ring-2"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
            className="p-6 space-y-4"
          >
            <div className="space-y-2">
              <Label>Tên Workspace</Label>
              <Input
                type="text"
                autoFocus
                placeholder="VD: Dự án Frontend"
                {...register('name')}
                disabled={mutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={3}
                {...register('description')}
                disabled={mutation.isPending}
                className="flex w-full bg-background/50 border-input/60 transition-all duration-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none shadow-sm backdrop-blur-sm"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Màu chủ đạo</Label>
              <div className="mt-2 flex items-center gap-3">
                <Input
                  type="color"
                  {...register('color')}
                  disabled={mutation.isPending}
                  className="h-8 w-12 rounded cursor-pointer border-0 p-1 bg-transparent hover:bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
              {errors.color && (
                <p className="text-sm text-destructive mt-1">{errors.color.message}</p>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={mutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Tạo mới
              </Button>
            </div>
          </form>
        </div>
      </SlideUp>
    </FadeIn>
  );
}
