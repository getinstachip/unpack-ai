import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';

interface ChatbotResponse {
  text: string;
  context?: {
    files?: string[];
    analysisResults?: Record<string, unknown>;
  };
}

class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private chat: ChatSession;
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      throw new Error('API key configuration missing - please set VITE_GEMINI_API_KEY in your environment');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    this.chat = this.model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are a code analysis assistant. You help users understand code security issues, vulnerabilities, and potential risks. You can analyze files and explain the results in a clear, concise way.' }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand my role as a code analysis assistant. I will help users by: 1. Analyzing code for security vulnerabilities and risks 2. Explaining analysis results in clear, understandable terms 3. Providing specific recommendations for improvements 4. Maintaining context of files and previous analyses 5. Guiding users on which analysis types would be most relevant I will format my responses to be clear and actionable, focusing on the most critical findings first.' }],
        },
      ],
    });
  }
  private async retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 1000): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (i > 0) {
          console.log(`Retry attempt ${i + 1}/${maxRetries}`);
        }
        const result = await fn();
        if (i > 0) {
          console.log('Request succeeded after retry');
        }
        return result;
      } catch (error) {
        const isLastAttempt = i === maxRetries - 1;
        if (isLastAttempt) throw error;
        
        const delay = Math.min(initialDelay * Math.pow(2, i), 10000);
        console.log(`Request failed, waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Retry failed');
  }

  async sendMessage(
    message: string,
    context?: {
      files?: Array<{ name: string; content: string }>;
      analysisResults?: Record<string, unknown>;
      conversationHistory?: string[];
    }
  ): Promise<ChatbotResponse> {
    try {
      let prompt = message;

      // Add context about files if available
      if (context?.files && context.files.length > 0) {
        prompt += '\n\nAvailable files:\n' + 
          context.files.map(f => `- ${f.name}`).join('\n');
      }

      // Add analysis results if available
      if (context?.analysisResults) {
        prompt += '\n\nAnalysis Results:\n' + JSON.stringify(context.analysisResults, null, 2);
      }

      const result = await this.retryWithBackoff(async () => {
        const res = await this.chat.sendMessage(prompt);
        if (!res || !res.response) {
          throw new Error('Invalid response from Gemini API');
        }
        return res.response.text();
      }, 5);

      const text = result;

      return {
        text,
        context: {
          files: context?.files?.map(f => f.name),
          analysisResults: context?.analysisResults
        }
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        // Wait a bit before showing error
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          text: "I apologize, but the AI service is currently experiencing high load. Please try again in a few moments.",
          context: {
            files: context?.files?.map(f => f.name),
            analysisResults: context?.analysisResults
          }
        };
      }
      return {
        text: "I encountered an error processing your request. Please try again or contact support if the issue persists.",
        context: {
          files: context?.files?.map(f => f.name),
          analysisResults: context?.analysisResults
        }
      };
    }
  }}

export const chatbotService = new ChatbotService();