
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-headline font-bold mb-2">Khalad ayaa dhacay.</h1>
          <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
            Waxaa dhacay khalad aan la fileyn. Fadlan dib u tijaabi ama soo cusbooneysii barnaamijka.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="rounded-full px-8 h-12 font-bold"
          >
            Reload App
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
