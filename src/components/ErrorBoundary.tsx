import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { RdpApiError } from '../api/error';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isApiError = error instanceof RdpApiError;
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg w-full">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {isApiError ? 'API Error' : 'Application Error'}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {error?.message || 'An unexpected error occurred'}
                </p>
                {isApiError && (
                  <p className="mt-1 text-xs text-gray-400">
                    Error Code: {(error as RdpApiError).code}
                  </p>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}