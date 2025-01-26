import React, { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { AnalyzeButton } from './AnalyzeButton';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { File, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from './ui/card';

interface FileExplorerProps {
  files: Array<{
    id: string;
    name: string;
    content: string;
  }>;
  projectId?: string;
  projectName?: string;
  onAnalysisComplete: (results: AnalysisResult) => void;
  onFileSelect?: (fileId: string) => void;
}

interface AnalysisResult {
  // Define the structure of your analysis results here
  // For example:
  fileId: string;
  issues: Array<{
    type: string;
    message: string;
    line: number;
  }>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  projectId,
  projectName,
  onAnalysisComplete,
  onFileSelect
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);

  const toggleSelection = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedFiles(prev =>
      prev.length === files.length ? [] : files.map(f => f.id)
    );
  };

  const handleFileClick = (fileId: string) => {
    onFileSelect?.(fileId);
  };

  const handleAnalysisComplete = (results: { name: string; content: string; }[]) => {
    const analysisResult: AnalysisResult = {
      fileId: results[0]?.name || '',
      issues: []
    };
    onAnalysisComplete(analysisResult);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{projectName || 'Files'}</h2>
            <p className="text-sm text-muted-foreground">{files.length} files</p>
          </div>
        </div>
        <div className="flex gap-2">
          <AnalyzeButton
            projectId={projectId}
            selectedFiles={selectedFiles}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      </div>

      {expanded && (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectedFiles.length === files.length && files.length > 0}
                onClick={toggleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm text-muted-foreground">
                {selectedFiles.length} of {files.length} selected
              </label>
            </div>

            {files.map(file => (
              <Card
                key={file.id}
                className="flex items-center gap-2 p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => handleFileClick(file.id)}
              >
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onClick={(e) => toggleSelection(file.id, e)}
                />
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{file.name}</span>
              </Card>
            ))}

            {files.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No files in this project. Click the + button above to add files.
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};