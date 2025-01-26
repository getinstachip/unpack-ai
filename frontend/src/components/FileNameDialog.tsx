import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FileNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  title?: string;
}

export const FileNameDialog: React.FC<FileNameDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  title = 'Rename File'
}) => {
  const [fileName, setFileName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setFileName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSave = () => {
    if (fileName.trim()) {
      onSave(fileName.trim());
      setFileName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!fileName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};