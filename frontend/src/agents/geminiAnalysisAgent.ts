import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface GeminiAnalysisResult {
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
}

export class GeminiAnalysisAgent {
  private model: GenerativeModel;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  async analyzeCode(content: string, context?: { fileHistory?: string[], conversationHistory?: string[] }): Promise<GeminiAnalysisResult> {
    const prompt = `
      Analyze the following code for security vulnerabilities, potential risks, and prompt injection vulnerabilities.
      Consider the following aspects:
      1. Security vulnerabilities and weaknesses
      2. Potential prompt injection risks
      3. Code quality and best practices
      4. Specific security concerns based on the file type and content
      ${context?.fileHistory ? '\nRelated files context:\n' + context.fileHistory.join('\n') : ''}
      ${context?.conversationHistory ? '\nConversation history:\n' + context.conversationHistory.join('\n') : ''}
      
      Code to analyze:
      ${content}
      
      Provide a detailed analysis in the following JSON format:
      {
        "summary": "Brief overview of findings",
        "vulnerabilities": [
          {
            "type": "vulnerability type",
            "description": "detailed description",
            "severity": "Low|Medium|High",
            "recommendation": "how to fix"
          }
        ],
        "securityRisks": ["list of security risks"],
        "promptInjectionRisks": ["list of potential prompt injection vulnerabilities"],
        "overallRiskLevel": "Low|Medium|High"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in the response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      return analysis as GeminiAnalysisResult;
    } catch (error) {
      console.error('Error in Gemini analysis:', error);
      throw new Error('Failed to analyze code with Gemini');
    }
  }

  async analyzeBatch(files: { name: string; content: string }[], context?: { conversationHistory?: string[] }): Promise<Record<string, GeminiAnalysisResult>> {
    const results: Record<string, GeminiAnalysisResult> = {};
    
    for (const file of files) {
      const fileHistory = files
        .filter(f => f.name !== file.name)
        .map(f => `${f.name}: ${f.content.substring(0, 200)}...`);
        
      results[file.name] = await this.analyzeCode(file.content, {
        fileHistory,
        conversationHistory: context?.conversationHistory
      });
    }
    
    return results;
  }
}