import { useEffect } from 'react';

export function useTeachingFormProgress(isSubmitting, setProgress) {
  useEffect(() => {
    let interval;
    if (isSubmitting) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }, 300);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isSubmitting, setProgress]);
}
