import axios from 'axios';
import crypto from 'crypto';

export class HybridAnalysisAgent {
  private readonly apiUrl = 'https://www.hybrid-analysis.com/api/v2';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeFile(content: string): Promise<Record<string, unknown>> {
    try {
      const hash = this.calculateHash(content);
      
      // First check if analysis exists
      const existingReport = await this.getReport(hash);
      if (existingReport) {
        return this.processReport(existingReport);
      }

      // Submit new analysis
      const submissionId = await this.submitFile(content);
      await this.waitForAnalysis(submissionId);
      const report = await this.getReport(hash);
      
      return this.processReport(report);
    } catch (error) {
      console.error('Error in Hybrid Analysis:', error);
      return {
        error: 'Analysis failed',
        details: (error as Error).message
      };
    }
  }
  private calculateHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  private async submitFile(content: string): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([content], { type: 'application/octet-stream' });
    formData.append('file', blob);

    const response = await axios.post(
      `${this.apiUrl}/submit/file`,
      formData,
      {
        headers: {
          'api-key': this.apiKey,
          'accept': 'application/json'
        }
      }
    );

    return response.data.submit_id;
  }

  private async getReport(hash: string): Promise<Record<string, unknown>> {
    const response = await axios.get(
      `${this.apiUrl}/search/hash`,
      {
        params: { hash },
        headers: {
          'api-key': this.apiKey,
          'accept': 'application/json'
        }
      }
    );

    return response.data[0];
  }
  private async waitForAnalysis(submissionId: string): Promise<void> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const response = await axios.get(
        `${this.apiUrl}/report/${submissionId}/state`,
        {
          headers: {
            'api-key': this.apiKey,
            'accept': 'application/json'
          }
        }
      );

      if (response.data.state === 'SUCCESS') {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Analysis timed out');
  }

  private processReport(report: Record<string, unknown>): Record<string, unknown> {
    return {
      threatScore: (report.threat_score as number) || 0,
      verdict: report.verdict,
      malwareFamily: report.malware_family,
      tags: report.tags,
      processes: (report.processes as unknown[])?.length || 0,
      networkConnections: (report.network_connections as unknown[])?.length || 0,
      signatures: (report.signatures as Record<string, unknown>[])?.map((sig) => ({
        name: sig.name,
        severity: sig.severity,
        description: sig.description
      }))
    };
  }}