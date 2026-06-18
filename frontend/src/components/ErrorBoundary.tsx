import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-6 h-full min-h-[200px] flex flex-col items-center justify-center text-gray-500 border border-danger/20 bg-danger/5">
          <AlertOctagon size={48} className="mb-4 text-danger/70" />
          <h4 className="text-white font-medium mb-1">Component Failed to Load</h4>
          <p className="text-xs text-gray-400 text-center max-w-sm">
            {this.props.fallbackText || "An unexpected error occurred while rendering this module."}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
