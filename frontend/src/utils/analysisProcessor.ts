import { FileAnalyzer } from './fileAnalyzer';

interface ProcessedAnalysis {
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

export class AnalysisProcessor {
  private fileAnalyzer: FileAnalyzer;

  constructor() {
    this.fileAnalyzer = new FileAnalyzer();
  }

  processResults(results: any[]): ProcessedAnalysis {
    const processed: ProcessedAnalysis = {
      overview: {
        totalFiles: results.length,
        totalVulnerabilities: 0,
        riskScore: 0,
        suspiciousFiles: []
      },
      fileResults: {}
    };

    results.forEach(result => {
      const fileResult = {
        malware: {
          isDetected: result.malwareAnalysis.detections > 0,
          confidence: (result.malwareAnalysis.detections / result.malwareAnalysis.totalScans) * 100 || 0,
          type: result.malwareAnalysis.malwareType
        },
        security: {
          vulnerabilities: result.securityAnalysis.vulnerabilities,
          riskScore: result.securityAnalysis.riskScore
        },
        patterns: {
          matches: result.patternAnalysis.matches,
          confidence: result.patternAnalysis.confidence
        }
      };

      processed.fileResults[result.fileName] = fileResult;

      // Update overview stats
      processed.overview.totalVulnerabilities += fileResult.security.vulnerabilities.length;
      processed.overview.riskScore = Math.max(processed.overview.riskScore, fileResult.security.riskScore);
      
      if (fileResult.malware.isDetected || fileResult.security.riskScore > 70) {
        processed.overview.suspiciousFiles.push(result.fileName);
      }
    });

    return processed;
  }

  async analyzeFile(content: string, filename: string): Promise<any> {
    const analysis = filename.endsWith('.ts') || filename.endsWith('.tsx')
      ? this.fileAnalyzer.analyzeTypeScript(content)
      : this.fileAnalyzer.analyzeJavaScript(content);

    return {
      ...analysis,
      filename,
      metrics: {
        complexity: analysis.complexityScore,
        dependencies: {
          internal: analysis.dependencies.internal.length,
          external: analysis.dependencies.external.length
        },
        functions: analysis.functions.length
      }
    };
  }
}