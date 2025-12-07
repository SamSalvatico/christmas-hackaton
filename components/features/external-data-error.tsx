'use client';

interface ExternalDataErrorProps {
  message: string;
  retryable?: boolean;
  onRetry?: () => void;
}

export function ExternalDataError({
  message,
  retryable = false,
  onRetry,
}: ExternalDataErrorProps) {
  return (
    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
      <p className="text-red-600 mb-2">{message}</p>
      {retryable && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

