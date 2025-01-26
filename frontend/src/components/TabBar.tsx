import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  title: string;
  isActive: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  onTabClick,
  onTabClose,
}) => {
  return (
    <div className="flex overflow-x-auto bg-background/50 border-b">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "flex items-center px-4 py-2 border-r cursor-pointer group",
            "hover:bg-secondary/50 transition-colors",
            tab.isActive && "bg-secondary"
          )}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="text-sm truncate max-w-[150px]">{tab.title}</span>
          <button
            className="ml-2 opacity-0 group-hover:opacity-100 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};