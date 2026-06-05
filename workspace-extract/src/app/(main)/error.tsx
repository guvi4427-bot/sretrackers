'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
      <AlertTriangle className="w-10 h-10 text-amber-400" />
      <p className="text-foreground font-medium">Something went wrong</p>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        {error?.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="gradient-blue">
          Try Again
        </Button>
        <Button onClick={() => window.location.href = '/home'} variant="outline">
          Go Home
        </Button>
      </div>
    </div>
  );
}
