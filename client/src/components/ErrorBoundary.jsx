import React from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could log this to a service like Sentry
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 text-left p-4 bg-gray-100 rounded overflow-auto max-h-40 text-sm text-red-600">
                {this.state.error?.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reload Page
            </button>
            <div className="mt-4">
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
