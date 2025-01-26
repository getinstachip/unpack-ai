import axios from 'axios';
import crypto from 'crypto';

export class VirusTotalAgent {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeFile(content: string): Promise<Record<string, unknown>> {
    const hash = this.calculateHash(content);
    try {
      // First check if file hash exists
      const existingReport = await this.getReport(hash);
      if (existingReport) {
        return this.processReport(existingReport);
      }

      // If not, submit the file for analysis
      const uploadUrl = await this.getUploadUrl();
      await this.uploadFile(uploadUrl, content);
      
      // Wait for analysis to complete and get results
      await this.waitForAnalysis(hash);
      const finalReport = await this.getReport(hash);
      return this.processReport(finalReport);
    } catch (error) {
      console.error('Error in VirusTotal analysis:', error);
      throw new Error('Failed to analyze file with VirusTotal');
    }
  }

  private calculateHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  private async getReport(hash: string): Promise<{ data: { attributes: { results: Record<string, { category: string }>; last_analysis_date: string }; id: string } }> {
    const response = await axios.get(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: {
        'x-apikey': this.apiKey
      }
    });
    return response.data;
  }
  private async getUploadUrl(): Promise<string> {
    const response = await axios.get('https://www.virustotal.com/api/v3/files/upload_url', {
      headers: {
        'x-apikey': this.apiKey
      }
    });
    return response.data.data;
  }

  private async uploadFile(uploadUrl: string, content: string): Promise<void> {
    const formData = new FormData();
    const blob = new Blob([content], { type: 'application/octet-stream' });
    formData.append('file', blob);

    await axios.post(uploadUrl, formData, {
      headers: {
        'x-apikey': this.apiKey
      }
    });
  }

  private async waitForAnalysis(hash: string, maxAttempts = 10): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.getReport(hash);
        if ('status' in response.data.attributes && response.data.attributes.status === 'completed') {
          return;
        }
      } catch (error) {
        // Continue if not found yet
      }
      await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds between attempts
    }
    throw new Error('Analysis timed out');
  }
  private processReport(report: { data: { attributes: { results: Record<string, { category: string }>, last_analysis_date: string }, id: string } }): Record<string, unknown> {
    const results = report.data.attributes.results;
    return {
      detections: results,
      totalEngines: Object.keys(results).length,
      positives: Object.values(results).filter((r: { category: string }) => r.category === 'malicious').length,
      scanDate: report.data.attributes.last_analysis_date,
      permalink: `https://www.virustotal.com/gui/file/${report.data.id}`
    };
  }
}