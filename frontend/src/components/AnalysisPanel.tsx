import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, Zap } from 'lucide-react';

interface AnalysisPanelProps {
  onAnalyze: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onAnalyze }) => {
  return (
    <Card className="analysis-panel h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Analysis Results</h2>
        <Button onClick={onAnalyze} className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Analyze
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 animate-fade-in">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Potential Threats</h3>
            <p className="text-sm text-muted-foreground">
              No malicious patterns detected yet. Click analyze to begin.
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Cipher Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Upload or paste code to detect encryption methods.
            </p>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default AnalysisPanel;