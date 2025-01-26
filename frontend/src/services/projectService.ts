import { v4 as uuidv4 } from 'uuid';

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: ProjectFile[];
  dateCreated: string;
  lastModified: string;
}

class ProjectService {
  private projects: Project[] = [];

  constructor() {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      this.projects = JSON.parse(savedProjects);
    }
  }

  private saveProjects(): void {
    localStorage.setItem('projects', JSON.stringify(this.projects));
  }

  createProject(name: string, description?: string): Project {
    const project: Project = {
      id: uuidv4(),
      name,
      description,
      files: [],
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.projects.push(project);
    this.saveProjects();
    return project;
  }

  addFilesToProject(projectId: string, newFiles: ProjectFile[]): void {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    project.files.push(...newFiles);
    project.lastModified = new Date().toISOString();
    this.saveProjects();
  }

  updateFile(projectId: string, fileId: string, content: string): void {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const file = project.files.find(f => f.id === fileId);
    if (!file) throw new Error('File not found');

    file.content = content;
    project.lastModified = new Date().toISOString();
    this.saveProjects();
  }

  getProject(projectId: string): Project | undefined {
    return this.projects.find(p => p.id === projectId);
  }

  getAllProjects(): Project[] {
    return this.projects;
  }

  deleteProject(projectId: string): void {
    const index = this.projects.findIndex(p => p.id === projectId);
    if (index === -1) throw new Error('Project not found');

    this.projects.splice(index, 1);
    this.saveProjects();
  }

  removeFileFromProject(projectId: string, fileId: string): void {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    project.files = project.files.filter(f => f.id !== fileId);
    project.lastModified = new Date().toISOString();
    this.saveProjects();
  }
}

export const projectService = new ProjectService();