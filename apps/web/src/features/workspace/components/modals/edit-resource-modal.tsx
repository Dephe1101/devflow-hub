'use client';

import { useEffect, useState } from 'react';

import type { AxiosError } from 'axios';
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
  Textarea,
} from '@repo/ui';

import { FadeIn } from '@/components/animations/fade-in';
import { SlideUp } from '@/components/animations/slide-up';
import { useUpdateResource } from '@/features/workspace/hooks/use-workspace-resources';
import { useUIStore } from '@/stores/ui.store';

export function EditResourceModal(): React.ReactElement | null {
  const { isEditResourceOpen, selectedResourceForEdit, closeEditResource } = useUIStore();
  const [type, setType] = useState<'URL' | 'LOCAL_PATH' | 'APP_URI' | 'COMMAND'>('URL');
  const [value, setValue] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const updateMutation = useUpdateResource(selectedResourceForEdit?.workspaceId ?? '');

  useEffect(() => {
    if (selectedResourceForEdit) {
      setType(
        selectedResourceForEdit.resource.type as 'URL' | 'LOCAL_PATH' | 'APP_URI' | 'COMMAND',
      );
      setValue(selectedResourceForEdit.resource.value);
      setDisplayName(selectedResourceForEdit.resource.displayName ?? '');
      setNotes(selectedResourceForEdit.resource.notes ?? '');
      setError('');
    }
  }, [selectedResourceForEdit]);

  const closeModal = (): void => {
    setError('');
    closeEditResource();
  };

  const handleTypeChange = (val: string): void => {
    setType(val as 'URL' | 'LOCAL_PATH' | 'APP_URI' | 'COMMAND');
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDisplayName(e.target.value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setNotes(e.target.value);
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!selectedResourceForEdit) {
      return;
    }
    setError('');
    updateMutation.mutate(
      {
        resourceId: selectedResourceForEdit.resourceId,
        data: {
          type,
          value,
          displayName: displayName || undefined,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          closeModal();
        },
        onError: (err: Error | AxiosError<{ message: string }>) => {
          const axiosError = err as AxiosError<{ message: string }>;
          if (axiosError.response?.data.message) {
            setError(axiosError.response.data.message);
          } else {
            setError('Failed to update resource');
          }
        },
      },
    );
  };

  if (!isEditResourceOpen || !selectedResourceForEdit) {
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
                Edit Resource
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update information for this resource.
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full h-10 bg-background/50 backdrop-blur-sm border-input/60 transition-all duration-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border/50">
                  <SelectItem value="URL">Web URL</SelectItem>
                  <SelectItem value="LOCAL_PATH">Local Path (Phase 2)</SelectItem>
                  <SelectItem value="APP_URI">App URI (Phase 2)</SelectItem>
                  <SelectItem value="COMMAND">Command (Phase 2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resource URL/Value</Label>
              <Input
                type="text"
                required
                placeholder={type === 'URL' ? 'https://github.com' : '...'}
                value={value}
                onChange={handleValueChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Display Name (Optional)</Label>
              <Input
                type="text"
                placeholder="e.g. GitHub Repo"
                value={displayName}
                onChange={handleDisplayNameChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={handleNotesChange}
                className="flex w-full bg-background/50 border-input/60 transition-all duration-200 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none shadow-sm backdrop-blur-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </SlideUp>
    </FadeIn>
  );
}
