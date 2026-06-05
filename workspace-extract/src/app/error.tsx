'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-2">
        An unexpected error occurred. Please try again or refresh the page.
      </p>
      {error?.message && (
        <p className="text-xs text-red-400/80 text-center max-w-md mb-4 font-mono bg-red-950/20 px-3 py-2 rounded-lg">
          {error.message}
        </p>
      )}
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
