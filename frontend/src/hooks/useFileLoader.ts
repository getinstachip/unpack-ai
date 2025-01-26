import { useState, useEffect } from 'react';
import { ProcessedFile } from '@/components/FileUpload';
import { FileProcessingService } from '@/services/fileProcessing';
import { toast } from 'sonner';

export function useFileLoader(fileId: string | null) {
  const [file, setFile] = useState<ProcessedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFile() {
      if (!fileId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { LocalStorageService } = await import('@/services/localStorageService');
        const loadedFile = await LocalStorageService.getFile(fileId);
        
        if (!loadedFile) {
          throw new Error('File not found');
        }
        
        if (!loadedFile.content) {
          throw new Error('File content is empty');
        }
        
        setFile(loadedFile);
      } catch (err) {
        console.error('Error loading file:', err);
        setError(err instanceof Error ? err : new Error('Failed to load file'));
        toast.error('Failed to load file');
      } finally {
        setIsLoading(false);
      }
    }

    loadFile();
  }, [fileId]);

  return { file, isLoading, error };
}