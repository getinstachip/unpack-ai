import React from 'react';
import {
  ContextMenu as ContextMenuPrimitive,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface FileContextMenuProps {
  children: React.ReactNode;
  onOpen?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  children,
  onOpen,
  onRename,
  onDelete,
}) => {
  return (
    <ContextMenuPrimitive>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onOpen && (
          <ContextMenuItem onClick={onOpen}>
            Open
          </ContextMenuItem>
        )}
        {onRename && (
          <ContextMenuItem onClick={onRename}>
            Rename
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem onClick={onDelete} className="text-destructive">
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenuPrimitive>
  );
};