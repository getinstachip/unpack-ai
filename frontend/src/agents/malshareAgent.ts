import axios from 'axios';
import crypto from 'crypto';

// MalShare provides free malware samples and hash checking
export class MalshareAgent {
  private readonly apiUrl = 'https://malshare.com/api.php';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async checkHash(content: string): Promise<{ found: boolean; matches: { [key: string]: string }[]; md5?: string; sha1?: string; sha256?: string; type?: string; ssdeep?: string; sources?: string[] } | null> {
    const hash = this.calculateHash(content);
    
    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          api_key: this.apiKey,
          action: 'details',
          hash
        }
      });

      return this.processHashResult(response.data);
    } catch (error) {
      console.error('Error checking hash:', error);
      return null;
    }
  }

  async getYaraRules(): Promise<string[]> {
    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          api_key: this.apiKey,
          action: 'getlist'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting YARA rules:', error);
      return [];
    }
  }

  private calculateHash(content: string): string {
    return crypto
      .createHash('md5')
      .update(content)
      .digest('hex');
  }

  private processHashResult(data: { MD5?: string; SHA1?: string; SHA256?: string; TYPE?: string; SSDEEP?: string; SOURCES?: string[]; ERROR?: string }): { found: boolean; matches: { [key: string]: string }[]; md5?: string; sha1?: string; sha256?: string; type?: string; ssdeep?: string; sources?: string[] } {
    if (!data || data.ERROR) {
      return {
        found: false,
        matches: []
      };
    }

    return {
      found: true,
      matches: [],
      md5: data.MD5,
      sha1: data.SHA1,
      sha256: data.SHA256,
      type: data.TYPE,
      ssdeep: data.SSDEEP,
      sources: data.SOURCES
    };
  }
}