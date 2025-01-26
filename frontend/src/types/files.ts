export interface ProcessedFile {
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
