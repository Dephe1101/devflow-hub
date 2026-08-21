'use client';

import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';

import { API_ROUTES } from '@repo/constants';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@repo/ui';
import type { CreateResourceInput } from '@repo/validation';
import { createResourceSchema } from '@repo/validation';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { api } from '@/lib/api';
import { extractErrorMessage } from '@/lib/api-helpers';
import { QUERY_KEYS } from '@/lib/query-keys';
import { useUIStore } from '@/stores/ui.store';

export function AddResourceModal(): React.ReactElement | null {
  const { isAddResourceOpen, selectedWorkspaceIdForResource, closeAddResource } = useUIStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateResourceInput>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      type: 'URL',
      value: '',
      displayName: '',
      notes: '',
    },
  });

  const selectedType = watch('type');

  const mutation = useMutation({
    mutationFn: async (data: CreateResourceInput) => {
      if (!selectedWorkspaceIdForResource) {
        throw new Error('Workspace ID is missing');
      }
      const route = API_ROUTES.RESOURCES.BASE.replace(
        ':workspaceId',
        selectedWorkspaceIdForResource,
      );
      // clean up empty optional string fields to undefined before sending
      const payload = {
        ...data,
        displayName: data.displayName !== '' ? data.displayName : undefined,
        notes: data.notes !== '' ? data.notes : undefined,
      };
      const res = await api.post(`/${route}`, payload);
      return res.data as unknown;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.workspaceResources.list(selectedWorkspaceIdForResource ?? ''),
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workspaces.all });
      toast.success('Thêm tài nguyên thành công');
      closeModal();
    },
    onError: (err: unknown) => {
      const errorMessage = extractErrorMessage(err, 'Thêm tài nguyên thất bại');
      toast.error(errorMessage);
    },
  });

  const closeModal = (): void => {
    reset();
    closeAddResource();
  };

  const onSubmit = (data: CreateResourceInput): void => {
    mutation.mutate(data);
  };

  if (!isAddResourceOpen || !selectedWorkspaceIdForResource) {
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
                Thêm Tài nguyên
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Thêm liên kết, đường dẫn local, hoặc lệnh shell vào workspace này.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              disabled={mutation.isPending}
              className="text-muted-foreground hover:text-foreground transition-colors self-start mt-1 rounded-sm opacity-70 hover:opacity-100 w-6 h-6"
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
              <Label>Loại</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={mutation.isPending}
                  >
                    <SelectTrigger className="w-full h-10 bg-background/50 backdrop-blur-sm border-input/60 transition-all duration-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Chọn loại tài nguyên" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-md border-border/50">
                      <SelectItem value="URL">Web URL</SelectItem>
                      <SelectItem value="LOCAL_PATH">Local Path (Phase 2)</SelectItem>
                      <SelectItem value="APP_URI">App URI (Phase 2)</SelectItem>
                      <SelectItem value="COMMAND">Command (Phase 2)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>URL/Giá trị</Label>
              <Input
                type="text"
                placeholder={selectedType === 'URL' ? 'https://github.com' : '...'}
                {...register('value')}
                disabled={mutation.isPending}
              />
              {errors.value && (
                <p className="text-sm text-destructive mt-1">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tên hiển thị (Tùy chọn)</Label>
              <Input
                type="text"
                placeholder="VD: GitHub Repo"
                {...register('displayName')}
                disabled={mutation.isPending}
              />
              {errors.displayName && (
                <p className="text-sm text-destructive mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ghi chú (Tùy chọn)</Label>
              <Textarea
                rows={2}
                {...register('notes')}
                disabled={mutation.isPending}
                className="flex w-full bg-background/50 border-input/60 transition-all duration-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none shadow-sm backdrop-blur-sm"
              />
              {errors.notes && (
                <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
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
                Thêm Tài nguyên
              </Button>
            </div>
          </form>
        </div>
      </SlideUp>
    </FadeIn>
  );
}
