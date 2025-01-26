import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';
import { aiService } from '@/services/ai';
import { chatbotService } from '@/services/chatbot';

interface Message {
  text: string;
  isUser: boolean;
  fileReferences?: string[];
  analysisResults?: Record<string, { [key: string]: string | number | boolean | object }>;
}

interface ChatInterfaceProps {
  onAnalysisRequest?: (files: string[], options: {
    malware: boolean;
    security: boolean;
    gemini: boolean;
    promptInjection: boolean;
  }) => Promise<Record<string, { [key: string]: string | number | boolean | object }>>;
  selectedFiles?: Array<{ name: string; content: string }>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAnalysisRequest, selectedFiles }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    text: `Welcome! I can help you analyze your code for:
- Security vulnerabilities and weaknesses
- Potential malware patterns
- Prompt injection risks
- General code quality issues

You can:
1. Upload files using the upload button
2. Select which analysis types to run
3. Use "@filename" to reference specific files in our conversation
4. Ask me to explain any analysis results

Type your questions or commands to get started!`,
    isUser: false,
    fileReferences: []
  }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const extractFileReferences = (text: string): string[] => {
    const matches = text.match(/@[\w.-]+/g);
    return matches ? matches.map(match => match.slice(1)) : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      const fileRefs = extractFileReferences(userMessage);
      setMessage('');
      setMessages(prev => [...prev, { 
        text: userMessage, 
        isUser: true,
        fileReferences: fileRefs
      }]);
      setIsLoading(true);

      try {
        const isAnalysisRequest = /\b(analyze|scan|check|examine)\b/i.test(userMessage);
        
        if (isAnalysisRequest && fileRefs.length > 0 && onAnalysisRequest) {
          // Get the existing conversation history
          const conversationHistory = messages.map(m => m.text);
          
          // Run the analysis
          const analysisResults = await onAnalysisRequest(fileRefs, {
            malware: true,
            security: true,
            gemini: true,
            promptInjection: true
          });

          // Get chatbot's interpretation of results
          const response = await chatbotService.sendMessage(
            `Please analyze these results and explain any security concerns: ${userMessage}`,
            {
              files: selectedFiles,
              analysisResults,
              conversationHistory
            }
          );

          setMessages(prev => [...prev, { 
            text: response.text, 
            isUser: false,
            fileReferences: fileRefs,
            analysisResults
          }]);
        } else {
          // Regular chat interaction
          const response = await chatbotService.sendMessage(
            userMessage,
            {
              files: selectedFiles,
              conversationHistory: messages.map(m => m.text)
            }
          );
          
          setMessages(prev => [...prev, { 
            text: response.text,
            isUser: false,
            fileReferences: fileRefs
          }]);
        }
      } 
      catch (error) {
        console.error('Error getting AI response:', error);
        setMessages(prev => [
                ...prev,
                {
                  text: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
                  isUser: false
                }
              ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <Card key={index} className={`p-3 ${msg.isUser ? 'bg-primary/10 ml-8' : 'bg-secondary mr-8'}`}>
              <div className="space-y-2">
                <p className="text-sm">
                  {msg.text.split(/(@[\w.-]+)/).map((part, i) => {
                    if (part.startsWith('@')) {
                      return <span key={i} className="text-blue-500 font-medium cursor-pointer hover:underline">{part}</span>;
                    }
                    return part;
                  })}
                </p>
                {msg.analysisResults && (
                  <div className="mt-4 bg-muted/50 rounded-md p-3">
                    <p className="text-xs font-semibold mb-2">Analysis Results</p>
                    {Object.entries(msg.analysisResults).map(([file, result]) => (
                      <div key={file} className="text-xs">
                        <p className="font-medium">{file}:</p>
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.fileReferences && msg.fileReferences.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.fileReferences.map((file, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20">
                      {file}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about the code or analysis..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatInterface;