import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useFileNavigation() {
  const navigate = useNavigate();

  const navigateToFile = (fileId: string) => {
    if (!fileId) {
      toast.error('Invalid file ID');
      return;
    }
    navigate(`/editor/${encodeURIComponent(fileId)}`);
  };

  return { navigateToFile };
}