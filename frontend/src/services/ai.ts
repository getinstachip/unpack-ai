import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface AiAnalysisResult {
  summary: string;
  potentialThreats: string[];
  recommendations: string[];
  context?: {
    files: string[];
    relevantSnippets: Array<{
      file: string;
      code: string;
      explanation: string;
    }>;
  };
  analysisResults?: Record<string, unknown>;
}

class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeCode(code: string, filename: string, context?: { fileReferences?: string[] }): Promise<AiAnalysisResult> {
    try {
      const prompt = `
        Analyze the following code from file "${filename}":
        
        ${code}
        
        Please provide:
        1. A brief summary of what the code does
        2. Any potential security threats or vulnerabilities
        3. Recommendations for improvements
        
        Format the response as JSON with keys: summary, potentialThreats (array), recommendations (array)
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } 
      catch {
        return {
          summary: response,
          potentialThreats: [],
          recommendations: []
        };
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }}

export const aiService = new AiService();