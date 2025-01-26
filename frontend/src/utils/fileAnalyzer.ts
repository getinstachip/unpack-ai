import * as esprima from 'esprima';
import { Project, SourceFile } from 'ts-morph';

interface FileAnalysis {
  imports: string[];
  exports: string[];
  functions: Array<{
    name: string;
    params: string[];
    isAsync: boolean;
    location: {
      line: number;
      column: number;
    };
  }>;
  dependencies: {
    internal: string[];
    external: string[];
  };
  complexityScore: number;
}

export class FileAnalyzer {
  private project: Project;

  constructor() {
    this.project = new Project();
  }

  analyzeTypeScript(content: string): FileAnalysis {
    const sourceFile = this.project.createSourceFile('temp.ts', content);
    
    const imports = this.getImports(sourceFile);
    const exports = this.getExports(sourceFile);
    const functions = this.getFunctions(sourceFile);
    const dependencies = this.getDependencies(imports);
    const complexityScore = this.calculateComplexity(sourceFile);

    sourceFile.forget();
    
    return {
      imports,
      exports,
      functions,
      dependencies,
      complexityScore
    };
  }

  analyzeJavaScript(content: string): FileAnalysis {
    const ast = esprima.parseModule(content, { loc: true });
    
    const imports = [];
    const exports = [];
    const functions = [];
    const dependencies = {
      internal: [],
      external: []
    };

    this.traverseAst(ast, (node) => {
      if (node.type === 'ImportDeclaration') {
        imports.push(node.source.value);
        if (node.source.value.startsWith('.')) {
          dependencies.internal.push(node.source.value);
        } else {
          dependencies.external.push(node.source.value);
        }
      }
      if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
        exports.push(node.declaration?.id?.name || 'default');
      }
      if (node.type === 'FunctionDeclaration') {
        functions.push({
          name: node.id.name,
          params: node.params.map((p: any) => p.name),
          isAsync: node.async,
          location: {
            line: node.loc.start.line,
            column: node.loc.start.column
          }
        });
      }
    });

    return {
      imports,
      exports,
      functions,
      dependencies,
      complexityScore: this.calculateJsComplexity(ast)
    };
  }

  private getImports(sourceFile: SourceFile): string[] {
    return sourceFile.getImportDeclarations().map(imp => imp.getModuleSpecifierValue());
  }

  private getExports(sourceFile: SourceFile): string[] {
    return sourceFile.getExportDeclarations().map(exp => {
      const namedExports = exp.getNamedExports();
      return namedExports.map(named => named.getName());
    }).flat();
  }

  private getFunctions(sourceFile: SourceFile): Array<{name: string; params: string[]; isAsync: boolean; location: {line: number; column: number}}> {
    return sourceFile.getFunctions().map(func => ({
      name: func.getName() || 'anonymous',
      params: func.getParameters().map(p => p.getName()),
      isAsync: func.isAsync(),
      location: {
        line: func.getStartLineNumber(),
        column: func.getStart()
      }
    }));
  }

  private getDependencies(imports: string[]): {internal: string[]; external: string[]} {
    return {
      internal: imports.filter(imp => imp.startsWith('.')),
      external: imports.filter(imp => !imp.startsWith('.'))
    };
  }

  private calculateComplexity(sourceFile: SourceFile): number {
    let complexity = 0;
    
    sourceFile.forEachDescendant(node => {
      if (node.getKind() === 207) complexity++; // if statement
      if (node.getKind() === 208) complexity++; // while statement
      if (node.getKind() === 209) complexity++; // for statement
      if (node.getKind() === 210) complexity++; // for in statement
      if (node.getKind() === 211) complexity++; // for of statement
    });

    return complexity;
  }

  private calculateJsComplexity(ast: any): number {
    let complexity = 0;

    this.traverseAst(ast, (node) => {
      if (
        node.type === 'IfStatement' ||
        node.type === 'WhileStatement' ||
        node.type === 'ForStatement' ||
        node.type === 'ForInStatement' ||
        node.type === 'ForOfStatement'
      ) {
        complexity++;
      }
    });

    return complexity;
  }

  private traverseAst(node: any, callback: (node: any) => void) {
    callback(node);
    
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            child.forEach(item => {
              if (item && typeof item === 'object') {
                this.traverseAst(item, callback);
              }
            });
          } else {
            this.traverseAst(child, callback);
          }
        }
      }
    }
  }
}