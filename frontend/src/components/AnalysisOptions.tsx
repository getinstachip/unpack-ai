import React from 'react';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface AnalysisOptionsProps {
  options: {
    malware: boolean;
    security: boolean;
    gemini: boolean;
    promptInjection: boolean;
  };
  onOptionsChange: (options: {
    malware: boolean;
    security: boolean;
    gemini: boolean;
    promptInjection: boolean;
  }) => void;
}

export const AnalysisOptions: React.FC<AnalysisOptionsProps> = ({
  options,
  onOptionsChange,
}) => {
  const handleOptionChange = (key: keyof typeof options) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold mb-4">Analysis Options</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="malware"
            checked={options.malware}
            onCheckedChange={() => handleOptionChange('malware')}
          />
          <Label htmlFor="malware">Malware Analysis</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="security"
            checked={options.security}
            onCheckedChange={() => handleOptionChange('security')}
          />
          <Label htmlFor="security">Security Analysis</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="gemini"
            checked={options.gemini}
            onCheckedChange={() => handleOptionChange('gemini')}
          />
          <Label htmlFor="gemini">Gemini Code Analysis</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="promptInjection"
            checked={options.promptInjection}
            onCheckedChange={() => handleOptionChange('promptInjection')}
          />
          <Label htmlFor="promptInjection">Prompt Injection Analysis</Label>
        </div>
      </div>
    </Card>
  );
};