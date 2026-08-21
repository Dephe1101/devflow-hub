'use client';

import { useTheme } from 'next-themes';

import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as any}
      className="toaster group"
      style={{ zIndex: 99999 }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          success:
            '!bg-green-50 !text-green-900 !border-green-200 dark:!bg-green-900/30 dark:!text-green-400 dark:!border-green-800',
          error:
            '!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-900/30 dark:!text-red-400 dark:!border-red-800',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
