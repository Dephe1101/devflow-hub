import { useEffect } from 'react';

import { useCommandPaletteStore } from '@/stores/command-palette.store';

export function useCommandPalette(): {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
} {
  const { isOpen, setIsOpen, toggle } = useCommandPaletteStore();

  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', down);
    return () => {
      document.removeEventListener('keydown', down);
    };
  }, [toggle]);

  return {
    isOpen,
    setIsOpen,
    toggle,
  };
}
