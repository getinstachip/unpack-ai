interface CodeAnalysisResult {
  type: "CodeAnalysis" | "EmptyAnalysis" | "Error";
  functions: string[];
  classes: string[];
  error?: string;
}

class CodeAnalyzer {
  private cleanCode(code: string): string {
    try {
      // Basic cleanup first
      let cleaned = code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '')
        .replace(/(['"`])((?:\\\1|(?!\1).))*\1/g, '""');

      cleaned = cleaned
        .replace(/^[\s\n]*(?:import|export)\s+.*?(?:[;\n]|$)/gm, '')
        .replace(/<[^>]+>[^<]*<\/[^>]+>/g, '')
        .replace(/<[^>]+\/?>/g, '')
        .replace(/:\s*(?:[\w\s<>[\]{}|&(),?]+)(?=[,);=\n])/g, '')
        .replace(/^[\s\n]*(?:interface|type)\s+[^{]*\{[\s\S]*?\}/gm, '') 
        .replace(/(?:public|private|protected|readonly)\s+/g, '')
        .replace(/@[\w()\s,'"]+/g, '')
        .replace(/[<>][\w\s,]*[<>]/g, '')
        .replace(/\{[^{}]*\}/g, '{}');

      return cleaned;
    } catch (e) {
      console.error('Error cleaning code:', e);
      return '';
    }
  }

  private extractFunctionNames(code: string): string[] {
    const names: Set<string> = new Set();
    try {
      const cleanedCode = this.cleanCode(code);
      
      const funcDecl = cleanedCode.matchAll(/function\s+([A-Za-z$_][\w$]*)\s*\(/g);
      for (const match of funcDecl) {
        names.add(match[1]);
      }

      const funcExpr = cleanedCode.matchAll(/(?:const|let|var)\s+([A-Za-z$_][\w$]*)\s*=\s*(?:async\s+)?function\s*\(/g);
      for (const match of funcExpr) {
        names.add(match[1]);
      }

      const arrowFuncs = cleanedCode.matchAll(/(?:const|let|var)\s+([A-Za-z$_][\w$]*)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g);
      for (const match of arrowFuncs) {
        names.add(match[1]);
      }
    } catch (e) {
      console.warn('Error extracting function names:', e);
    }
    return Array.from(names);
  }

  private extractClassNames(code: string): string[] {
    const names: Set<string> = new Set();
    try {
      const cleanedCode = this.cleanCode(code);
      
      // Class declarations
      const classDecl = cleanedCode.matchAll(/class\s+([A-Za-z$_][\w$]*)[^{]*/g);
      for (const match of classDecl) {
        const name = match[1];
        if (!name.includes('React') && !name.endsWith('Component')) {
          names.add(name);
        }
      }
    } catch (e) {
      console.warn('Error extracting class names:', e);
    }
    return Array.from(names);
  }

  analyzeCode(code: string): CodeAnalysisResult {
    try {
      const cleanedCode = this.cleanCode(code);
      if (!cleanedCode) {
        return { type: "Error", functions: [], classes: [], error: "Failed to process code" };
      }

      const functions = this.extractFunctionNames(cleanedCode);
      const classes = this.extractClassNames(cleanedCode);

      return {
        type: functions.length > 0 || classes.length > 0 ? "CodeAnalysis" : "EmptyAnalysis",
        functions,
        classes
      };
    } catch (error) {
      console.error('Code analysis error:', error);
      return {
        type: "Error",
        functions: [],
        classes: [],
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

export const codeAnalyzer = new CodeAnalyzer();