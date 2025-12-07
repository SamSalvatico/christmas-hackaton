'use client';

import { useState } from 'react';
import { AIInput } from '@/components/features/ai-input';
import { AIOutput } from '@/components/features/ai-output';
import { AIStatus } from '@/components/features/ai-status';

interface ApiResponse {
  success: boolean;
  result?: string;
  error?: {
    message: string;
    code?: string;
    retryable: boolean;
  };
  metadata?: {
    serviceId: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
    timestamp: number;
  };
}

export default function AIPage() {
  const [result, setResult] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ApiResponse['metadata'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');

  const handleSubmit = async (prompt: string) => {
    setStatus('processing');
    setError(null);
    setResult(null);
    setMetadata(null);

    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: 'demo-ai',
          prompt,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.result) {
        setResult(data.result);
        setMetadata(data.metadata || null);
        setStatus('idle');
      } else if (data.error) {
        setError(data.error.message);
        setStatus('error');
      } else {
        setError('Unknown error occurred');
        setStatus('error');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process AI request'
      );
      setStatus('error');
    }
  };

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">AI Processing</h1>
        <p className="text-lg mb-8 text-gray-600">
          Process data using AI services
        </p>

        <div className="space-y-6">
          <AIInput onSubmit={handleSubmit} isLoading={status === 'processing'} />

          {status !== 'idle' && (
            <AIStatus
              status={status}
              message={status === 'processing' ? 'Processing your request...' : error || undefined}
            />
          )}

          {result && metadata && (
            <AIOutput result={result} metadata={metadata} />
          )}
        </div>
      </div>
    </main>
  );
}

