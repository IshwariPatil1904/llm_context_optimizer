import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-5 text-rose-200 my-4 flex items-start gap-4">
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-bold text-rose-300">Engine Exception / Request Failed</h4>
        <p className="text-xs text-rose-300/80 mt-1 font-mono">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 rounded text-xs font-medium border border-rose-700 transition-colors"
          >
            Retry Execution
          </button>
        )}
      </div>
    </div>
  );
};
