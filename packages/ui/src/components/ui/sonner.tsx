'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';

import { Toaster as Sonner, toast as sonnerToast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Event target to broadcast toast actions
const toastEvents = new EventTarget();
const triggerExpand = () => {
  toastEvents.dispatchEvent(new Event('expand_toast'));
};

// Proxy to intercept all toast calls and trigger expand
const customToast = new Proxy(sonnerToast, {
  get(target, prop) {
    const value = target[prop as keyof typeof target];
    if (typeof value === 'function' && prop !== 'dismiss') {
      return new Proxy(value, {
        apply(targetMethod, thisArg, argumentsList) {
          triggerExpand();
          return Reflect.apply(targetMethod, thisArg, argumentsList);
        },
      });
    }
    return value;
  },
  apply(target, thisArg, argumentsList) {
    triggerExpand();
    return Reflect.apply(target, thisArg, argumentsList);
  },
});

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  const [expand, setExpand] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handleExpand = () => {
      setExpand(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setExpand(false);
      }, 1000);
    };

    toastEvents.addEventListener('expand_toast', handleExpand);
    return () => {
      toastEvents.removeEventListener('expand_toast', handleExpand);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Sonner
      theme={theme as any}
      className="toaster group"
      style={{ zIndex: 99999 }}
      expand={expand}
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

export { Toaster, customToast as toast };
