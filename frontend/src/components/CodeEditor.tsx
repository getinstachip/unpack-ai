import React from 'react';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import { TabBar } from './TabBar';
import { FileUploadButton } from './FileUploadButton';

interface CodeEditorProps {
  files: {
    id: string;
    name: string;
    content: string;
    language: string;
  }[];
  activeFileId: string | null;
  onFileChange: (fileId: string, newContent: string) => void;
  onFileSelect: (fileId: string) => void;
  onFileClose: (fileId: string) => void;
  readOnly?: boolean;
  onFilesUpload?: (files: FileList) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  files,
  activeFileId,
  onFileChange,
  onFileSelect,
  onFileClose,
  readOnly = false,
  onFilesUpload
}) => {
  const activeFile = files.find(f => f.id === activeFileId);
  
  return (
    <Card className="h-full overflow-hidden bg-code-background">
      <div className="flex items-center justify-between px-2 border-b">
        <TabBar
          tabs={files.map(f => ({
            id: f.id,
            title: f.name,
            isActive: f.id === activeFileId
          }))}
          onTabClick={onFileSelect}
          onTabClose={onFileClose}
        />
        {onFilesUpload && <FileUploadButton onFileSelect={onFilesUpload} />}
      </div>
      <textarea
        className={cn(
          "code-editor w-full h-[calc(100%-40px)] resize-none focus:outline-none p-4",
          "font-mono text-sm leading-relaxed",
          readOnly && "opacity-80"
        )}
        value={activeFile?.content || ''}
        onChange={(e) => activeFile && onFileChange(activeFile.id, e.target.value)}
        spellCheck={false}
        readOnly={readOnly}
      />
    </Card>
  );
};

export default CodeEditor;