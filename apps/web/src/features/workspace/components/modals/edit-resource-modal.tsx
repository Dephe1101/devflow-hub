'use client';

import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@repo/ui';
import type { UpdateResourceInput } from '@repo/validation';
import { updateResourceSchema } from '@repo/validation';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { useUpdateResource } from '@/features/workspace/hooks/use-workspace-resources';
import { extractErrorMessage } from '@/lib/api-helpers';
import { useUIStore } from '@/stores/ui.store';

export function EditResourceModal(): React.ReactElement | null {
  const { isEditResourceOpen, selectedResourceForEdit, closeEditResource } = useUIStore();
  const updateMutation = useUpdateResource(selectedResourceForEdit?.workspaceId ?? '');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateResourceInput>({
    resolver: zodResolver(updateResourceSchema),
    defaultValues: {
      type: 'URL',
      value: '',
      displayName: '',
    },
  });

  useEffect(() => {
    if (selectedResourceForEdit) {
      reset({
        type: selectedResourceForEdit.resource.type as 'URL' | 'LOCAL_PATH' | 'APP_URI' | 'COMMAND',
        value: selectedResourceForEdit.resource.value,
        displayName: selectedResourceForEdit.resource.displayName ?? '',
      });
    }
  }, [selectedResourceForEdit, reset]);

  const closeModal = useCallback((): void => {
    reset();
    closeEditResource();
  }, [reset, closeEditResource]);

  const onSubmit = (data: UpdateResourceInput): void => {
    if (!selectedResourceForEdit) {
      return;
    }

    // clean up empty string fields
    const payload = {
      ...data,
      displayName: data.displayName !== '' ? data.displayName : undefined,
    };

    updateMutation.mutate(
      {
        resourceId: selectedResourceForEdit.resourceId,
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật tài nguyên thành công');
          closeModal();
        },
        onError: (err: unknown) => {
          const errorMessage = extractErrorMessage(err, 'Cập nhật tài nguyên thất bại');
          toast.error(errorMessage);
        },
      },
    );
  };

  // Keyboard navigation support: Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isEditResourceOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditResourceOpen, closeModal]);

  if (!isEditResourceOpen || !selectedResourceForEdit) {
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
          aria-labelledby="edit-resource-title"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-border/50">
            <div>
              <h2
                id="edit-resource-title"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                Sửa Tài nguyên
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cập nhật thông tin cho tài nguyên này.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              disabled={updateMutation.isPending}
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
              <Label>Loại</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={updateMutation.isPending}
                  >
                    <SelectTrigger
                      autoFocus
                      className="w-full h-10 bg-background/50 backdrop-blur-sm border-input/60 transition-all duration-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    >
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
              <Input type="text" {...register('value')} disabled={updateMutation.isPending} />
              {errors.value && (
                <p className="text-sm text-destructive mt-1">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tên hiển thị (Tùy chọn)</Label>
              <Input type="text" {...register('displayName')} disabled={updateMutation.isPending} />
              {errors.displayName && (
                <p className="text-sm text-destructive mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={updateMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu Thay Đổi
              </Button>
            </div>
          </form>
        </div>
      </SlideUp>
    </FadeIn>
  );
}
