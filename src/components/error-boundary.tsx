'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <p className="text-foreground font-medium">Something went wrong</p>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            An error occurred while loading this page. Please try again.
          </p>
          <Button onClick={() => this.setState({ hasError: false })} className="gradient-blue">
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
