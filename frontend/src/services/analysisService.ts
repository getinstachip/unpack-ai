import { HybridAnalysisAgent, MalshareAgent, VirusTotalAgent } from '@/agents';
import { GeminiAnalysisAgent } from '@/agents/geminiAnalysisAgent';interface AnalysisResults {
  fileName: string;
  virusTotalAnalysis: Record<string, unknown>;
  hybridAnalysis: Record<string, unknown>;
  malshareAnalysis: Record<string, unknown>;
  summary?: string;
}
class AnalysisService {
  private virusTotalAgent: VirusTotalAgent;
  private hybridAnalysisAgent: HybridAnalysisAgent;
  private malshareAgent: MalshareAgent;
  private geminiAgent: GeminiAnalysisAgent;

  constructor() {
    this.virusTotalAgent = new VirusTotalAgent(import.meta.env.VITE_VIRUSTOTAL_API_KEY || '');
    this.hybridAnalysisAgent = new HybridAnalysisAgent(import.meta.env.HYBRID_ANALYSIS_KEY || '');
    this.malshareAgent = new MalshareAgent(import.meta.env.MALSHARE_API_KEY || '');
    this.geminiAgent = new GeminiAnalysisAgent(import.meta.env.VITE_GEMINI_API_KEY || '');
  }

  async analyzeFile(
    fileName: string, 
    content: string, 
    options: {
      malware: boolean;
      security: boolean;
      gemini: boolean;
      promptInjection: boolean;
    },
    context?: { conversationHistory?: string[] }
  ): Promise<AnalysisResults> {
    const analysisPromises: Promise<unknown>[] = [];
    
    if (options.malware) {
      analysisPromises.push(
        this.virusTotalAgent.analyzeFile(content),
        this.malshareAgent.checkHash(content),
        this.hybridAnalysisAgent.analyzeFile(content)
      );
    }

    if (options.security || options.gemini || options.promptInjection) {
      analysisPromises.push(
        this.geminiAgent.analyzeCode(content, { conversationHistory: context?.conversationHistory })
      );
    }

    const results = await Promise.all(analysisPromises);
    
    let resultIndex = 0;
    const analysisResult: AnalysisResults = {
      fileName,
      virusTotalAnalysis: {},
      hybridAnalysis: {},
      malshareAnalysis: {}
    };

    if (options.malware) {
      analysisResult.virusTotalAnalysis = results[resultIndex++] as Record<string, unknown>;
      analysisResult.malshareAnalysis = results[resultIndex++] as Record<string, unknown>;
      analysisResult.hybridAnalysis = results[resultIndex++] as Record<string, unknown>;
    }

    if (options.security || options.gemini || options.promptInjection) {
      const geminiResult = results[resultIndex++] as {
        vulnerabilities?: unknown[];
        promptInjectionRisks?: unknown[];
        summary?: string;
      };
      
      // Create a summary based on the analysis options
      const summaryParts: string[] = [];
      
      if (options.security && geminiResult.vulnerabilities && geminiResult.vulnerabilities.length > 0) {
        summaryParts.push(`Security vulnerabilities found: ${geminiResult.vulnerabilities.length}`);
      }
      
      if (options.promptInjection && geminiResult.promptInjectionRisks && geminiResult.promptInjectionRisks.length > 0) {
        summaryParts.push(`Prompt injection risks found: ${geminiResult.promptInjectionRisks.length}`);
      }
      
      if (geminiResult.summary) {
        summaryParts.push(geminiResult.summary);
      }
      
      if (summaryParts.length > 0) {
        analysisResult.summary = summaryParts.join('\n\n');
      }
    }

    return analysisResult;
  }
  async analyzeBatch(    files: { name: string; content: string }[],
    options: {
      malware: boolean;
      security: boolean;
      gemini: boolean;
      promptInjection: boolean;
    },
    context?: { conversationHistory?: string[] }
  ): Promise<AnalysisResults[]> {
    return Promise.all(
      files.map(file => this.analyzeFile(file.name, file.content, options, context))
    );
  }
}

export const analysisService = new AnalysisService();