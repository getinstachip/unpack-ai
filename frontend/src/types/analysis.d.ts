export interface ProcessedFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  hash: string;
  timestamp: Date;
  sandboxResult?: any;
  aiAnalysis?: AiAnalysisResult;
}

export interface AiAnalysisResult {
  summary: string;
  potentialThreats: string[];
  recommendations: string[];
}

export interface SandboxConfig {
  timeoutMs: number;
  maxMemoryMb: number;
  allowedApis: string[];
}