import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { analysisService } from '@/services/analysisService';
import { projectService } from '@/services/projectService';

interface AnalyzeButtonProps {
  projectId?: string;
  selectedFiles: string[];
  onAnalysisComplete: (results: { name: string; content: string }[]) => void;
}

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  projectId,
  selectedFiles,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const project = projectId ? await projectService.getProject(projectId) : null;
      const filesToAnalyze = project
        ? project.files.filter(f => selectedFiles.includes(f.id))
        : [];

      const results = await analysisService.analyzeBatch(
        filesToAnalyze.map(f => ({
          name: f.name,
          content: f.content
        })),
        {
          malware: true,
          security: true,
          gemini: false,
          promptInjection: false
        }
      );

      const formattedResults = results.map(result => ({
        name: result.fileName,
      }));

      toast.success('Analysis complete');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing || selectedFiles.length === 0}
      variant={selectedFiles.length === 0 ? "outline" : "default"}
      className="w-full md:w-auto"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : selectedFiles.length === 0 ? (
        <>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Select Files to Analyze
        </>
      ) : (
        `Analyze ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`
      )}
    </Button>
  );
};