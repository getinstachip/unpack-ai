import React from 'react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AnalysisResultsProps {
  results: {
    fileName: string;
    malwareAnalysis: {
      detections?: number;
      totalScans?: number;
      malwareType?: string;
      threatLevel?: string;
    };
    securityAnalysis: {
      vulnerabilities: Array<{
        type: string;
        message: string;
        line: number;
      }>;
      riskScore: number;
    };
    forensicsAnalysis: {
      suspiciousPatterns: string[];
      networkIndicators: string[];
      fileOperations: Record<string, unknown>;
    };
    patternAnalysis: {
      matches: Array<{
        pattern: string;
        similarity: number;
      }>;
      confidence: number;
    };
  };
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results }) => {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Analysis Results: {results.fileName}</h2>
      
      <Tabs defaultValue="malware">
        <TabsList>
          <TabsTrigger value="malware">Malware Analysis</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="gemini">Gemini Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="malware">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Malware Scan Results</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Detections:</span> {results.malwareAnalysis.detections}/{results.malwareAnalysis.totalScans}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Type:</span> {results.malwareAnalysis.malwareType || 'None detected'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Threat Level:</span>{' '}
                    <span className={
                      results.malwareAnalysis.threatLevel === 'High' ? 'text-red-500' :
                      results.malwareAnalysis.threatLevel === 'Medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }>
                      {results.malwareAnalysis.threatLevel || 'Low'}
                    </span>
                  </p>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="security">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Security Analysis</h3>
                <p className="text-sm mb-4">
                  Risk Score: <span className={
                    results.securityAnalysis.riskScore > 70 ? 'text-red-500' :
                    results.securityAnalysis.riskScore > 30 ? 'text-yellow-500' :
                    'text-green-500'
                  }>{results.securityAnalysis.riskScore}</span>
                </p>
                <div className="space-y-2">
                  {results.securityAnalysis.vulnerabilities.map((vuln, index) => (
                    <Card key={index} className="p-3 bg-muted">
                      <p className="text-sm font-medium mb-1">{vuln.type}</p>
                      <p className="text-sm">{vuln.message}</p>
                      <p className="text-sm text-muted-foreground">Line: {vuln.line}</p>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="gemini">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {results.geminiAnalysis && (
                <>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Overview</h3>
                    <p className="text-sm mb-4">{results.geminiAnalysis.summary}</p>
                    <p className="text-sm">
                      Overall Risk Level:{' '}
                      <span className={
                        results.geminiAnalysis.overallRiskLevel === 'High' ? 'text-red-500' :
                        results.geminiAnalysis.overallRiskLevel === 'Medium' ? 'text-yellow-500' :
                        'text-green-500'
                      }>
                        {results.geminiAnalysis.overallRiskLevel}
                      </span>
                    </p>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Vulnerabilities</h3>
                    <div className="space-y-2">
                      {results.geminiAnalysis.vulnerabilities.map((vuln, index) => (
                        <Card key={index} className="p-3 bg-muted">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium">{vuln.type}</p>
                            <span className={
                              vuln.severity === 'High' ? 'text-red-500' :
                              vuln.severity === 'Medium' ? 'text-yellow-500' :
                              'text-green-500'
                            }>
                              {vuln.severity}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{vuln.description}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Recommendation:</span> {vuln.recommendation}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </Card>

                  {results.geminiAnalysis.promptInjectionRisks.length > 0 && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Prompt Injection Risks</h3>
                      <div className="space-y-1">
                        {results.geminiAnalysis.promptInjectionRisks.map((risk, index) => (
                          <p key={index} className="text-sm text-yellow-500">{risk}</p>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};