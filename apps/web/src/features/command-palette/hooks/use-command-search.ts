import { useMemo, useRef, useState } from 'react';

import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';

import { useDebounce } from '@/hooks/use-debounce';

export type SearchableItem =
  | {
      type: 'workspace';
      id: string;
      name: string;
      description: string;
      data: { id: string; name: string; color?: string | null | undefined };
    }
  | {
      type: 'resource';
      id: string;
      name: string;
      description: string;
      resourceType: string;
      isLocal: boolean;
      path?: string | undefined;
      url?: string | undefined;
      data: {
        id: string;
        workspaceId?: string | undefined;
        type: string;
        value: string;
        url?: string | undefined;
        path?: string | undefined;
      };
    }
  | {
      type: 'action';
      id: string;
      name: string;
      description: string;
      action: () => void;
    };

const FUSE_OPTIONS: IFuseOptions<SearchableItem> = {
  keys: ['name', 'description'],
  threshold: 0.3,
};

export function useCommandSearch(searchableItems: SearchableItem[]): {
  results: SearchableItem[];
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
} {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 150); // OPT-6: Debounce search

  // BUG-7 fix: stable Fuse instance - recreate only when items count or content changes significantly
  const fuseRef = useRef<Fuse<SearchableItem> | null>(null);
  const prevItemsRef = useRef<SearchableItem[] | null>(null);

  const fuse = useMemo(() => {
    // Only rebuild if items changed by reference
    if (prevItemsRef.current === searchableItems && fuseRef.current) {
      return fuseRef.current;
    }
    prevItemsRef.current = searchableItems;
    const instance = new Fuse(searchableItems, FUSE_OPTIONS);
    fuseRef.current = instance;
    return instance;
  }, [searchableItems]);

  const results = useMemo(() => {
    if (!debouncedQuery) {
      return searchableItems;
    }
    return fuse.search(debouncedQuery).map((result) => result.item);
  }, [debouncedQuery, fuse, searchableItems]);

  return {
    results,
    query,
    setQuery,
    isSearching: debouncedQuery.length > 0,
  };
}
