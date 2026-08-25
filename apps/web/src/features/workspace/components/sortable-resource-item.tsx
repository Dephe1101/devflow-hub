import Image from 'next/image';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Folder,
  Globe,
  GripVertical,
  MonitorSmartphone,
  Pencil,
  Terminal,
  Trash,
} from 'lucide-react';

import { RESOURCE_TYPE } from '@repo/constants';
import type { WorkspaceResource } from '@repo/types';
import { Button } from '@repo/ui';

export function SortableResourceItem({
  item,
  onEdit,
  onDelete,
}: {
  item: WorkspaceResource;
  onEdit: () => void;
  onDelete: () => void;
}): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = (type: string): React.ReactElement => {
    switch (type) {
      case 'URL':
        return <Globe className="w-5 h-5 text-blue-500" />;
      case 'LOCAL_PATH':
        return <Folder className="w-5 h-5 text-yellow-500" />;
      case 'APP_URI':
        return <MonitorSmartphone className="w-5 h-5 text-green-500" />;
      case 'COMMAND':
        return <Terminal className="w-5 h-5 text-gray-500" />;
      default:
        return <Globe className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (item.resource.type === RESOURCE_TYPE.URL) {
        window.open(item.resource.value, '_blank');
      }
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      onEdit();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onDelete();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-all"
      role="listitem"
      tabIndex={0}
      aria-label={`Tài nguyên: ${item.resource.displayName ?? item.resource.value}. Bấm phím e để sửa, Delete để xóa.`}
      onKeyDown={handleKeyDown}
    >
      <Button
        variant="ghost"
        size="icon"
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-gray-100 dark:hover:bg-gray-700 w-8 h-8 rounded text-muted-foreground focus-visible:ring-1"
        aria-label="Kéo thả để sắp xếp"
      >
        <GripVertical className="w-5 h-5" />
      </Button>

      <div className="flex-shrink-0">
        {item.resource.faviconUrl ? (
          <Image
            src={item.resource.faviconUrl}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 rounded-sm"
            unoptimized
          />
        ) : (
          getIcon(item.resource.type)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.resource.displayName ?? item.resource.value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.resource.value}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="w-8 h-8 text-muted-foreground hover:text-blue-500"
          aria-label="Sửa tài nguyên"
          tabIndex={-1} // Handled by container shortcut 'e'
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="w-8 h-8 text-muted-foreground hover:text-destructive"
          aria-label="Xóa tài nguyên"
          tabIndex={-1} // Handled by container shortcut 'Delete'
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
