export interface AnalysisResult {
  fileName: string;
  malwareAnalysis?: {
    detections?: number;
    totalScans?: number;
    malwareType?: string;
    threatLevel?: string;
  };
  securityAnalysis?: {
    vulnerabilities: Array<{
      type: string;
      message: string;
      line: number;
    }>;
    riskScore: number;
  };
  geminiAnalysis?: {
    summary: string;
    vulnerabilities: Array<{
      type: string;
      description: string;
      severity: 'Low' | 'Medium' | 'High';
      recommendation: string;
    }>;
    securityRisks: string[];
    promptInjectionRisks: string[];
    overallRiskLevel: 'Low' | 'Medium' | 'High';
  };
  virusTotalAnalysis?: Record<string, unknown>;
  hybridAnalysis?: Record<string, unknown>;
  malshareAnalysis?: Record<string, unknown>;
  summary?: string;
}

export interface ProcessedAnalysis {
  overview: {
    totalFiles: number;
    totalVulnerabilities: number;
    riskScore: number;
    suspiciousFiles: string[];
  };
  fileResults: Record<string, {
    malware: {
      isDetected: boolean;
      confidence: number;
      type?: string;
    };
    security: {
      vulnerabilities: Array<{
        severity: string;
        description: string;
        location?: { line: number; column: number; };
      }>;
      riskScore: number;
    };
    patterns: {
      matches: Array<{
        pattern: string;
        similarity: number;
      }>;
      confidence: number;
    };
  }>;
}