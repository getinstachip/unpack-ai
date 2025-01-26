import React from 'react';
import { Card } from './ui/card';
import { formatDistanceToNow } from 'date-fns';
import { FileIcon, FolderIcon, Clock } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  description?: string;
  filesCount: number;
  lastModified: string;
  onClick: (project: { id: string; name: string; content?: string; type?: string }) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  filesCount,
  lastModified,
  onClick
}) => {
  return (
    <Card
      className="p-4 hover:bg-accent cursor-pointer transition-colors"
      onClick={() => onClick({
        id: name,
        name,
        type: name.split('.').pop() || 'txt',
        content: '',  // Will be loaded when navigating to editor
      })}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-5 h-5" />
          <div>
            <h3 className="font-medium text-base">{name}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileIcon className="w-4 h-4" />
            <span>{filesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(lastModified), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};