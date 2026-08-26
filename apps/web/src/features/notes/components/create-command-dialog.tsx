'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { NOTE_TYPE } from '@repo/constants';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from '@repo/ui';
import { type CreateCommandInput, CreateCommandSchema } from '@repo/validation';

import { extractErrorMessage } from '@/lib/api-helpers';

import { useCreateNote } from '../hooks/use-notes';

interface CreateCommandDialogProps {
  workspaceId: string;
}

export function CreateCommandDialog({ workspaceId }: CreateCommandDialogProps): React.ReactElement {
  const createMutation = useCreateNote();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommandInput>({
    resolver: zodResolver(CreateCommandSchema),
    defaultValues: {
      title: '',
      content: '',
      type: NOTE_TYPE.COMMAND,
      category: 'Uncategorized',
    },
  });

  const onSubmit = (values: CreateCommandInput): void => {
    createMutation.mutate(
      {
        workspaceId,
        data: values,
      },
      {
        onSuccess: () => {
          toast.success('Đã tạo lệnh mới');
          setOpen(false);
          reset();
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err, 'Lỗi tạo lệnh'));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-4">
          + Tạo lệnh mới
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm lệnh COMMAND</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label>Tên lệnh</Label>
            <Input placeholder="VD: Chạy server frontend" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Danh mục (Không bắt buộc)</Label>
            <Input placeholder="VD: Frontend" {...register('category')} />
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Nội dung lệnh (Code)</Label>
            <Textarea
              placeholder="pnpm dev"
              className="font-mono text-sm h-24"
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
            )}
          </div>

          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
