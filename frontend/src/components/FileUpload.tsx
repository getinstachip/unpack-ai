import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useFileProcessingService } from '@/services/fileProcessing';
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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadProps {
  onFileUpload: (files: ProcessedFile[]) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, setIsProcessing }) => {
  const fileProcessingService = useFileProcessingService();

  const processFiles = useCallback(async (files: File[]) => {
    if (!files.length) return [];
    
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            return await fileProcessingService.processAndUploadFile(file);
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            toast.error(`Failed to process ${file.name}`);
            return null;
          }
        })
      );
      return results.filter((file): file is ProcessedFile => file !== null);
    } catch (error) {
      console.error('Error in processFiles:', error);
      toast.error('Failed to process files');
      return [];
    }
  }, [fileProcessingService]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) {
      toast.error('No files selected');
      return;
    }

    console.log('DEBUG: onDrop called with:', acceptedFiles);
    setIsProcessing(true);
    if (acceptedFiles.some(file => !file)) {
      console.error('Invalid file object received');
      setIsProcessing(false);
      return;
    }

    try {
      toast.info(`Processing ${acceptedFiles.length} files...`);
      console.log('DEBUG: Starting file processing in FileUpload.tsx');
      
      const validFiles = acceptedFiles.filter(file => file.size <= MAX_FILE_SIZE);
      if (validFiles.length !== acceptedFiles.length) {
        toast.error('Some files were too large (max 10MB)');
      }
      
      const processedFiles = await processFiles(validFiles);
      
      if (processedFiles.length === 0) {
        toast.error('No files were successfully processed. Please check file format and content.');
        console.error('File processing failed - no valid files found');
        return;
      }
      
      toast.success(`Successfully processed ${processedFiles.length} files`);
      console.log('DEBUG: Calling onFileUpload with processed files');
      onFileUpload(processedFiles);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload, setIsProcessing, processFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'text/typescript-jsx': ['.tsx'],
      'text/jsx': ['.jsx'],
      'text/x-python': ['.py'],
      'text/x-c': ['.c', '.cpp', '.h'],
      'text/x-csharp': ['.cs'],
      'text/x-java': ['.java'],
      'text/x-ruby': ['.rb'],
      'text/x-php': ['.php'],
      'text/plain': ['.txt', '.csv', '.tsv'],
      'application/json': ['.json'],
      'application/schema+json': ['.schema.json'],
      'application/x-parquet': ['.parquet'],
      'application/x-yaml': ['.yml', '.yaml'],
      'application/xml': ['.xml'],
      'text/csv': ['.csv'],
      'application/toml': ['.toml'],
      'application/x-protobuf': ['.proto']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        'hover:border-primary hover:bg-primary/5'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <Upload className="w-10 h-10 text-muted-foreground" />
        <p className="text-lg text-gray-600">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-gray-400">
          or click to select files
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supported files: Programming (.js, .ts, .py, .cpp, .java, etc) and Data (.json, .csv, .yaml, etc) files (Max 10MB)
        </p>
      </div>
    </div>
  );
};