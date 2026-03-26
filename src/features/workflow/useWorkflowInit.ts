import { useEffect, useState } from 'react';
import { workflowService } from './workflow.service';
import { AppError, Result } from '../../core/types/result';

export function useWorkflowInit(): { isInitialized: boolean; error: AppError | null } {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    const init = async () => {
      const result = await workflowService.init();
      if (result.ok) {
        setIsInitialized(true);
      } else {
        setError(result.error);
      }
    };

    init();
  }, []);

  return { isInitialized, error };
}
