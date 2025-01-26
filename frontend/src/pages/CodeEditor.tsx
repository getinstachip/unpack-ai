import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { toast } from 'sonner';
import CodeEditorComponent from '@/components/CodeEditor';
import { FileExplorer } from '@/components/FileExplorer';
import AnalysisPanel from '@/components/AnalysisPanel';
import ChatInterface from '@/components/ChatInterface';
import { useFileLoader } from '@/hooks/useFileLoader';
import { analysisService } from '@/services/analysisService';

interface FileNode {
  id: string;
  name: string;
  content: string;
  type: string;
  path: string;
  children?: FileNode[];
}

const CodeEditorPage: React.FC = () => {
  // Track if initial file load was attempted
  const [loadAttempted, setLoadAttempted] = useState(false);
  // Get fileId from URL if present
  const { fileId } = useParams<{ fileId: string }>();
  const decodedFileId = fileId ? decodeURIComponent(fileId) : '';
  const { file, isLoading, error } = useFileLoader(decodedFileId);

  React.useEffect(() => {
    if (error && loadAttempted) {
      toast.error(error.message);
    }
    if (!loadAttempted) {
      setLoadAttempted(true);
    }
  }, [error, loadAttempted]);

  React.useEffect(() => {
    if (file) {
      setFiles([{
        id: file.id,
        name: file.name,
        content: file.content,
        type: file.type,
        path: file.name
      }]);
      setSelectedFile({
        id: file.id,
        name: file.name,
        content: file.content,
        type: file.type,
        path: file.name
      });
    }
  }, [file]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const handleFileSelect = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setSelectedFile(file);
    }
  }, [files]);

  const handleCodeChange = useCallback((fileId: string, newContent: string) => {
    setFiles(prevFiles => 
      prevFiles.map(f => 
        f.id === fileId ? { ...f, content: newContent } : f
      )
    );
  }, []);

  const handleAnalysisRequest = async (fileNames: string[], options: { 
    malware: boolean;
    security: boolean;
    gemini: boolean;
    promptInjection: boolean;
  }) => {
    const filesToAnalyze = files.filter(file => fileNames.includes(file.name));
    return await analysisService.analyzeBatch(
      filesToAnalyze.map(f => ({
        name: f.name,
        content: f.content
      })), 
      options
    );
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-background">
      {isLoading || !loadAttempted ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !file && error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Failed to load file</h2>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={15} minSize={10}>
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onAnalysisComplete={(results) => console.log('Analysis complete:', results)}
          />
        </ResizablePanel>
        <ResizablePanel defaultSize={45} minSize={30}>
          <CodeEditorComponent
            files={files}
            activeFileId={selectedFile?.id || null}
            onFileChange={handleCodeChange}
            onFileSelect={handleFileSelect}
            onFileClose={(fileId) => {
              setFiles(prev => prev.filter(f => f.id !== fileId));
              if (selectedFile?.id === fileId) {
                setSelectedFile(null);
              }
            }}
          />
        </ResizablePanel>
        <ResizablePanel defaultSize={40} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <div className="h-full p-4">
                <AnalysisPanel onAnalyze={() => console.log('Analyzing...')} />
              </div>
            </ResizablePanel>
            <ResizablePanel defaultSize={40}>
              <div className="h-full p-4">
                <ChatInterface
                  onAnalysisRequest={handleAnalysisRequest}
                  selectedFiles={files.map(f => ({
                    name: f.name,
                    content: f.content
                  }))}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default CodeEditorPage;