import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'sonner';
interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  timestamp: number;
}

interface Project {
  name: string;
  url: string;
  description: string;
  uploadedAt: string;
}

interface ProjectListProps {
  onProjectSelect: (project: ProcessedFile) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect }) => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const handleProjectClick = async (project: Project) => {
    try {
      const { LocalStorageService } = await import('../services/localStorageService');
      const processedFile = LocalStorageService.getFile(project.url);
      if (!processedFile) {
        throw new Error('File not found in storage');
      }
      onProjectSelect({
        ...processedFile,
        timestamp: processedFile.timestamp instanceof Date ? processedFile.timestamp.getTime() : processedFile.timestamp
      });
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error(`Failed to load project: ${project.name}`);
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { LocalStorageService } = await import('../services/localStorageService');
        const files = LocalStorageService.getFiles();
        const projectList = files.map(file => ({
          name: file.name,
          url: file.id, // Using ID as URL since we'll fetch from localStorage
          description: `${file.type} file - ${Math.round(file.size / 1024)}KB`,
          uploadedAt: file.timestamp.toString()
        }));
        setProjects(projectList);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Your Projects</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Your Projects</h3>
        <Card className="p-6 text-center text-muted-foreground">
          No projects uploaded yet. Upload your first file to get started!
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Your Projects</h3>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <Card 
            key={index} 
            className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => handleProjectClick(project)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.description || 'No description'}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(project.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
