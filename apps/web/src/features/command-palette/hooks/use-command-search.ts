import { useMemo, useState } from 'react';

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

  const fuse = useMemo(() => {
    return new Fuse(searchableItems, FUSE_OPTIONS);
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
