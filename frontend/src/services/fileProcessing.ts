import { toast } from 'sonner';
import axios from 'axios';
import { CodeAnalyzer } from '../utils/codeAnalyzer';
import { AIService } from '../utils/aiService';
import { useUser } from '@clerk/clerk-react';
import React from 'react';

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

export class FileProcessingService {
  private static readonly ALLOWED_EXTENSIONS = [
    '.js', '.ts', '.tsx', '.jsx', '.py', '.cpp', '.c', '.h', '.cs', '.java', '.rb', '.php',
    '.txt', '.csv', '.tsv', '.json', '.schema.json', '.parquet', '.yml', '.yaml', '.xml', '.toml', '.proto'
  ];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private userId: string;
  private codeAnalyzer: CodeAnalyzer;
  private aiService: AIService;

  constructor(userId: string) {
    this.userId = userId;
    this.codeAnalyzer = new CodeAnalyzer();
    this.aiService = new AIService();
  }

  async processAndUploadFile(file: File): Promise<ProcessedFile | null> {
    console.log('DEBUG: processAndUploadFile called in fileProcessing.ts', { fileName: file.name, fileType: file.type });
    try {
      if (!this.validateFile(file)) {
        console.log('DEBUG: File validation failed');
        return null;
      }

      const content = await this.readFileContent(file);
      const hash = await this.generateHash(content);

      const processedFile: ProcessedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        content,
        type: file.type,
        size: file.size,
        hash,
        timestamp: new Date(),
      };

      await this.performAdditionalProcessing(processedFile);
      const uploadResult = await this.uploadFile(processedFile, file);
      if (uploadResult) {
        toast.success(`Successfully uploaded ${file.name}`);
        return processedFile;
      } else {
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    } catch (error) {
      console.error('Error processing and uploading file:', error);
      toast.error('Failed to process and upload file');
      return null;
    }
  }

  private validateFile(file: File): boolean {
    if (file.size > FileProcessingService.MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      return false;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FileProcessingService.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast.error('Unsupported file type');
      return false;
    }

    return true;
  }

  private async readFileContent(file: File): Promise<string> {
    // Validate file input
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size
    if (file.size === 0 || !file.size) {
      throw new Error('File is empty or has invalid size');
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FileProcessingService.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new Error(`Unsupported file type: ${fileExtension}. Supported types: ${FileProcessingService.ALLOWED_EXTENSIONS.join(', ')}`);
    }
    try {
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            const timeoutId = setTimeout(() => {
              reader.abort();
              reject(new Error('File read timeout'));
            }, 30000); // 30 second timeout

            reader.onload = () => {
              clearTimeout(timeoutId);
              if (typeof reader.result === 'string') {
                // Check if content is empty or just whitespace
                if (!reader.result.trim()) {
                  reject(new Error('File is empty or contains only whitespace'));
                } else {
                  resolve(reader.result);
                }
              } else {
                reject(new Error('Invalid file content'));
              }
            };

            reader.onerror = () => {
              clearTimeout(timeoutId);
              reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
          });

          return content;
        } catch (error) {
          console.warn(`Attempt ${attempt + 1} failed:`, error);
          lastError = error;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }

      throw lastError || new Error('Failed to read file after multiple attempts');
    } catch (error) {
      console.error('File reading error:', error);
      throw error;
    }
  }

  private async generateHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async performAdditionalProcessing(file: ProcessedFile): Promise<void> {
    // Example: Code analysis for certain file types
    if (/\.(js|ts|jsx|tsx)$/.test(file.name)) {
      try {
        file.codeAnalysis = await this.codeAnalyzer.analyzeCode(file.content);
      } catch (err) {
        console.warn('Code analysis error:', err.message);
      }
    }

    // Example: AI analysis for all files
    try {
      file.aiAnalysis = await this.aiService.analyzeCode(file.content, file.name);
    } catch (err) {
      console.warn('AI analysis error:', err.message);
    }
  }

  private async uploadFile(file: ProcessedFile, originalFile: File): Promise<boolean> {
    try {
      const { LocalStorageService } = await import('./localStorageService');
      const response: { success: boolean; message?: string } = await LocalStorageService.saveFile(file);
      
      if (response.success) {
        console.log('File upload successful:', response);
        return true;
      } else {
        console.error('Upload failed:', response.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Axios error uploading file:', errorMessage);
        toast.error(`Error uploading ${originalFile.name}: ${errorMessage}`);
      } else {
        console.error('Error uploading file:', error);
        toast.error(`Error uploading ${originalFile.name}`);
      }
      return false;
    }
  }

  async getFile(fileId: string): Promise<ProcessedFile | null> {
    try {
      const { LocalStorageService } = await import('./localStorageService');
      const file = await LocalStorageService.getFile(fileId);
      return file;
    } catch (error) {
      console.error('Error getting file:', error);
      toast.error('Failed to get file');
      return null;
    }
  }
}

export function useFileProcessingService() {
  const { user } = useUser();
  return React.useMemo(() => new FileProcessingService(user?.id || 'anonymous'), [user?.id]);
}