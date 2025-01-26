import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const ProjectNameDialog: React.FC<ProjectNameDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [projectName, setProjectName] = useState('');

  const handleSave = () => {
    if (projectName.trim()) {
      onSave(projectName.trim());
      setProjectName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name Your Project</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!projectName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};