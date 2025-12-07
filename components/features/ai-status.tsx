'use client';

interface AIStatusProps {
  status: 'idle' | 'processing' | 'error';
  message?: string;
}

export function AIStatus({ status, message }: AIStatusProps) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'processing') {
    return (
      <div className="p-4 border border-blue-300 rounded-lg bg-blue-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-blue-800">
            {message || 'Processing your request...'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-800">{message || 'An error occurred'}</p>
      </div>
    );
  }

  return null;
}

