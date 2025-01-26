import React from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Input } from './ui/input';

interface FileUploadButtonProps {
  onFileSelect: (files: FileList) => void;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileSelect }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files);
    }
  };

  return (
    <div className="relative">
      <Input
        type="file"
        multiple
        accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          type="button"
          asChild
        >
          <span>
            <Plus className="h-4 w-4" />
          </span>
        </Button>
      </label>
    </div>
  );
};