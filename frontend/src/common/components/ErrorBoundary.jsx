import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

// Error Boundary - Catch and handle React errors gracefully
// Why? Prevent entire app crash when component errors occur
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6">
            {/* Error Icon */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-error/10 flex items-center justify-center">
                <AlertTriangle size={48} className="text-error" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-2">
              <h1 className="font-headline text-display-sm text-on-surface">
                Something went wrong
              </h1>
              <p className="text-body-md text-on-surface-variant">
                We encountered an unexpected error. Please try refreshing the page or return to home.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-surface-container rounded-xl p-4 max-h-60 overflow-y-auto">
                <p className="text-label-md text-error font-semibold mb-2">
                  Error Details (Development Only):
                </p>
                <pre className="text-label-sm text-on-surface-variant whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-label-sm text-on-surface-variant whitespace-pre-wrap break-words mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<RefreshCw size={20} />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                icon={<Home size={20} />}
                onClick={this.handleGoHome}
              >
                Go to Home
              </Button>
            </div>

            {/* Support Message */}
            <p className="text-center text-label-sm text-on-surface-variant">
              If the problem persists, please contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
