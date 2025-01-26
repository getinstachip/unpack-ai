import React, { useState, useCallback } from 'react';
import { FileUpload } from '@/components/FileUpload';
import CodeEditor from '@/components/CodeEditor';
import { FileExplorer } from '@/components/FileExplorer';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import AnalysisPanel from '@/components/AnalysisPanel';
import { useNavigate } from 'react-router-dom';
import { ProjectList } from '@/components/ProjectList';
import { toast } from 'sonner';
import { LoadingView } from './LoadingView';
import { ProjectNameDialog } from '@/components/ProjectNameDialog';

interface ProcessedFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  hash: string;
  timestamp: Date;
  codeAnalysis?: unknown;
  aiAnalysis?: unknown;
}

interface ProjectListProps {
  onProjectSelect: (project: ProcessedFile) => void;
}

interface FileNode extends Partial<ProcessedFile> {
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

const Analysis = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileUpload = useCallback((processedFiles: ProcessedFile[]) => {
    console.log('DEBUG: handleFileUpload called');
    
    // Clear previous state
    setSelectedFile(null);
    setFiles([]);
    console.log('DEBUG: Received processed files:', processedFiles);
    
    if (!Array.isArray(processedFiles) || processedFiles.length === 0) {
      console.error('No valid files received');
      return;
    }

    try {
      setPendingFiles(processedFiles);
      setIsProjectNameDialogOpen(true);
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to process files');
    }
  }, []);

  const handleFileSelect = useCallback((fileId: string) => {
    if (!fileId) {
      console.error('Invalid file ID');
    return;
    }
    
    console.log('DEBUG: Selected file with ID:', fileId);
    setSelectedFile(files.find(f => f.path === fileId) || null);

  }, [files]);

  const handleCodeChange = useCallback(async (fileId: string, newCode: string) => {
    const file = files.find(f => f.path === fileId);
    if (!file) {
      console.error('No valid file found for code change');
      return;
    }

    console.log('DEBUG: Updating code for file:', file.name);
    const updatedFiles = files.map(f =>
      f.path === fileId ? { ...f, content: newCode } : f
    );
    setFiles(updatedFiles);

    // Auto-save to localStorage
    const { LocalStorageService } = await import('../services/localStorageService');
    LocalStorageService.updateFile(fileId, {
      ...file,
      content: newCode,
      id: file.id || fileId,
      name: file.name || '',
      size: file.size || 0,
      hash: file.hash || '',
      timestamp: file.timestamp || new Date(),
    });
  }, [files]);
  const [isProjectNameDialogOpen, setIsProjectNameDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<ProcessedFile[]>([]);

  const handleProjectNameSave = useCallback((name: string) => {
    if (pendingFiles.length > 0) {
      const fileNodes = pendingFiles.map(file => ({
        ...file,
        type: 'file' as const,
        path: file.name,
        children: [],
        projectName: name
      }));

      setFiles(fileNodes);
      setSelectedFile(fileNodes[0]);
      setIsFileUploaded(true);
      setPendingFiles([]);
      setIsProjectNameDialogOpen(false);
    }
  }, [pendingFiles]);

  const handleProjectSelect = useCallback((project: ProcessedFile) => {
    const fileNode: FileNode = {
      ...project,
      type: 'file',
      path: project.name,
      children: []
    };

    setFiles([fileNode]);
    setSelectedFile(fileNode);
    setIsFileUploaded(true);
  }, []);

  const handleFileRename = useCallback(async (file: FileNode, newName: string) => {
    const fileExtension = file.name.split('.').pop() || '';
    const newFileName = `${newName}.${fileExtension}`;
    
    const updatedFiles = files.map(f =>
      f.path === file.path ? { ...f, name: newFileName, path: newFileName } : f
    );
    setFiles(updatedFiles);
    
    if (selectedFile?.path === file.path) {
      setSelectedFile({ ...file, name: newFileName, path: newFileName });
    }

    // Update in localStorage
    const { LocalStorageService } = await import('../services/localStorageService');
    LocalStorageService.updateFile(file.path, {
      ...file,
      name: newFileName,
      id: file.id || file.path,
      content: file.content || '',
      size: file.size || 0,
      hash: file.hash || '',
      timestamp: file.timestamp || new Date(),
    } as ProcessedFile);
  }, [files, selectedFile]);
  const handleFileDelete = useCallback(async (file: FileNode) => {
    const updatedFiles = files.filter(f => f.path !== file.path);
    setFiles(updatedFiles);
    
    if (selectedFile?.path === file.path) {
      setSelectedFile(updatedFiles[0] || null);
    }

    // Delete from localStorage
    const { LocalStorageService } = await import('../services/localStorageService');
    LocalStorageService.deleteFile(file.path);
  }, [files, selectedFile]);

  return (
    <div className="min-h-screen bg-background">
      <ProjectNameDialog
        isOpen={isProjectNameDialogOpen}
        onClose={() => setIsProjectNameDialogOpen(false)}
        onSave={handleProjectNameSave}
      />
      {isProcessing ? (
        <LoadingView />
      ) : !isFileUploaded ? (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-muted-foreground mb-4 text-center">
              Upload Your Code
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Upload your files to begin the analysis process. Our AI agents will help you understand and analyze the code.
            </p>
            <FileUpload 
              onFileUpload={handleFileUpload}
              setIsProcessing={setIsProcessing}
            />
          </div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={15} minSize={10}>
            <FileExplorer
              files={files.map(f => ({
                id: f.id || f.path,
                name: f.name || '',
                content: f.content || '',
                ...f
              }))}
              onFileSelect={handleFileSelect}
              onAnalysisComplete={(results) => console.log('Analysis complete:', results)}
            />
          </ResizablePanel>
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="h-screen p-4">
              <CodeEditor
                files={files.map(f => ({
                  id: f.path,
                  name: f.name || '',
                  content: f.content || '',
                  language: f.name?.split('.').pop() || 'text'
                }))}
                activeFileId={selectedFile?.path || null}
                onFileChange={handleCodeChange}
                onFileSelect={(fileId) => {
                  const file = files.find(f => f.path === fileId);
                  if (file) handleFileSelect(file.path);
                }}
                onFileClose={(fileId) => {
                  const file = files.find(f => f.path === fileId);
                  if (file) handleFileDelete(file);
                }}
              />
            </div>
          </ResizablePanel>
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full p-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Ready to Analyze</h3>
                <p className="text-muted-foreground mb-4">Click a file to open it in the code editor where you can use all analysis tools</p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );

};export default Analysis;