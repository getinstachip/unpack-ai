# Code Editor Component Documentation

## Overview
The code editor component in Unpack.ai provides a powerful interface for reviewing and analyzing code files. It supports multiple file types and integrates with our security analysis tools.

## Features
- Multi-file editing with tabs
- Syntax highlighting for multiple languages
- File upload support via drag & drop or button
- Integration with security analysis tools
- Project-based file organization

## Components
### CodeEditor
The main editor component that handles:
- File display and editing
- Tab management
- File uploads
- Syntax highlighting

### FileExplorer
Provides file management features:
- File selection for analysis
- Project file organization
- Bulk operations on files

### AnalysisResults
Displays security analysis results including:
- Malware detection results
- Security vulnerabilities
- Code patterns and forensics
- Network indicators

## Usage
### Adding Files
1. Use the + button in the editor
2. Drag & drop files into the editor
3. Import files through project creation

### Running Analysis
1. Select files in the explorer
2. Click "Analyze Files" button
3. View results in the analysis panel

### File Reference in Chat
Use @ mentions to reference files in the chat:
```
@filename.js what security issues exist in this file?
```

## Supported File Types
- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Python (.py)
- Java (.java)
- C/C++ (.c, .cpp)
- Go (.go)
- Ruby (.rb)
- PHP (.php)

## Security Features
- Real-time security scanning
- Integration with multiple security APIs
- Pattern matching against known malware
- Code quality analysis
- Digital forensics tools