import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '@/components/FileUpload';
import { ProjectList } from '@/components/ProjectList';
import { AnalysisOptions } from '@/components/AnalysisOptions';
// ChatInterface moved to CodeEditor page
import { analysisService } from '@/services/analysisService';
import type { ProcessedFile } from '@/components/FileUpload';

export default function Analysis() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileUpload = async (files: ProcessedFile[]) => {
    console.log('Handling file upload...');
    try {
      if (!files.length) {
        toast.error('No files to process');
        return;
      }

      const file = files[0];
      if (!file.id || !file.content) {
        throw new Error('Invalid file data');
      }

      // Check for empty content
      if (!file.content.trim()) {
        throw new Error('File is empty or contains only whitespace');
      }

      setIsProcessing(true);

      // Save file to localStorage before navigation
      const { LocalStorageService } = await import('@/services/localStorageService');
      await LocalStorageService.saveFile(file);

      // Show success message
      toast.success(`Successfully processed ${file.name}`);

      // Navigate to editor
      navigate(`/editor/${encodeURIComponent(file.id)}`);
    } catch (error) {
      console.error('Error handling file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  // Only handle file uploads and navigation from dashboard
  const [loadingError, setLoadingError] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Code Analysis Dashboard</h1>
      {loadingError && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md mb-6">
          {loadingError}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FileUpload onFileUpload={handleFileUpload} setIsProcessing={setIsProcessing} />
          {/* Analysis options moved to CodeEditor page */}
          <ProjectList onProjectSelect={async (project) => {
            if (project.id) {
              try {
                const { LocalStorageService } = await import('@/services/localStorageService');
                const file = await LocalStorageService.getFile(project.id);
                if (file) {
                  navigate(`/editor/${encodeURIComponent(project.id)}`);
                } else {
                  throw new Error('File not found');
                }
              } catch (error) {
                console.error('Error opening file:', error);
                toast.error('Failed to open file');
              }
            } else {
              toast.error("Invalid project selected");
            }
          }} />
        </div>
        <div className="h-[calc(100vh-10rem)]">
          {/* ChatInterface moved to CodeEditor page */}
        </div>
      </div>
    </div>
  );
}