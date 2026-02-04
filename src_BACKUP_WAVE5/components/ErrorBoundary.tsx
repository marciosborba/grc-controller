
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { logSuspiciousActivity } from '@/utils/securityLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log the error for security monitoring
    logSuspiciousActivity('application_error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href
    });

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">Ops! Algo deu errado</h3>
                    <p className="text-sm mt-1">
                      Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
                    </p>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-xs">
                      <summary className="cursor-pointer">Detalhes técnicos</summary>
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p><strong>Erro:</strong> {this.state.error.message}</p>
                        {this.state.error.stack && (
                          <pre className="mt-1 text-xs overflow-x-auto">
                            {this.state.error.stack}
                          </pre>
                        )}
                      </div>
                    </details>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={this.handleReset} variant="outline" size="sm">
                      Tentar Novamente
                    </Button>
                    <Button onClick={this.handleReload} size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Recarregar Página
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
