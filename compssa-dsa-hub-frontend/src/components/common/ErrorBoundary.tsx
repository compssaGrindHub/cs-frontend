import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You could send this to an error reporting service
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    if (this.props.onReset) this.props.onReset();
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <div className="p-6">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Something went wrong</p>
                <p className="text-xs text-muted-foreground">An unexpected error occurred. You can try again.</p>
              </div>
              <Button onClick={this.handleReset} className="bg-primary text-primary-foreground">
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
