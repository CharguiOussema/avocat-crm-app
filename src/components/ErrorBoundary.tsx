/**
 * Error Boundary Component
 * Catches React errors in the component tree and displays a fallback UI
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { Result, Button } from "antd";
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { logError } from "../utils/errorHandling";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary to catch and handle React errors
 * Provides a fallback UI when errors occur in the component tree
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development and to logging service in production
    logError(error, "React Error Boundary");
    logError(errorInfo.componentStack, "Component Stack");

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback && errorInfo) {
        return fallback(error, errorInfo);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try reloading the page or contact support if the problem persists."
            extra={[
              <Button
                key="reload"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>,
            ]}
          >
            {import.meta.env.DEV && (
              <div className="mt-4 text-left">
                <details className="bg-gray-100 p-4 rounded">
                  <summary className="cursor-pointer font-semibold mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs overflow-auto">
                    <strong>Error:</strong> {error.toString()}
                    {"\n\n"}
                    <strong>Stack Trace:</strong>
                    {"\n"}
                    {error.stack}
                    {errorInfo?.componentStack && (
                      <>
                        {"\n\n"}
                        <strong>Component Stack:</strong>
                        {"\n"}
                        {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return children;
  }
}
